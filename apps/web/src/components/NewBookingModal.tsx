import { useState, useRef, useEffect } from 'react';
import { roomsApi, reservationsApi } from '../services/api';
import type { Room } from '../types';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomMultiSelectProps {
  options: string[];
  label: string;
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
}

const CustomMultiSelect = ({ options, label, defaultSelected = [], onChange }: CustomMultiSelectProps) => {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state with props if defaultSelected changes
  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    let newSelected;
    if (selected.includes(option)) {
      newSelected = selected.filter(item => item !== option);
    } else {
      newSelected = [...selected, option];
    }
    setSelected(newSelected);
    onChange?.(newSelected);
    // Keep open for multiple selection
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selected.filter(item => item !== option);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg min-h-[44px] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm cursor-pointer flex flex-wrap gap-2 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 && <span className="text-gray-400">{label}</span>}
        {selected.map(item => (
          <span key={item} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1">
            {item}
            <span 
              className="material-icons-round text-[14px] hover:text-red-500 cursor-pointer"
              onClick={(e) => removeOption(item, e)}
            >
              close
            </span>
          </span>
        ))}
        <div className="flex-1"></div>
        <span className="material-icons-round text-gray-400 text-[20px]">expand_more</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 space-y-1">
          {options.map(option => (
            <div 
              key={option}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => toggleOption(option)}
            >
              <div className={`size-5 rounded border flex items-center justify-center transition-colors ${selected.includes(option) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                  {selected.includes(option) && <span className="material-icons-round text-white text-[16px]">check</span>}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-200">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NewBookingModal({ isOpen, onClose }: NewBookingModalProps) {
  const [activeTab, setActiveTab] = useState<'guest' | 'notes'>('guest');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formattedRoomOptions, setFormattedRoomOptions] = useState<string[]>([]);
  
  // Form State
  const [orderId, setOrderId] = useState('');
  const [guestDetails, setGuestDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    origin: '',
    memberId: '',
  });
  const [stayDetails, setStayDetails] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    selectedRooms: [] as string[], // Stores labels like "101 - Twin Bed"
    adults: 2,
    children: 0,
    specialRequest: '',
  });
  const [notes, setNotes] = useState('');
  const [billingDetails, setBillingDetails] = useState({
    source: 'Booking.com',
    rateAmount: 0,
    taxAmount: 0,
    serviceAmount: 0,
    reservationStatus: 'Confirmed',
    paymentStatus: 'Deposit Paid (DP)',
    paymentAmount: 0, // For DP
    paymentDate: new Date().toISOString().split('T')[0],
    isReconciled: false,
    extraServiceCosts: {
      breakfast: 0,
      lateCheckout: 0,
      extraBed: 0,
      laundry: 0
    }
  });

  // Calculate Total
  const totalAmount = billingDetails.rateAmount + billingDetails.taxAmount + billingDetails.serviceAmount;

  // Generate Order ID and Fetch Rooms on open
  useEffect(() => {
    if (isOpen) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      setOrderId(`#RES-${dateStr}-${randomStr}`);
      fetchRooms();
    }
  }, [isOpen]);

  const fetchRooms = async () => {
    try {
      const fetchedRooms = await roomsApi.getAll();
      const sortedRooms = fetchedRooms.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber));
      setRooms(sortedRooms);
      setFormattedRoomOptions(sortedRooms.map(r => `${r.roomNumber} - ${r.roomType}`));
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const handleSave = async () => {
    if (!stayDetails.selectedRooms.length) {
      alert('Please select a room');
      return;
    }
    
    setLoading(true);
    try {
      // Calculate amounts per room
      // Assumption: Rate, Tax, Service entered are PER ROOM.
      // Payment: If Total DP is entered, split it across rooms.
      const roomCount = stayDetails.selectedRooms.length;
      let paymentPerRoom = 0;

      if (billingDetails.paymentStatus === 'Deposit Paid (DP)') {
        // Split DP evenly, handle remainder on first room? Or just floor it.
        // Simple division for MVP.
        paymentPerRoom = billingDetails.paymentAmount ? Math.floor(billingDetails.paymentAmount / roomCount) : 0;
      } else if (billingDetails.paymentStatus === 'Fully Paid (Lunas)') {
         // Full payment means standard total per room
         paymentPerRoom = totalAmount; // This will trigger 'Paid' status in backend logic
      }

      await Promise.all(stayDetails.selectedRooms.map(async (selectedLabel, index) => {
        const selectedRoom = rooms.find(r => `${r.roomNumber} - ${r.roomType}` === selectedLabel);
        if (!selectedRoom) throw new Error(`Invalid room selection: ${selectedLabel}`);

        // Unique Order ID for each room if multiple
        const specificOrderId = roomCount > 1 ? `${orderId}-${index + 1}` : orderId;

        const payload = {
          // Guest
          fullName: guestDetails.fullName,
          email: guestDetails.email,
          phone: guestDetails.phone,
          origin: guestDetails.origin,
          memberId: guestDetails.memberId,
          notes: notes,
  
          // Reservation
          roomId: selectedRoom.id,
          orderId: specificOrderId,
          checkInDate: stayDetails.checkInDate,
          checkOutDate: stayDetails.checkOutDate,
          status: billingDetails.reservationStatus,
          source: billingDetails.source,
          guestCount: Number(stayDetails.adults) + Number(stayDetails.children), // Total guests attached to each room for now
          specialRequest: stayDetails.specialRequest,
          isReconciled: billingDetails.isReconciled,
          hasBreakfast: billingDetails.extraServiceCosts.breakfast > 0,
          hasExtrabed: billingDetails.extraServiceCosts.extraBed > 0,
          hasLateCheckout: billingDetails.extraServiceCosts.lateCheckout > 0,
          hasLaundry: billingDetails.extraServiceCosts.laundry > 0,
          totalAmount: totalAmount / roomCount, // Divide total by number of rooms
  
          // Payment
          paymentStatus: billingDetails.paymentStatus,
          paymentDate: billingDetails.paymentDate,
          paymentAmount: paymentPerRoom,
        };
  
        return reservationsApi.createWithDetails(payload);
      }));
      
      onClose();
      // Force reload to refresh data on other components (like RoomMap)
      // ideally we would use a query invalidation or global state, but reload is acceptable for now
      window.location.reload(); 
    } catch (error: any) {
      console.error('Save failed:', error);
      alert(error.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#111621]/40 backdrop-blur-[4px] p-4 transition-all">
      <div className="glass-panel w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 bg-white/85 dark:bg-[#111621]/85 backdrop-blur-xl border border-white/60 dark:border-white/10">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-[#111318] dark:text-white text-2xl font-bold leading-tight">New Reservation</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#616e89] dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Order ID:</span>
              <span className="bg-gray-100 dark:bg-gray-800 text-[#111318] dark:text-gray-200 text-xs font-mono px-2 py-0.5 rounded">{orderId}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar bg-white/50 dark:bg-[#111621]/50">
            <div className="px-8 pt-4 bg-white/40 dark:bg-[#111621]/40 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-8">
                <button 
                  onClick={() => setActiveTab('guest')}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'guest' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <span className="material-icons-round text-[20px]">person</span>
                  <span className="text-sm font-bold tracking-wide">Guest Info</span>
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <span className="material-icons-round text-[20px]">edit_note</span>
                  <span className="text-sm font-bold tracking-wide">Notes</span>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {activeTab === 'guest' ? (
                <>
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary"></span>
                      Primary Guest Details
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" 
                            placeholder="Enter guest name" 
                            type="text" 
                            value={guestDetails.fullName}
                            onChange={(e) => setGuestDetails({...guestDetails, fullName: e.target.value})}
                          />
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">person</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" 
                            placeholder="Contact number" 
                            type="tel" 
                            value={guestDetails.phone}
                            onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                          />
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">call</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-12">
                         <div className="flex items-center gap-2 mb-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member ID</label>
                            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">Optional</span>
                         </div>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white font-mono" 
                            placeholder="Type Member ID" 
                            type="text" 
                            value={guestDetails.memberId || ''}
                            onChange={(e) => setGuestDetails({...guestDetails, memberId: e.target.value})}
                          />
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">badge</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" 
                            placeholder="email@domain.com" 
                            type="email" 
                            value={guestDetails.email}
                            onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                          />
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">mail</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Origin</label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" 
                            placeholder="Enter Origin" 
                            type="text" 
                            value={guestDetails.origin}
                            onChange={(e) => setGuestDetails({...guestDetails, origin: e.target.value})}
                          />
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">public</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-100 dark:border-gray-800"/>
                  
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500"></span>
                      Stay Details
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Dates</label>
                        <div className="flex items-center gap-2 bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <span className="material-icons-round text-gray-400 text-[20px]">calendar_today</span>
                          <input 
                            className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-[#111318] dark:text-white outline-none cursor-pointer" 
                            type="date"
                            value={stayDetails.checkInDate}
                            onChange={(e) => setStayDetails({...stayDetails, checkInDate: e.target.value})}
                          />
                          <span className="text-gray-400">→</span>
                          <input 
                            className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-[#111318] dark:text-white text-right outline-none cursor-pointer"
                            type="date"
                            value={stayDetails.checkOutDate}
                            onChange={(e) => setStayDetails({...stayDetails, checkOutDate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Room & Type</label>
                        <CustomMultiSelect 
                          options={formattedRoomOptions} 
                          label="Select Room"
                          defaultSelected={stayDetails.selectedRooms}
                          onChange={(selected) => setStayDetails({...stayDetails, selectedRooms: selected})}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Adults</label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" 
                            min="1" type="number" 
                            value={stayDetails.adults}
                            onChange={(e) => setStayDetails({...stayDetails, adults: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Children</label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" 
                            min="0" type="number" 
                            value={stayDetails.children}
                            onChange={(e) => setStayDetails({...stayDetails, children: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Special Requests</label>
                        <textarea 
                          className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-11 min-h-[44px] resize-none overflow-hidden outline-none dark:text-white" 
                          placeholder="e.g. Late check-in, Extra pillow"
                          value={stayDetails.specialRequest}
                          onChange={(e) => setStayDetails({...stayDetails, specialRequest: e.target.value})}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-100 dark:border-gray-800"/>
                  
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                      <span className="size-2 rounded-full bg-purple-500"></span>
                      Billing & Payouts
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Payment Date</label>
                        <div className="relative">
                          <input 
                            className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-[#111318] dark:text-white outline-none cursor-pointer" 
                            type="date"
                            value={billingDetails.paymentDate}
                            onChange={(e) => setBillingDetails({...billingDetails, paymentDate: e.target.value})}
                          />
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px] pointer-events-none">calendar_today</span>
                        </div>
                      </div>
                      <div className="col-span-12">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1c2230] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <div className="relative flex items-center">
                            <input 
                              className="peer sr-only" type="checkbox"
                              checked={billingDetails.isReconciled}
                              onChange={(e) => setBillingDetails({...billingDetails, isReconciled: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#111318] dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">Rekonsiliasi (Reconciliation)</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Mark this booking as reconciled in the accounting ledger.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-500"></span>
                        Catatan Keterangan
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Additional Notes / Remarks</label>
                            <textarea 
                              className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-32 resize-none outline-none dark:text-white" 
                              placeholder="Enter any special notes..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-100 dark:border-gray-800"/>
                  
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                        <span className="size-2 rounded-full bg-rose-500"></span>
                        Tambahan Biaya Layanan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Breakfast</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="0" type="number"
                                  value={billingDetails.extraServiceCosts.breakfast}
                                  onChange={(e) => setBillingDetails(prev => ({...prev, extraServiceCosts: {...prev.extraServiceCosts, breakfast: Number(e.target.value)}}))}
                                />
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">restaurant</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Late Check-out / Early Check-in</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="0" type="number"
                                  value={billingDetails.extraServiceCosts.lateCheckout}
                                  onChange={(e) => setBillingDetails(prev => ({...prev, extraServiceCosts: {...prev.extraServiceCosts, lateCheckout: Number(e.target.value)}}))}
                                />
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">schedule</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Extra Bed</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="0" type="number"
                                  value={billingDetails.extraServiceCosts.extraBed}
                                  onChange={(e) => setBillingDetails(prev => ({...prev, extraServiceCosts: {...prev.extraServiceCosts, extraBed: Number(e.target.value)}}))}
                                />
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">bed</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Laundry</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="0" type="number"
                                  value={billingDetails.extraServiceCosts.laundry}
                                  onChange={(e) => setBillingDetails(prev => ({...prev, extraServiceCosts: {...prev.extraServiceCosts, laundry: Number(e.target.value)}}))}
                                />
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">local_laundry_service</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-80 bg-background-light/80 dark:bg-black/20 border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col shrink-0 backdrop-blur-sm">
            <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Reservation Summary</h4>
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Booking Source</label>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1c2230] p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <select 
                    className="bg-transparent border-none text-sm font-medium w-full p-0 focus:ring-0 outline-none dark:text-white"
                    value={billingDetails.source}
                    onChange={(e) => setBillingDetails({...billingDetails, source: e.target.value})}
                  >
                    <option>Booking.com</option>
                    <option>Airbnb</option>
                    <option>Traveloka</option>
                    <option>Agoda</option>
                    <option>Tiket.com</option>
                    <option>Direct / Walk-in</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 bg-white dark:bg-[#1c2230] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-5">
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Rate</span>
                  <input 
                    type="number" 
                    className="w-24 bg-transparent border-b border-gray-200 dark:border-gray-700 text-right focus:border-primary focus:outline-none text-[#111318] dark:text-white font-medium p-1"
                    placeholder="0"
                    value={billingDetails.rateAmount}
                    onChange={(e) => setBillingDetails({...billingDetails, rateAmount: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Taxes & Fees</span>
                  <input 
                    type="number" 
                    className="w-24 bg-transparent border-b border-gray-200 dark:border-gray-700 text-right focus:border-primary focus:outline-none text-[#111318] dark:text-white font-medium p-1"
                    value={billingDetails.taxAmount}
                    onChange={(e) => setBillingDetails({...billingDetails, taxAmount: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Services</span>
                  <input 
                    type="number" 
                    className="w-24 bg-transparent border-b border-gray-200 dark:border-gray-700 text-right focus:border-primary focus:outline-none text-[#111318] dark:text-white font-medium p-1"
                    value={billingDetails.serviceAmount}
                    onChange={(e) => setBillingDetails({...billingDetails, serviceAmount: Number(e.target.value)})}
                  />
                </div>
                
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#111318] dark:text-white">Total</span>
                  <span className="text-lg font-bold text-primary">
                    Rp{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 italic text-center mt-2">
                  * Input raw numbers only (no commas or dots).
                </p>
              </div>
      
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Reservation Status</label>
                  <div className="flex gap-2">
                    {['Confirmed'].map(status => (
                        <label key={status} className="cursor-pointer">
                        <input 
                            type="radio" 
                            name="res_status" 
                            className="peer sr-only" 
                            checked={billingDetails.reservationStatus === status}
                            onChange={() => setBillingDetails({...billingDetails, reservationStatus: status})}
                        />
                        <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${billingDetails.reservationStatus === status ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                            {status === 'Confirmed' && <span className="size-1.5 rounded-full bg-emerald-500"></span>}
                            {status}
                        </div>
                        </label>
                    ))}
                  </div>
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment Status</label>
                    <div className="relative w-full">
                      <select 
                          className="w-full appearance-none bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-10 pl-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white"
                          value={billingDetails.paymentStatus}
                          onChange={(e) => setBillingDetails({...billingDetails, paymentStatus: e.target.value})}
                      >
                        <option>Deposit Paid (DP)</option>
                        <option>Fully Paid (Lunas)</option>
                        <option>Unpaid</option>
                      </select>
                      <span className="material-icons-round absolute right-2.5 top-2.5 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
                    </div>
                  </div>

                  {billingDetails.paymentStatus === 'Deposit Paid (DP)' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Downpayment Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium text-sm">Rp</span>
                        <input 
                          type="number" 
                          className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-10 pl-9 pr-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white"
                          placeholder="0"
                          value={billingDetails.paymentAmount || ''}
                          onChange={(e) => setBillingDetails({...billingDetails, paymentAmount: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <div className="p-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-[#111621]/50 backdrop-blur-sm">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold h-11 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-icons-round text-[20px]">save</span>
                {loading ? 'Saving...' : 'Save Booking'}
              </button>
              <button 
                onClick={onClose}
                className="w-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium h-10 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
