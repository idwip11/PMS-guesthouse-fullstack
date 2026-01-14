import { useState, useEffect } from 'react';
import { shiftsApi, usersApi } from '../services/api';
import { utils, writeFile } from 'xlsx';
import type { User, Shift } from '../types';

interface StaffRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRosterUpdate?: () => void;
}

// Helper to get start of current week (Monday)
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Oct 23"
};

const getDayName = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon"
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default function StaffRosterModal({ isOpen, onClose, onRosterUpdate }: StaffRosterModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]); // All fetched shifts
  const [rosterUsers, setRosterUsers] = useState<User[]>([]); 
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  
  // Pending changes (local state before publishing)
  const [localShifts, setLocalShifts] = useState<Shift[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchData();
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [usersData, shiftsData] = await Promise.all([
        usersApi.getAll(),
        shiftsApi.getAll()
      ]);
      setUsers(usersData);
      setShifts(shiftsData);
      setLocalShifts(shiftsData); // Initialize local state
      
      const userIdsWithShifts = new Set(shiftsData.map(s => s.userId));
      const activeUsers = usersData.filter(u => userIdsWithShifts.has(u.id));
      setRosterUsers(activeUsers);
    } catch (error) {
      console.error('Failed to fetch roster data:', error);
    }
  };

  const handleAddUserToRoster = (user: User) => {
    if (!rosterUsers.find(u => u.id === user.id)) {
      setRosterUsers([...rosterUsers, user]);
    }
    setIsUserSelectOpen(false);
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const currentWeekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const weekRangeLabel = `${formatDate(currentWeekStart)} - ${formatDate(addDays(currentWeekStart, 6))}, ${currentWeekStart.getFullYear()}`;

  // Check if a user has a shift on a specific date in local state
  const getShiftForUserDate = (userId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return localShifts.find(s => s.userId === userId && s.shiftDate.startsWith(dateStr));
  };

  // Shift cycle order: Morning 08:00 -> Morning 09:00 -> Evening 16:00 -> Empty (remove)
  const getNextShiftState = (currentShift: Shift | undefined): { shiftType: string; startTime: string; endTime: string } | null => {
    if (!currentShift) {
      return { shiftType: 'Morning', startTime: '08:00', endTime: '16:00' };
    }
    
    const { shiftType, startTime } = currentShift;
    
    if (shiftType === 'Morning' && startTime === '08:00') {
      return { shiftType: 'Morning', startTime: '09:00', endTime: '17:00' };
    } else if (shiftType === 'Morning' && startTime === '09:00') {
      return { shiftType: 'Evening', startTime: '16:00', endTime: '00:00' };
    } else if (shiftType === 'Evening') {
      return null; // Remove shift
    }
    
    // Default: start fresh
    return { shiftType: 'Morning', startTime: '08:00', endTime: '16:00' };
  };

  const handleCellClick = (userId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const existingShift = getShiftForUserDate(userId, date);
    
    const nextShiftState = getNextShiftState(existingShift);

    if (nextShiftState === null) {
       // Remove shift
       setLocalShifts(prev => prev.filter(s => !(s.userId === userId && s.shiftDate.startsWith(dateStr))));
    } else {
       const newShift: any = {
         userId,
         shiftDate: dateStr,
         shiftType: nextShiftState.shiftType,
         startTime: nextShiftState.startTime,
         endTime: nextShiftState.endTime,
         status: 'Scheduled'
       };

       if (existingShift) {
         // Update
         setLocalShifts(prev => prev.map(s => (s.userId === userId && s.shiftDate.startsWith(dateStr)) ? { ...s, ...newShift } : s));
       } else {
         // Create
         setLocalShifts(prev => [...prev, newShift]);
       }
    }
  };

  const handlePublish = async () => {
    try {
      // Get the date range for the current week view
      const weekEnd = addDays(currentWeekStart, 6);
      
      // 1. Find shifts to DELETE: shifts that exist in DB but not in localShifts (for this week)
      const originalWeekShifts = shifts.filter(s => {
        const d = new Date(s.shiftDate);
        return d >= currentWeekStart && d <= weekEnd;
      });
      
      const localWeekShifts = localShifts.filter(s => {
        const d = new Date(s.shiftDate);
        return d >= currentWeekStart && d <= weekEnd;
      });
      
      // Shifts to delete: exist in original but not in local (by id)
      const localShiftIds = new Set(localWeekShifts.map(s => (s as any).id).filter(Boolean));
      const shiftsToDelete = originalWeekShifts.filter(s => s.id && !localShiftIds.has(s.id));
      
      // 2. Delete removed shifts from database
      await Promise.all(shiftsToDelete.map(async (shift) => {
        if (shift.id) {
          await shiftsApi.delete(shift.id);
        }
      }));

      // 3. Save/update remaining shifts
      await Promise.all(localWeekShifts.map(async (shift) => {
        if ((shift as any).id) {
          await shiftsApi.update((shift as any).id, shift);
        } else {
          await shiftsApi.create(shift);
        }
      }));

      // Refresh data from server
      await fetchData();
      if (onRosterUpdate) onRosterUpdate();
      alert('Roster published successfully!');
    } catch (err) {
      console.error('Error publishing roster:', err);
      alert('Failed to publish roster');
    }
  };

  const handleExportExcel = () => {
    // 1. Filter localShifts for the current month (real-time based on today)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const monthShifts = localShifts.filter(s => {
      const d = new Date(s.shiftDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (monthShifts.length === 0) {
      alert('No shifts found for the current month.');
      return;
    }

    // 2. Map data for export
    const exportData = monthShifts.map(shift => {
      const user = users.find(u => u.id === shift.userId);
      return {
        'Staff Name': user ? user.fullName : 'Unknown Staff',
        'Date': shift.shiftDate,
        'Shift Type': shift.shiftType,
        'Time': `${shift.startTime.slice(0, 5)} - ${shift.endTime.slice(0, 5)}`
      };
    });

    // 3. Create worksheet and workbook
    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Staff Shifts');

    // 4. Generate filename and download
    const filename = `Staff_Roster_${monthName.replace(' ', '_')}.xlsx`;
    writeFile(workbook, filename);
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${!isOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      id="scheduleModal"
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
        {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

<div className={`glass-card w-full max-w-5xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative transition-all duration-300 transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}>
<div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-white/40 dark:bg-slate-800/40">
<div>
<h2 className="text-2xl font-bold text-slate-800 dark:text-white">Front Office &amp; Housekeeping Schedule</h2>
<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage staff rosters, shifts, and weekly assignments</p>
</div>
<button className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full transition-colors" onClick={onClose}>
<span className="material-icons-round text-slate-400">close</span>
</button>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar p-8">
<div className="flex flex-col gap-8">
<div className="flex flex-wrap items-center justify-between gap-4">

              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrevWeek}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-icons-round text-base">chevron_left</span>
                </button>
                <span className="text-sm font-semibold px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 min-w-[200px] text-center">
                  {weekRangeLabel}
                </span>
                <button 
                   onClick={handleNextWeek}
                   className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-icons-round text-base">chevron_right</span>
                </button>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsUserSelectOpen(!isUserSelectOpen)}
                  className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <span className="material-icons-round text-lg">person_add</span>
                  Assign New Shift
                </button>
                
                {isUserSelectOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Staff Member</h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {users.length > 0 ? (
                        users.map(user => (
                          <div 
                            key={user.id}
                            onClick={() => handleAddUserToRoster(user)}
                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3 transition-colors"
                          >
                           <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white">{user.fullName}</p>
                              <p className="text-xs text-slate-500">{user.role}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                         <div className="p-4 text-center text-slate-400 text-xs">No users found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
</div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse bg-white/20 dark:bg-slate-800/20">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 font-semibold w-64">Staff Member</th>
                    {currentWeekDays.map((date, i) => (
                      <th key={i} className={`px-4 py-4 font-semibold text-center ${date.getDay() === 0 ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                        {getDayName(date)} {date.getDate()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
                  {rosterUsers.length > 0 ? (
                    rosterUsers.map(user => (
                      <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500 font-bold bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                               {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{user.fullName}</p>
                              <p className="text-xs text-primary font-medium">{user.role}</p>
                            </div>
                          </div>
                        </td>
                        {currentWeekDays.map((date, i) => {
                           const shift = getShiftForUserDate(user.id, date);
                           return (
                           <td key={i} className={`px-2 py-4 ${date.getDay() === 0 ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}>
                             <div 
                               onClick={() => handleCellClick(user.id, date)}
                               className={`
                                 h-12 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95
                                 ${shift 
                                   ? (shift.shiftType === 'Morning' && shift.startTime === '08:00'
                                       ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                       : shift.shiftType === 'Morning' && shift.startTime === '09:00'
                                       ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
                                       : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300')
                                   : 'border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-blue-400 hover:text-blue-400'}
                               `}
                             >
                               {shift ? (
                                 <>
                                   <span className="block font-bold text-[10px] uppercase">{shift.shiftType}</span>
                                   <span className="text-[10px] opacity-80">{shift.startTime.slice(0,5)}</span>
                                 </>
                               ) : (
                                 <span className="material-icons-round text-sm">add</span>
                               )}
                             </div>
                           </td>
                           );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        No staff assigned to roster. Click "Assign New Shift" to add staff.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50">
<h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
<span className="material-icons-round text-primary text-lg">info</span>
                            Shift Information
                        </h4>
<div className="space-y-3">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-blue-400"></span>
<span className="text-xs text-slate-600 dark:text-slate-400">Morning 08:00 - 16:00</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-sky-400"></span>
<span className="text-xs text-slate-600 dark:text-slate-400">Morning 09:00 - 17:00</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-indigo-400"></span>
<span className="text-xs text-slate-600 dark:text-slate-400">Evening: 16:00 - 00:00</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full border border-dashed border-slate-400"></span>
<span className="text-xs text-slate-600 dark:text-slate-400">Click until empty to remove</span>
</div>
</div>
</div>
<div className="md:col-span-2 p-6 bg-white/40 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-700/50">
{(() => {
  // Get current month and year automatically
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Filter shifts for the current month
  const monthShifts = localShifts.filter(s => {
    const d = new Date(s.shiftDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  // Count shifts by type (use startsWith to handle both 08:00 and 08:00:00 formats)
  const morning0800Count = monthShifts.filter(s => s.shiftType === 'Morning' && s.startTime.startsWith('08:00')).length;
  const morning0900Count = monthShifts.filter(s => s.shiftType === 'Morning' && s.startTime.startsWith('09:00')).length;
  const eveningCount = monthShifts.filter(s => s.shiftType === 'Evening').length;
  const totalShifts = monthShifts.length;
  
  // Get unique staff with shifts this month
  const staffWithShifts = Array.from(new Set(monthShifts.map(s => s.userId)))
    .map(userId => users.find(u => u.id === userId))
    .filter(Boolean) as User[];
  const staffCount = staffWithShifts.length;
  
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Monthly Recap</h4>
        <span className="text-xs text-slate-500 font-medium italic">{monthName}</span>
      </div>
      
      {/* Staff List */}
      <div className="mb-4">
        <p className="text-[10px] uppercase text-slate-500 mb-2">Staff with Shifts</p>
        <div className="flex flex-wrap gap-2">
          {staffWithShifts.length > 0 ? (
            staffWithShifts.map(user => (
              <span 
                key={user.id} 
                className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
              >
                {user.fullName}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No shifts assigned this month</span>
          )}
        </div>
      </div>
      
      {/* Shift Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
          <p className="text-lg font-bold text-primary">{totalShifts}</p>
          <p className="text-[9px] uppercase text-slate-500">Total Shifts</p>
        </div>
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-lg font-bold text-blue-600">{morning0800Count}</p>
          <p className="text-[9px] uppercase text-slate-500">Morning 08:00</p>
        </div>
        <div className="text-center p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
          <p className="text-lg font-bold text-sky-600">{morning0900Count}</p>
          <p className="text-[9px] uppercase text-slate-500">Morning 09:00</p>
        </div>
        <div className="text-center p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-lg font-bold text-indigo-600">{eveningCount}</p>
          <p className="text-[9px] uppercase text-slate-500">Evening 16:00</p>
        </div>
        <div className="text-center p-2 bg-slate-100 dark:bg-slate-700/40 rounded-lg">
          <p className="text-lg font-bold text-slate-800 dark:text-white">{staffCount}</p>
          <p className="text-[9px] uppercase text-slate-500">Staff Count</p>
        </div>
      </div>
    </>
  );
})()}
</div>
</div>
</div>
</div>
<div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-3 bg-white/40 dark:bg-slate-800/40">
            <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" onClick={onClose}>
                Close
            </button>
            <button 
                onClick={handleExportExcel}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 transition-colors flex items-center gap-2"
            >
                <span className="material-icons-round text-base">download</span>
                Export Excel
            </button>
          <button 
             onClick={handlePublish}
             className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all">
             Publish Roster
          </button>
</div>
</div>
</div>
  );
}
