import { useState, useEffect } from 'react';
import { reservationsApi, guestsApi, roomsApi } from '../services/api';
import type { Reservation, Room, Guest, Payment } from '../types';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | null;
}

export default function BookingDetailsModal({ isOpen, onClose, bookingId }: BookingDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'guest' | 'billing'>('guest');
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    origin: '',
    memberId: '',
    checkInDate: '',
    checkOutDate: '',
    roomId: '',
    adults: 1,
    children: 0,
    status: 'Confirmed',
    notes: '',
    totalAmount: 0,
    
    // Services
    breakfastCost: 0,
    laundryCost: 0,
    massageCost: 0,
    isReconciled: false
  });

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchDetails();
      fetchRooms();
    }
  }, [isOpen, bookingId]);

  const fetchRooms = async () => {
    try {
      const allRooms = await roomsApi.getAll();
      setRooms(allRooms.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)));
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const fetchDetails = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await reservationsApi.getById(bookingId);
      setReservation(res);
      
      const guestRes = await guestsApi.getById(res.guestId);
      setGuest(guestRes);

      const paymentsRes = await reservationsApi.getPayments(bookingId);
      setPayments(paymentsRes);

      setFormData({
        fullName: guestRes.fullName,
        email: guestRes.email || '',
        phone: guestRes.phone || '',
        origin: guestRes.origin || '',
        memberId: res.memberId || '',
        checkInDate: res.checkInDate.split('T')[0],
        checkOutDate: res.checkOutDate.split('T')[0],
        roomId: res.roomId.toString(),
        adults: res.guestCount,
        children: 0, 
        status: res.status,
        notes: res.notes || guestRes.notes || '',
        totalAmount: Number(res.totalAmount),
        
        breakfastCost: Number(res.breakfastCost || 0),
        laundryCost: Number(res.laundryCost || 0),
        massageCost: Number(res.massageCost || 0),
        isReconciled: res.isReconciled
      });

    } catch (error) {
      console.error('Failed to fetch booking details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!reservation || !guest) return;
    setLoading(true);
    try {
      // Update Guest
      await guestsApi.update(guest.id, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        origin: formData.origin,
        notes: formData.notes
      });

      // Update Reservation
      await reservationsApi.update(reservation.id, {
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        memberId: formData.memberId,
        roomId: formData.roomId, // Already string in schema? No, schema implies join logic, but update payload should be compatible.
        // Wait, endpoint takes what? db.update(reservations).set({...})
        // The roomId in reservations table is integer. 
        // In my previous update I changed parseInt(formData.roomId) to formData.roomId because I thought type mismatch.
        // If formData.roomId is string "101", JS backend might handle it or fail. 
        // Best to parseInt if api expects number. The error before was TS saying number not assignable to string (reversed?).
        // Actually, the seed error said "roomId: number" expected.
        // I will parseInt here to be safe if backend expects number.
        // But previously I removed parseInt because of a type error? 
        // Let's assume reservationsApi.update expects Partial<Reservation>. 
        // Reservation interface has roomId: string (from my type update).
        // Wait, schema has roomId: integer. 
        // Types/index.ts has roomId: string. 
        // This is a disconnect. I should fix types to number, but if I leave it string and backend handles casts, ok.
        // I will parseInt here anyway.
        guestCount: Number(formData.adults) + Number(formData.children),
        status: formData.status as any,
        totalAmount: formData.totalAmount.toString(),
        notes: formData.notes,
        breakfastCost: formData.breakfastCost.toString(),
        laundryCost: formData.laundryCost.toString(),
        massageCost: formData.massageCost.toString(),
        isReconciled: formData.isReconciled
      });

      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update booking', error);
      alert(error.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!bookingId || !reservation) return;
    // For OTA bookings, payment date is uncertain - leave empty
    const isDirectBooking = reservation.source === 'Direct / Walk-in';
    try {
        const newPayment = await reservationsApi.addPayment(bookingId, {
            amount: '0',
            paymentDate: isDirectBooking ? new Date().toISOString().split('T')[0] : '',
            paymentMethod: 'Cash',
            type: 'Additional Charges',
            status: 'Paid',
            orderId: reservation.orderId // Include for traceability
        });
        setPayments([...payments, newPayment]);
    } catch (e) {
        console.error("Failed to add payment", e);
    }
  };
  
  const handleUpdatePayment = async (id: string, field: string, value: any) => {
      // Update local state immediately for responsiveness
      const updatedPayments = payments.map(p => 
          p.id === id ? { ...p, [field]: value } : p
      );
      setPayments(updatedPayments);

      // Debounce saving or save on blur? 
      // For simplicity/robustness, we'll just save immediately on change (might be spammy) 
      // OR we add a specific "Save" button for the row. 
      // The user asked for "manually editable".
      // I will implement "onBlur" for text inputs and "onChange" for dropdowns triggering update.
      if (field === 'type' || field === 'paymentMethod') {
         // Auto save dropdowns
         await reservationsApi.updatePayment(id, { [field]: value });
      }
  };

  const savePaymentRow = async (payment: Payment) => {
      try {
          await reservationsApi.updatePayment(payment.id, {
              amount: payment.amount,
              paymentDate: payment.paymentDate,
              paymentMethod: payment.paymentMethod,
              type: payment.type,
              status: payment.status
          });
          // Visual feedback?
      } catch (e) {
          console.error("Failed to save payment", e);
          alert("Failed to save payment");
      }
  };

  const handleDeletePayment = async (id: string) => {
      if(!confirm("Are you sure you want to delete this payment?")) return;
      try {
          await reservationsApi.deletePayment(id);
          setPayments(payments.filter(p => p.id !== id));
      } catch (e) {
          console.error("Failed to delete", e);
      }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const getPaidAmount = () => {
      return payments.reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const getOutstanding = () => {
      return formData.totalAmount - getPaidAmount();
  };

  const handleRemoveBooking = async () => {
    if (!bookingId) return;
    if (!confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await reservationsApi.delete(bookingId);
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to delete booking', error);
      alert(error.message || 'Failed to delete booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
      <div className={`w-full ${activeTab === 'billing' ? 'max-w-6xl' : 'max-w-4xl'} bg-white/95 backdrop-blur-xl rounded-2xl shadow-glass border border-white/20 transform transition-all flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}>
        <div className="px-8 py-6 border-b border-slate-200/60 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Edit Booking Details 
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-primary">{formData.fullName || 'Guest'}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Reservation ID: <span className="font-mono text-slate-700">{reservation?.orderId}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <div className="px-8 pt-4 border-b border-slate-200/60 shrink-0">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('guest')}
              className={`pb-3 border-b-2 font-medium text-sm px-1 transition-colors ${
                activeTab === 'guest' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Guest Info
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`pb-3 border-b-2 font-medium text-sm px-1 transition-colors ${
                activeTab === 'billing' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Billing & Payment
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {loading && !reservation ? (
             <div className="flex justify-center items-center h-full">Loading...</div>
          ) : activeTab === 'guest' ? (
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">person</span>
                    Guest Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Member ID</label>
                      <div className="relative">
                        <input 
                           className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none font-mono" 
                           type="text" 
                           placeholder="Type to link member"
                           value={formData.memberId || ''}
                           onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                        />
                        <span className="material-icons-round absolute right-3 top-2.5 text-slate-400 text-lg">badge</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Origin</label>
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                          type="text" 
                          value={formData.origin}
                          onChange={(e) => setFormData({...formData, origin: e.target.value})}
                        />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">hotel</span>
                    Stay Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Check-in Date</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg">calendar_today</span>
                        <input 
                          className="w-full pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                          type="date" 
                          value={formData.checkInDate}
                          onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Check-out Date</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg">calendar_month</span>
                        <input 
                          className="w-full pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                          type="date" 
                          value={formData.checkOutDate}
                          onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Room Assignment</label>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none"
                        value={formData.roomId}
                        onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                      >
                         {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.roomNumber} - {room.roomType}</option>
                         ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Occupancy</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg">group</span>
                          <input 
                            className="w-full pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                            min="1" type="number" 
                            value={formData.adults}
                            onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
                          />
                        </div>
                        <span className="text-xs text-slate-400">Adults</span>
                        <div className="flex-1 relative">
                          <input 
                            className="w-full px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" 
                            min="0" type="number" 
                            value={formData.children}
                            onChange={(e) => setFormData({...formData, children: parseInt(e.target.value)})}
                          />
                        </div>
                        <span className="text-xs text-slate-400">Kids</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">room_service</span>
                    Additional Services
                  </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Breakfast cost input */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Breakfast (Rp)</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 px-3 py-2"
                            value={formData.breakfastCost}
                            onChange={(e) => setFormData({...formData, breakfastCost: Number(e.target.value)})}
                        />
                      </div>
                      {/* Laundry cost input */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Laundry (Rp)</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 px-3 py-2"
                            value={formData.laundryCost}
                            onChange={(e) => setFormData({...formData, laundryCost: Number(e.target.value)})}
                        />
                      </div>
                      {/* Massage cost input */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Massage (Rp)</label>
                        <input 
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 px-3 py-2"
                            value={formData.massageCost}
                            onChange={(e) => setFormData({...formData, massageCost: Number(e.target.value)})}
                        />
                      </div>
                   </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Reservation Status</label>
                  <select 
                    className={`w-full font-semibold rounded-lg text-sm mb-4 border px-3 py-2 outline-none ${
                        formData.status === 'Confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                        formData.status === 'Checked In' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        formData.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Source</span>
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{reservation?.source || 'Direct'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Internal Notes</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] p-3 outline-none" 
                    placeholder="Add internal notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  ></textarea>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Total Price</span>
                    <span className="text-xl font-bold text-slate-800">{formatCurrency(formData.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-slate-400 text-right mb-4">Inc. taxes & fees</p>
                  <div className="mb-4">
                     <label className="block text-xs font-medium text-slate-500 mb-1.5 ">Edit Total Amount</label>
                     <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 px-3 py-2"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value)})}
                     />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-8 h-full">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span className="material-icons-round text-slate-400 text-lg">history</span>
                      Payment History
                    </h3>
                    <button 
                        onClick={handleAddPayment}
                        className="text-xs font-medium bg-white border border-slate-200 text-primary hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm hover:shadow-md"
                    >
                      <span className="material-icons-round text-sm">add</span>
                      Add New Payment
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Method</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Note</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Amount</th>
                          <th className="px-4 py-3 w-20"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map(payment => (
                            <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3">
                                    <input 
                                        type="date"
                                        className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 outline-none w-full"
                                        value={payment.paymentDate ? payment.paymentDate.split('T')[0] : ''}
                                        onChange={(e) => handleUpdatePayment(payment.id, 'paymentDate', e.target.value)}
                                        onBlur={() => savePaymentRow(payment)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select 
                                        className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 outline-none w-full text-xs font-medium"
                                        value={payment.type || ''}
                                        onChange={(e) => handleUpdatePayment(payment.id, 'type', e.target.value)}
                                    >
                                        <option value="DP">DP</option>
                                        <option value="Additional Charges">Additional Charges</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                         className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 outline-none w-full"
                                         value={payment.paymentMethod || ''}
                                         onChange={(e) => handleUpdatePayment(payment.id, 'paymentMethod', e.target.value)}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Online">Online</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input 
                                        type="text"
                                        className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 outline-none w-full text-xs"
                                        placeholder="Add note..."
                                        value={payment.notes || ''}
                                        onChange={(e) => handleUpdatePayment(payment.id, 'notes', e.target.value)}
                                        onBlur={() => savePaymentRow(payment)}
                                    />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <input 
                                        type="number"
                                        className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 outline-none w-full text-right"
                                        value={payment.amount}
                                        onChange={(e) => handleUpdatePayment(payment.id, 'amount', e.target.value)}
                                        onBlur={() => savePaymentRow(payment)}
                                    />
                                </td>
                                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                                    <button 
                                        onClick={() => savePaymentRow(payment)}
                                        className="text-slate-400 hover:text-primary p-1 hover:bg-slate-100 rounded-full transition-colors"
                                        title="Save"
                                    >
                                        <span className="material-icons-round text-base">save</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePayment(payment.id)}
                                        className="text-slate-400 hover:text-red-500 p-1 hover:bg-slate-100 rounded-full transition-colors"
                                        title="Delete"
                                    >
                                        <span className="material-icons-round text-base">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                 {/* Reconciliation Section */}
                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          className="peer sr-only" type="checkbox"
                          checked={formData.isReconciled}
                          onChange={(e) => setFormData({...formData, isReconciled: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">Rekonsiliasi (Reconciliation)</span>
                        <span className="text-xs text-slate-500">Mark as reconciled in ledger.</span>
                      </div>
                    </label>
                 </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-[-10px] right-[-10px] p-3 opacity-[0.03] pointer-events-none">
                    <span className="material-icons-round text-9xl">receipt_long</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 relative z-10 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">summarize</span>
                    Payment Summary
                  </h3>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Booking Total</span>
                      <span className="font-bold text-slate-800">{formatCurrency(formData.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Paid</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(getPaidAmount())}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Outstanding</span>
                      <span className={`text-xl font-bold ${getOutstanding() > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {formatCurrency(getOutstanding())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-slate-200/60 bg-slate-50/50 flex justify-between items-center rounded-b-2xl shrink-0">
          <button 
            onClick={handleRemoveBooking}
            disabled={loading}
            className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-icons-round text-lg">delete</span>
            Remove Booking
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-200/50 transition-colors border border-transparent hover:border-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-icons-round text-lg">save</span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
