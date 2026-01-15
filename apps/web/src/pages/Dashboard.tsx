import { useState, useEffect } from 'react';
import OccupancyChart from '../components/OccupancyChart';
import ActivityDetailsModal from '../components/ActivityDetailsModal';
import { roomsApi, reservationsApi, guestsApi, type TodayActivityItem } from '../services/api';
import type { Room, Reservation, Guest } from '../types';

export default function Dashboard() {
  const [activityModalType, setActivityModalType] = useState<'check-in' | 'check-out' | null>(null);
  
  // API Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayActivity, setTodayActivity] = useState<{
    checkIns: TodayActivityItem[];
    checkOuts: TodayActivityItem[];
    counts: { checkInCount: number; checkOutCount: number };
  } | null>(null);

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 0, label: 'January' }, { value: 1, label: 'February' },
    { value: 2, label: 'March' }, { value: 3, label: 'April' },
    { value: 4, label: 'May' }, { value: 5, label: 'June' },
    { value: 6, label: 'July' }, { value: 7, label: 'August' },
    { value: 8, label: 'September' }, { value: 9, label: 'October' },
    { value: 10, label: 'November' }, { value: 11, label: 'December' }
  ];

  const years = Array.from({ length: 8 }, (_, i) => 2025 + i); // 2025-2032

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, reservationsData, guestsData, todayActivityData] = await Promise.all([
          roomsApi.getAll(),
          reservationsApi.getAll(),
          guestsApi.getAll(),
          reservationsApi.getTodayActivity(),
        ]);
        setRooms(roomsData);
        setReservations(reservationsData);
        setGuests(guestsData);
        setTodayActivity(todayActivityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Computed values
  const totalRooms = rooms.length;

  // Computed values based on filters
  const filteredMetrics = (() => {
    // Helper to check if date is in selected month/year
    const isInPeriod = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    };

    // 1. Occupancy Rate (Active reservations in period / Total Rooms)
    // Simplified: Occupancy on the last day of period or average... 
    // Let's use: Average Daily Occupancy for the selected month to be more accurate
    // Or simplified MVP: Ratio of distinct rooms booked at least once / total rooms? No that's wrong.
    // Let's stick to CURRENT status if "Current Month" selected, otherwise calculated.
    // For MVP matching user expectation:
    // If selected month is current month, use current status.
    // If historical, calculate: (Total Booked Nights in Month) / (Total Rooms * Days in Month)
    

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const potentialRoomNights = totalRooms * daysInMonth;
    
    let occupiedNights = 0;
    reservations.forEach(res => {
      if (res.status === 'Cancelled') return;
      
      const start = new Date(res.checkInDate);
      const end = new Date(res.checkOutDate);
      const filterStart = new Date(selectedYear, selectedMonth, 1);
      const filterEnd = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month
      
      // Intersection
      const effectiveStart = start < filterStart ? filterStart : start;
      const effectiveEnd = end > filterEnd ? filterEnd : end;
      
      if (effectiveStart < effectiveEnd) {
        const diffTime = Math.abs(effectiveEnd.getTime() - effectiveStart.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        occupiedNights += diffDays;
      }
    });

    const occupancy = totalRooms > 0 ? ((occupiedNights / potentialRoomNights) * 100).toFixed(2) : '0.00';


    // 2. Revenue (Payments received in selected month)
    // We don't have payments array here (only inside reservations sometimes?)
    // Actually we have `reservations` which has `totalAmount`.
    // Ideally we sum payments `paymentDate` in month.
    // BUT we only have `reservations` in state. 
    // Let's approximate Revenue = Sum of totalAmount for bookings checking out in that month? 
    // Or checkIn? Accounting usually accrual (by night) or cash (by payment).
    // Let's use: Reservations originating (check-in) in that month for simplicity if no payments data.
    // BETTER: The user saw "Total Revenue" card. Let's assume it sums `totalAmount` of confirmed reservations in that month.
    
    const revenue = reservations
      .filter(r => r.status !== 'Cancelled' && isInPeriod(r.checkInDate))
      .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);

    // 3. Average Stay (Nights)
    // Avg length of stay for bookings in that period
    const stayReservations = reservations.filter(r => r.status !== 'Cancelled' && isInPeriod(r.checkInDate));
    const totalNights = stayReservations.reduce((sum, r) => {
      const start = new Date(r.checkInDate);
      const end = new Date(r.checkOutDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      return sum + diff;
    }, 0);
    const avgStay = stayReservations.length > 0 ? (totalNights / stayReservations.length).toFixed(1) : '0';

    // 4. Previous Month Revenue Comparison
    let prevMonth = selectedMonth - 1;
    let prevMonthYear = selectedYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevMonthYear = selectedYear - 1;
    }

    const isInPrevPeriod = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
    };

    const prevRevenue = reservations
      .filter(r => r.status !== 'Cancelled' && isInPrevPeriod(r.checkInDate))
      .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
    
    const revenueDiff = revenue - prevRevenue;

    return { occupancy, revenue, avgStay, occupiedNights, revenueDiff };
  })();

  // Get guest name by ID
  const getGuestName = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    return guest?.fullName || 'Unknown Guest';
  };
  
  // Get room number by ID
  const getRoomNumber = (roomId: string | number) => {
    const room = rooms.find(r => r.id === Number(roomId));
    return room?.roomNumber || 'N/A';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Date Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
           <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-1.5 pl-3 pr-8"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-1.5 pl-3 pr-8"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Occupancy Rate Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-blue-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700"></div>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">bed</span>
              </div>
            </div>
            <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wide">Occupancy Rate</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">{loading ? '...' : `${filteredMetrics.occupancy}%`}</h2>
              <span className="text-blue-200 text-sm">/ {totalRooms} rooms</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-blue-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${filteredMetrics.occupancy}%` }}></div>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-teal-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600"></div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">attach_money</span>
              </div>
              <span className="text-xs font-medium bg-white/20 text-white px-2 py-1 rounded-full border border-white/30">
                Today
              </span>
            </div>
            <h3 className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Revenue</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">{formatCurrency(filteredMetrics.revenue)}</h2>
            </div>
            <p className="text-emerald-100 text-sm mt-4 opacity-90">
              {filteredMetrics.revenueDiff >= 0 ? '+' : ''}{formatCurrency(filteredMetrics.revenueDiff)} vs last month
            </p>
          </div>
        </div>

        {/* Avg Stay Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-orange-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600"></div>
          <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">calendar_today</span>
              </div>
            </div>
            <h3 className="text-orange-100 text-sm font-medium uppercase tracking-wide">Average Stay</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">{filteredMetrics.avgStay}</h2>
              <span className="text-orange-200 text-sm">Nights</span>
            </div>
            <div className="flex gap-1 mt-4">
              <span className="h-1 w-8 bg-white/90 rounded-full"></span>
              <span className="h-1 w-8 bg-white/40 rounded-full"></span>
              <span className="h-1 w-8 bg-white/40 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Rooms Rented Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-purple-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600"></div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">bedroom_parent</span>
              </div>
            </div>
            <h3 className="text-purple-100 text-sm font-medium uppercase tracking-wide">Rooms Rented</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">{filteredMetrics.occupiedNights}</h2>
              <span className="text-purple-200 text-sm">Rooms</span>
            </div>
             <p className="text-purple-100 text-sm mt-4 opacity-90">In selected month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Occupancy Trend</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Performance ({selectedYear})</p>
            </div>
          </div>
          <OccupancyChart reservations={reservations} totalRooms={totalRooms} year={selectedYear} />
        </div>

        {/* Today's Activity */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Today's Activity</h3>
          <div className="flex items-center gap-4 mb-6">
            <div 
              onClick={() => setActivityModalType('check-in')}
              className="flex-1 text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <span className="block text-2xl font-bold text-green-600 dark:text-green-400">
                {todayActivity?.counts.checkInCount ?? 0}
              </span>
              <span className="text-xs text-green-600/80 dark:text-green-400/70 font-medium">Check-ins</span>
            </div>
            <div 
              onClick={() => setActivityModalType('check-out')}
              className="flex-1 text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <span className="block text-2xl font-bold text-red-600 dark:text-red-400">
                {todayActivity?.counts.checkOutCount ?? 0}
              </span>
              <span className="text-xs text-red-600/80 dark:text-red-400/70 font-medium">Check-outs</span>
            </div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
             {/* Activity Preview */}
             {(() => {
               const allActivities = [
                 ...(todayActivity?.checkIns || []).map(item => ({ ...item, activityType: 'checkin' as const })),
                 ...(todayActivity?.checkOuts || []).map(item => ({ ...item, activityType: 'checkout' as const }))
               ].slice(0, 4);

               if (allActivities.length === 0) {
                 return (
                   <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                     <span className="material-icons-round text-3xl mb-2">event_available</span>
                     <p className="text-sm">No activities scheduled for today</p>
                   </div>
                 );
               }

               const formatCurrency = (amount: number) => {
                 return new Intl.NumberFormat('id-ID', {
                   style: 'currency',
                   currency: 'IDR',
                   minimumFractionDigits: 0,
                   maximumFractionDigits: 0,
                 }).format(amount);
               };

               return allActivities.map((item, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                     item.activityType === 'checkin' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                     'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                   }`}>
                     <span className="material-icons-round text-lg">{item.activityType === 'checkin' ? 'login' : 'logout'}</span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.guestName}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400">
                       Room {item.roomNumber} {item.source && <span className="text-primary">• {item.source}</span>}
                     </p>
                   </div>
                   {item.outstanding > 0 ? (
                     <span className="text-xs font-medium text-red-500 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">
                       {formatCurrency(item.outstanding)}
                     </span>
                   ) : (
                     <span className="text-xs font-medium text-green-500 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                       Paid
                     </span>
                   )}
                 </div>
               ));
             })()}
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Reservations</h3>

        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-medium">Guest Name</th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Room</th>
                <th className="px-6 py-4 font-medium">Rate Code</th>
                <th className="px-6 py-4 font-medium">Status</th>

              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
              {reservations.slice(0, 5).map((res) => (
                <tr key={res.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">{getGuestName(res.guestId)}</td>
                  <td className="px-6 py-4 text-primary font-medium">{res.orderId}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
                    {getRoomNumber(res.roomId)}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{res.source || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      res.status === 'Confirmed' || res.status === 'Checked_In' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      res.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ActivityDetailsModal 
        isOpen={!!activityModalType} 
        onClose={() => setActivityModalType(null)} 
        type={activityModalType} 
      />
    </div>
  );
}
