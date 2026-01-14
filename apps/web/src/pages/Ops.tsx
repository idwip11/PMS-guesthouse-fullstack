import { useState, useEffect } from 'react';
import OpsChart from '../components/OpsChart';
import InventorySetupModal from '../components/InventorySetupModal';
import ReportIssueModal from '../components/ReportIssueModal';
import StaffRosterModal from '../components/StaffRosterModal';
import { expensesApi, inventoryApi, maintenanceApi, roomsApi, shiftsApi, usersApi } from '../services/api';
import type { Expense, InventoryItem, MaintenanceTicket, Room, Shift, User } from '../types';

export default function Ops() {
  const [isInventorySetupModalOpen, setIsInventorySetupModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isStaffRosterModalOpen, setIsStaffRosterModalOpen] = useState(false);

  // API Data State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local state for room maintenance worksheet
  const [maintenanceRows, setMaintenanceRows] = useState<{
    roomId: number;
    roomNumber: string;
    issue: string;
    priority: string;
    notes: string;
    isSaved?: boolean;
  }[]>([]);

  const fetchData = async () => {
    try {
      const [expensesData, inventoryData, maintenanceData, roomsData, shiftsData, usersData] = await Promise.all([
        expensesApi.getAll(),
        inventoryApi.getAll(),
        maintenanceApi.getAll(),
        roomsApi.getAll(),
        shiftsApi.getAll(),
        usersApi.getAll(),
      ]);
      setExpenses(expensesData);
      setInventory(inventoryData);
      setMaintenance(maintenanceData);
      setRooms(roomsData);
      setShifts(shiftsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch ops data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);


  // Initialize maintenance worksheet from rooms with 'Maintenance' status
  // Initialize maintenance worksheet from rooms with 'Maintenance' status, merged with active tickets
  useEffect(() => {
    if (rooms.length > 0) {
      const rows = rooms
        .filter(r => r.status === 'Maintenance')
        .map(r => {
           // Find existing active ticket for this room
           const activeTicket = maintenance.find(t => 
             String(t.roomId) === String(r.id) && 
             (t.status === 'Open' || t.status === 'In_Progress')
           );

           return {
            roomId: r.id,
            roomNumber: r.roomNumber,
            issue: activeTicket?.issueType || '',
            priority: activeTicket?.priority || '',
            notes: activeTicket?.description || '',
            isSaved: !!activeTicket // Mark as saved if ticket exists
          };
        });
      setMaintenanceRows(rows);
    }
  }, [rooms, maintenance]);

  // Computed values
  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const lowStockItems = inventory.filter(item => item.currentStock < item.minThreshold);
  const openMaintenanceTickets = maintenance.filter(m => m.status !== 'Resolved');

  // Filter shifts for today
  const todaysDateStr = new Date().toISOString().split('T')[0];
  const todaysShifts = shifts.filter(s => s.shiftDate.startsWith(todaysDateStr));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly OpEx Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-red-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600"></div>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">account_balance_wallet</span>
              </div>
              <span className="text-xs font-medium bg-red-400/20 text-red-50 px-2 py-1 rounded-full border border-red-400/30 flex items-center gap-1">
                <span className="material-icons-round text-sm">arrow_upward</span> 5%
              </span>
            </div>
            <h3 className="text-rose-100 text-sm font-medium uppercase tracking-wide">Monthly OpEx</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">Rp {loading ? '...' : totalMonthlyExpenses.toLocaleString('id-ID')}</h2>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-rose-100 opacity-90">
              <span>Budget: Rp 150.000.000</span>
              <span>82% Used</span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-red-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/90 w-[82%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-amber-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500"></div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">inventory_2</span>
              </div>
              <span className="text-xs font-medium bg-white/20 text-white px-2 py-1 rounded-full border border-white/30">
                Attention Needed
              </span>
            </div>
            <h3 className="text-amber-50 text-sm font-medium uppercase tracking-wide">Low Stock Items</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">{lowStockItems.length}</h2>
              <span className="text-amber-100 text-sm">Items Critical</span>
            </div>
            <div className="flex -space-x-2 mt-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 ring-2 ring-orange-500 text-xs font-bold">TP</span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 ring-2 ring-orange-500 text-xs font-bold">S.</span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 ring-2 ring-orange-500 text-xs font-bold">Tow</span>
            </div>
          </div>
        </div>

        {/* Maintenance Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-blue-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
          <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">build</span>
              </div>
              <span className="text-xs font-medium bg-blue-400/20 text-blue-100 px-2 py-1 rounded-full border border-blue-400/30 flex items-center gap-1">
                Active
              </span>
            </div>
            <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wide">Maintenance</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">{openMaintenanceTickets.length}</h2>
              <span className="text-blue-200 text-sm">Open Tickets</span>
            </div>
            <p className="text-blue-100 text-sm mt-4 opacity-90">{openMaintenanceTickets.filter(m => m.priority === 'High' || m.priority === 'Critical').length} Urgent</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Prediction Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Expense Prediction</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Projected vs Actual Operational Costs (6 Months)</p>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <span className="material-icons-round text-lg">filter_list</span>
              </button>
              <button className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <span className="material-icons-round text-lg">download</span>
              </button>
            </div>
          </div>
          <div className="relative h-72 w-full">
            <OpsChart />
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Inventory Alerts</h3>
            <button 
              onClick={() => setIsInventorySetupModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <span className="material-icons-round text-sm">settings</span>
              Setup
            </button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 group">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-red-900/40 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-icons-round text-lg">soap</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">Premium Shampoo (50ml)</p>
                <p className="text-xs text-red-500 dark:text-red-400">12 units remaining</p>
              </div>
              <button className="text-xs font-medium text-red-600 bg-white dark:bg-red-900/50 px-2.5 py-1.5 rounded-lg shadow-sm border border-red-100 dark:border-red-800 hover:bg-red-50 transition-colors">
                Order
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 group">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-amber-900/40 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-icons-round text-lg">coffee</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">Espresso Pods</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">45 units remaining</p>
              </div>
              <button className="text-xs font-medium text-amber-700 bg-white dark:bg-amber-900/50 px-2.5 py-1.5 rounded-lg shadow-sm border border-amber-100 dark:border-amber-800 hover:bg-amber-50 transition-colors">
                Check
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-lg">bed</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">King Size Sheets</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stock Healthy</p>
              </div>
              <span className="text-xs font-medium text-slate-400">140 units</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-lg">cleaning_services</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">Sanitizing Spray</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stock Healthy</p>
              </div>
              <span className="text-xs font-medium text-slate-400">25 bottles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Operational Expenses */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Operational Expenses</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-primary bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">All Expenses</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Pending Approval</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-medium">Expense Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Logged By</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
              {expenses.length > 0 ? (
                expenses
                  .sort((a, b) => new Date(b.dateIncurred).getTime() - new Date(a.dateIncurred).getTime())
                  .slice(0, 10)
                  .map((expense) => {
                    const loggedByUser = users.find(u => u.id === expense.loggedByUserId);
                    const formattedDate = new Date(expense.dateIncurred).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    
                    const categoryIcons: Record<string, { icon: string, color: string }> = {
                      'Repairs & Maintenance': { icon: 'plumbing', color: 'blue' },
                      'Maintenance': { icon: 'build', color: 'blue' },
                      'Utilities': { icon: 'wifi', color: 'purple' },
                      'Supplies & Inventory': { icon: 'local_laundry_service', color: 'amber' },
                      'IT & Software': { icon: 'computer', color: 'indigo' },
                      'Staff & Labor': { icon: 'group', color: 'green' },
                      'Marketing': { icon: 'campaign', color: 'pink' },
                      'Other': { icon: 'receipt', color: 'gray' },
                    };
                    
                    const categoryInfo = categoryIcons[expense.category] || categoryIcons['Other'];
                    
                    return (
                      <tr key={expense.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                          <div className={`p-2 bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/50 text-${categoryInfo.color}-600 rounded-lg`}>
                            <span className="material-icons-round text-base">{categoryInfo.icon}</span>
                          </div>
                          <div>
                            <div>{expense.description}</div>
                            {expense.notes && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">{expense.notes}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{expense.category}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {loggedByUser ? loggedByUser.fullName : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{formattedDate}</td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                          Rp {parseFloat(expense.amount).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {expense.receiptUrl && (
                              <a
                                href={`http://localhost:3000${expense.receiptUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-blue-700 transition-colors"
                                title="View Receipt"
                              >
                                <span className="material-icons-round text-lg">receipt</span>
                              </a>
                            )}
                            <button className="text-slate-400 hover:text-primary transition-colors">
                              <span className="material-icons-round">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No expenses recorded yet. Click "Log Expense" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Suggested Content: Staff Schedule & Housekeeping Status */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Staff Roster (Today)</h3>
               <button 
                onClick={() => setIsStaffRosterModalOpen(true)}
                className="text-primary hover:text-blue-700 text-sm font-medium"
               >
                 View Full Schedule
               </button>
            </div>
             <div className="space-y-4">
               {todaysShifts.length > 0 ? (
                 todaysShifts.map(shift => {
                   const user = users.find(u => u.id === shift.userId);
                   if (!user) return null;
                   
                   // Colors based on shift type
                   let badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                   let avatarColor = 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
                   
                   if (shift.shiftType === 'Evening') {
                      badgeColor = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
                      avatarColor = 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
                   }

                   return (
                     <div key={shift.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                       <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${avatarColor}`}>
                           {user.fullName.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.fullName}</p>
                           <p className="text-xs text-slate-500">{user.role} • {shift.startTime.slice(0,5)} - {shift.endTime.slice(0,5)}</p>
                         </div>
                       </div>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                         {shift.status === 'Scheduled' ? 'On Duty' : shift.status}
                       </span>
                     </div>
                   );
                 })
               ) : (
                 <div className="text-center py-8 text-slate-400 text-sm">
                   No shifts scheduled for today.
                 </div>
               )}
             </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Room Maintenance Status</h3>
               <button 
                onClick={() => setIsReportIssueModalOpen(true)}
                className="text-primary hover:text-blue-700 text-sm font-medium"
               >
                 Report Issue
               </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                    <th className="px-4 py-3 font-medium">Room</th>
                    <th className="px-4 py-3 font-medium">Issue</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                  {maintenanceRows.length > 0 ? (
                    maintenanceRows.map((row, index) => (
                      <tr key={row.roomId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{row.roomNumber}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-400 placeholder-slate-300 text-sm p-0"
                            placeholder="Describe issue..."
                            value={row.issue}
                            onChange={(e) => {
                              const newRows = [...maintenanceRows];
                              newRows[index].issue = e.target.value;
                              newRows[index].isSaved = false;
                              setMaintenanceRows(newRows);
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                             type="text"
                             className="w-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-400 placeholder-slate-300 text-sm p-0"
                             placeholder="Priority..."
                             value={row.priority}
                             onChange={(e) => {
                               const newRows = [...maintenanceRows];
                               newRows[index].priority = e.target.value;
                               newRows[index].isSaved = false;
                               setMaintenanceRows(newRows);
                             }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                             type="text"
                             className="w-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-400 placeholder-slate-300 text-sm italic p-0"
                             placeholder="Add notes..."
                             value={row.notes}
                             onChange={(e) => {
                               const newRows = [...maintenanceRows];
                               newRows[index].notes = e.target.value;
                               newRows[index].isSaved = false;
                               setMaintenanceRows(newRows);
                             }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {row.isSaved ? (
                              <button 
                                onClick={() => {
                                  const newRows = [...maintenanceRows];
                                  newRows[index].isSaved = false;
                                  setMaintenanceRows(newRows);
                                }}
                                className="p-1 rounded text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Saved"
                              >
                                <span className="material-icons-round text-lg">check</span>
                              </button>
                            ) : (
                              <button 
                                onClick={async () => {
                                  try {
                                     const response = await fetch(`http://localhost:3000/api/maintenance/room/${row.roomId}`, {
                                       method: 'POST',
                                       headers: {
                                         'Content-Type': 'application/json'
                                       },
                                       body: JSON.stringify({
                                         issueType: row.issue,
                                         priority: row.priority,
                                         description: row.notes,
                                         status: 'Open'
                                       })
                                     });

                                     if (response.ok) {
                                        const newRows = [...maintenanceRows];
                                        newRows[index].isSaved = true;
                                        setMaintenanceRows(newRows);
                                     } else {
                                       console.error('Failed to save maintenance ticket');
                                     }
                                  } catch (err) {
                                    console.error('Error saving maintenance ticket:', err);
                                  }
                                }}
                                className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-slate-400 hover:text-blue-500 transition-colors"
                                title="Save changes"
                              >
                                <span className="material-icons-round text-lg">save</span>
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setMaintenanceRows(prev => prev.filter(r => r.roomId !== row.roomId));
                              }}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 transition-colors"
                              title="Remove from list"
                            >
                              <span className="material-icons-round text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                        No rooms currently in maintenance status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
       </div>


      <InventorySetupModal 
        isOpen={isInventorySetupModalOpen}
        onClose={() => setIsInventorySetupModalOpen(false)}
      />
      <ReportIssueModal
        isOpen={isReportIssueModalOpen}
        onClose={() => setIsReportIssueModalOpen(false)}
      />
      <StaffRosterModal
        isOpen={isStaffRosterModalOpen}
        onClose={() => setIsStaffRosterModalOpen(false)}
        onRosterUpdate={fetchData}
      />
    </div>
  );
}
