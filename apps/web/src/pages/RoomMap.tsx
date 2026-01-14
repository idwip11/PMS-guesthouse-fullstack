import { useState, useEffect } from 'react';
import GanttChart from '../components/room-map/GanttChart';
import BookingDetailsModal from '../components/BookingDetailsModal'; // Fixed import path
import { roomsApi, reservationsApi } from '../services/api';
import type { Room as ApiRoom } from '../types';
import type { Room as GanttRoom, RoomStatus, Booking } from '../components/room-map/data';

export default function RoomMap() {
  const [rooms, setRooms] = useState<GanttRoom[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const today = new Date();

  useEffect(() => {
    fetchData();
  }, [currentDate]); // Re-fetch when month changes to recalculate display positions

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Rooms
      const apiRooms = await roomsApi.getAll();
      
      const mappedRooms: GanttRoom[] = apiRooms.map((room: ApiRoom) => ({
        id: `room-${room.roomNumber}`, // Matching the ID format used in bookings mapping
        number: room.roomNumber,
        type: room.roomType as any,
        status: mapStatusToGantt(room.status),
      }));
      
      mappedRooms.sort((a, b) => parseInt(a.number) - parseInt(b.number));
      setRooms(mappedRooms);

      // 2. Fetch Reservations
      const apiReservations = await reservationsApi.getAll() as any[];
      
      // Calculate month boundaries
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);

      const mappedBookings: Booking[] = apiReservations.map(res => {
        const checkIn = new Date(res.checkInDate);
        const checkOut = new Date(res.checkOutDate);

        // Skip if reservation does not overlap with current month
        if (checkOut < startOfMonth || checkIn > endOfMonth) {
          return null;
        }

        // Determine visible start day and length for this month view
        const effectiveStart = checkIn < startOfMonth ? startOfMonth : checkIn;
        // visual length is from effective start to checkout (or end of month?)
        // The GanttChart seems to just draw a bar of length N. 
        // We should clamp the rendering to the month view if needed, but CSS overflow might handle it.
        // For 'length', let's use the actual remaining duration from effectiveStart.
        
        const diffTime = Math.abs(checkOut.getTime() - effectiveStart.getTime());
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        return {
          id: res.id,
          roomId: `room-${res.roomNumber}`, // Link to room via generated ID
          guestName: res.guestName || 'Unknown Guest',
          status: 'Confirmed', // You might want to map this from res.status
          startDay: effectiveStart.getDate(),
          length: durationDays,
          paymentStatus: res.paymentStatus as any,
          paidAmount: res.paidAmount,
          details: `Order: ${res.orderId}`,
          isReconciled: res.isReconciled,
        };
      }).filter(Boolean) as Booking[];

      setBookings(mappedBookings);

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToGantt = (status: ApiRoom['status']): RoomStatus => {
    switch (status) {
      case 'Available': return 'Clean';
      case 'Dirty': return 'Dirty';
      case 'Maintenance': return 'OOO';
      case 'Occupied': return 'Inspected';
      default: return 'Clean';
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const dayOfWeekIndex = date.getDay();
      return {
        day,
        date,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeekIndex],
        isToday: date.toDateString() === today.toDateString(),
        isWeekend: dayOfWeekIndex === 0 || dayOfWeekIndex === 6,
      };
    });
  };

  const days = getDaysInMonth();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getMonthYearLabel = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading && rooms.length === 0) { // Only show full loading if no data yet
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500">Loading room map...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex flex-col gap-4 md:flex-row items-center justify-between shrink-0">
        <div className="relative w-full md:w-64">
          <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
            <option>HomiQ Guesthouse Tata Bumi</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <span className="material-icons-round">expand_more</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-all"
              onClick={goToPreviousMonth}
            >
              <span className="material-icons-round text-lg">chevron_left</span>
            </button>
            <span className="text-sm font-semibold text-slate-700 min-w-[140px] text-center">
              {getMonthYearLabel()}
            </span>
            <button 
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-all"
              onClick={goToNextMonth}
            >
              <span className="material-icons-round text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 mb-4 flex items-center gap-6 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span className="text-slate-600">Fully Paid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#ffc8aa]"></div>
          <span className="text-slate-600">Downpayment (DP)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-slate-600">Unpaid</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-yellow-500 text-sm">star</span>
          <span className="text-slate-600">Reconciled</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        <GanttChart 
          rooms={rooms} 
          days={days} 
          bookings={bookings} 
          onBookingClick={(booking) => {
             setSelectedBookingId(booking.id);
             setIsBookingModalOpen(true);
          }}
        />
      </div>

      <BookingDetailsModal 
        isOpen={isBookingModalOpen} 
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedBookingId(null);
        }} 
        bookingId={selectedBookingId}
      />
    </div>
  );
}
