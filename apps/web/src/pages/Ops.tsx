import { useState, useEffect } from 'react';
import OpsChart from '../components/OpsChart';
import InventorySetupModal from '../components/InventorySetupModal';
import ReportIssueModal from '../components/ReportIssueModal';
import StaffRosterModal from '../components/StaffRosterModal';
import { expensesApi, inventoryApi, maintenanceApi, roomsApi } from '../services/api';
import type { Expense, InventoryItem, MaintenanceTicket, Room } from '../types';

export default function Ops() {
  const [isInventorySetupModalOpen, setIsInventorySetupModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isStaffRosterModalOpen, setIsStaffRosterModalOpen] = useState(false);

  // API Data State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesData, inventoryData, maintenanceData, roomsData] = await Promise.all([
          expensesApi.getAll(),
          inventoryApi.getAll(),
          maintenanceApi.getAll(),
          roomsApi.getAll(),
        ]);
        setExpenses(expensesData);
        setInventory(inventoryData);
        setMaintenance(maintenanceData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Failed to fetch ops data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Computed values
  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const lowStockItems = inventory.filter(item => item.currentStock < item.minThreshold);
  const openMaintenanceTickets = maintenance.filter(m => m.status !== 'Resolved');

  // Get room number by ID
  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.roomNumber || 'N/A';
  };

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
              <h2 className="text-4xl font-bold">${loading ? '...' : totalMonthlyExpenses.toLocaleString()}</h2>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-rose-100 opacity-90">
              <span>Budget: $10,000</span>
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
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-primary rounded-lg">
                    <span className="material-icons-round text-base">plumbing</span>
                  </div>
                  Pipe Repair Room 204
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Maintenance</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Mike R.</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">Oct 24, 2023</td>
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">$150.00</td>
                <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</span></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                </td>
              </tr>
              <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-lg">
                    <span className="material-icons-round text-base">local_laundry_service</span>
                  </div>
                  Bulk Laundry Detergent
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Supplies</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Sarah J.</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">Oct 23, 2023</td>
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">$450.00</td>
                <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</span></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                </td>
              </tr>
              <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-lg">
                    <span className="material-icons-round text-base">wifi</span>
                  </div>
                  Router Replacement
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">IT / Utilities</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">David K.</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">Oct 22, 2023</td>
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">$89.99</td>
                <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                </td>
              </tr>
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
               <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary font-bold">JD</div>
                   <div>
                     <p className="text-sm font-semibold text-slate-800 dark:text-white">John Doe</p>
                     <p className="text-xs text-slate-500">Front Desk • 08:00 - 16:00</p>
                   </div>
                 </div>
                 <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-300">On Duty</span>
               </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">AS</div>
                   <div>
                     <p className="text-sm font-semibold text-slate-800 dark:text-white">Alice Smith</p>
                     <p className="text-xs text-slate-500">Housekeeping • 09:00 - 17:00</p>
                   </div>
                 </div>
                 <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-300">On Duty</span>
               </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold">RK</div>
                   <div>
                     <p className="text-sm font-semibold text-slate-800 dark:text-white">Robert King</p>
                     <p className="text-xs text-slate-500">Maintenance • 13:00 - 21:00</p>
                   </div>
                 </div>
                 <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-medium dark:bg-slate-700 dark:text-slate-400">Scheduled</span>
               </div>
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
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                  {openMaintenanceTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{getRoomNumber(ticket.roomId)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ticket.issueType}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.priority === 'High' || ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-500 text-xs italic">{ticket.description || 'No notes'}</td>
                    </tr>
                  ))}
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
      />
    </div>
  );
}
