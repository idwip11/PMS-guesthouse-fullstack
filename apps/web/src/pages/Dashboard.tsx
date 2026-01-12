import { useState, useEffect } from 'react';
import OccupancyChart from '../components/OccupancyChart';
import ActivityDetailsModal from '../components/ActivityDetailsModal';
import { roomsApi, reservationsApi, guestsApi } from '../services/api';
import type { Room, Reservation, Guest } from '../types';

export default function Dashboard() {
  const [activityModalType, setActivityModalType] = useState<'check-in' | 'check-out' | null>(null);
  
  // API Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, reservationsData, guestsData] = await Promise.all([
          roomsApi.getAll(),
          reservationsApi.getAll(),
          guestsApi.getAll(),
        ]);
        setRooms(roomsData);
        setReservations(reservationsData);
        setGuests(guestsData);
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
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Get guest name by ID
  const getGuestName = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    return guest?.fullName || 'Unknown Guest';
  };
  
  // Get room number by ID
  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.roomNumber || 'N/A';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Occupancy Rate Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-blue-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700"></div>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">bed</span>
              </div>
              <span className="text-xs font-medium bg-green-400/20 text-green-100 px-2 py-1 rounded-full border border-green-400/30 flex items-center gap-1">
                <span className="material-icons-round text-sm">arrow_upward</span> 12%
              </span>
            </div>
            <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wide">Occupancy Rate</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">{loading ? '...' : `${occupancyRate}%`}</h2>
              <span className="text-blue-200 text-sm">/ {totalRooms} rooms</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-blue-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${occupancyRate}%` }}></div>
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
              <h2 className="text-4xl font-bold">$12,450</h2>
            </div>
            <p className="text-emerald-100 text-sm mt-4 opacity-90">+$2,340 vs last week</p>
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
              <h2 className="text-4xl font-bold">3.2</h2>
              <span className="text-orange-200 text-sm">Nights</span>
            </div>
            <div className="flex gap-1 mt-4">
              <span className="h-1 w-8 bg-white/90 rounded-full"></span>
              <span className="h-1 w-8 bg-white/40 rounded-full"></span>
              <span className="h-1 w-8 bg-white/40 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Occupancy Trend</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last 30 Days Performance</p>
            </div>
            <button className="text-primary hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View Report <span className="material-icons-round text-base">chevron_right</span>
            </button>
          </div>
          <OccupancyChart />
        </div>

        {/* Today's Activity */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Today's Activity</h3>
          <div className="flex items-center gap-4 mb-6">
            <div 
              onClick={() => setActivityModalType('check-in')}
              className="flex-1 text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <span className="block text-2xl font-bold text-green-600 dark:text-green-400">12</span>
              <span className="text-xs text-green-600/80 dark:text-green-400/70 font-medium">Check-ins</span>
            </div>
            <div 
              onClick={() => setActivityModalType('check-out')}
              className="flex-1 text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <span className="block text-2xl font-bold text-red-600 dark:text-red-400">8</span>
              <span className="text-xs text-red-600/80 dark:text-red-400/70 font-medium">Check-outs</span>
            </div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
             {/* Activity Items */}
             {[
               { name: 'Luu, Quang Thuan', room: '4313 • VIP', time: '10:30 AM', icon: 'login', type: 'checkin' },
               { name: 'Irma McKinney', room: 'Rooms 0618', time: '09:15 AM', icon: 'logout', type: 'checkout' },
               { name: 'Clean Room 202', room: 'Housekeeping • Pending', time: 'Urgent', icon: 'cleaning_services', type: 'cleaning' },
               { name: 'Nguyen, Tran Thuy', room: 'Room 6317', time: '02:00 PM', icon: 'login', type: 'checkin' },
             ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'checkin' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  item.type === 'checkout' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>
                  <span className="material-icons-round text-lg">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.room}</p>
                </div>
                <span className={`text-xs font-medium ${item.type === 'cleaning' ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>
                  {item.time}
                </span>
              </div>
             ))}
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Reservations</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-primary bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">Arrival</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Due Out</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">In House</button>
          </div>
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
                <th className="px-6 py-4 font-medium text-right">Action</th>
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
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
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
