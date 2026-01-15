import { useState, useEffect } from 'react';
import OpsChart from '../components/OpsChart';
import InventorySetupModal from '../components/InventorySetupModal';
import ReportIssueModal from '../components/ReportIssueModal';
import StaffRosterModal from '../components/StaffRosterModal';
import BudgetSetupModal from '../components/BudgetSetupModal';
import { expensesApi, inventoryApi, maintenanceApi, roomsApi, shiftsApi, usersApi, budgetsApi } from '../services/api';
import type { Expense, InventoryItem, MaintenanceTicket, Room, Shift, User } from '../types';

export default function Ops() {
  const [isInventorySetupModalOpen, setIsInventorySetupModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isStaffRosterModalOpen, setIsStaffRosterModalOpen] = useState(false);
  // State for toggling expense view
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  // State for month/year filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // State for budget setup modal
  const [isBudgetSetupModalOpen, setIsBudgetSetupModalOpen] = useState(false);
  // State for selected month's budget
  const [currentMonthBudget, setCurrentMonthBudget] = useState<number>(0);

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
      setLoading(false); // Set loading to false after successful fetch
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const fetchCurrentMonthBudget = async () => {
    try {
      const budgets = await budgetsApi.getByYear(selectedYear);
      const budget = budgets.find(b => b.month === selectedMonth && b.year === selectedYear);
      setCurrentMonthBudget(budget ? parseFloat(budget.projectedAmount) : 0);
    } catch (error) {
      console.error('Error fetching budget:', error);
      setCurrentMonthBudget(0);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    fetchCurrentMonthBudget();
  }, [selectedMonth, selectedYear]);


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
  // Filter expenses by selected month and year
  const filteredExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.dateIncurred);
    return expenseDate.getMonth() + 1 === selectedMonth && expenseDate.getFullYear() === selectedYear;
  });
  const totalMonthlyExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Calculate previous month expenses for % change
  const previousMonthDate = new Date(selectedYear, selectedMonth - 2, 1); // Month is 0-indexed in Date
  const previousMonth = previousMonthDate.getMonth() + 1;
  const previousMonthYear = previousMonthDate.getFullYear();

  const prevMonthExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.dateIncurred);
    return expenseDate.getMonth() + 1 === previousMonth && expenseDate.getFullYear() === previousMonthYear;
  });
  
  const totalPrevMonthExpenses = prevMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  
  const expenseChangePercent = totalPrevMonthExpenses === 0 
    ? (totalMonthlyExpenses > 0 ? 100 : 0)
    : ((totalMonthlyExpenses - totalPrevMonthExpenses) / totalPrevMonthExpenses) * 100;
  // Match Inventory Alerts logic: Stock <= Threshold + 10
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minThreshold + 10);
  const openMaintenanceTickets = maintenance.filter(m => m.status !== 'Resolved');
  // Count rooms with Maintenance status
  const maintenanceRoomsCount = rooms.filter(room => room.status === 'Maintenance').length;
  
  // Calculate budget usage percentage
  const budgetUsagePercent = currentMonthBudget > 0 
    ? Math.min(Math.round((totalMonthlyExpenses / currentMonthBudget) * 100), 100)
    : 0;

  // Filter shifts for today
  const todaysDateStr = new Date().toISOString().split('T')[0];
  const todaysShifts = shifts.filter(s => s.shiftDate.startsWith(todaysDateStr));

  // Month names for dropdown
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  const years = Array.from({ length: 8 }, (_, i) => 2025 + i); // 2025-2032

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Operations Overview Header with Month/Year Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Operations Overview</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

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
              <span className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1 ${
                expenseChangePercent > 0 
                  ? 'bg-red-400/20 text-red-50 border-red-400/30' 
                  : 'bg-green-400/20 text-green-50 border-green-400/30'
              }`}>
                <span className="material-icons-round text-sm">{expenseChangePercent > 0 ? 'arrow_upward' : 'arrow_downward'}</span> {Math.abs(expenseChangePercent).toFixed(1)}%
              </span>
            </div>
            <h3 className="text-rose-100 text-sm font-medium uppercase tracking-wide">Monthly OpEx</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">Rp {loading ? '...' : totalMonthlyExpenses.toLocaleString('id-ID')}</h2>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-rose-100 opacity-90">
              <span>Budget: Rp {currentMonthBudget.toLocaleString('id-ID')}</span>
              <span>{budgetUsagePercent}% Used</span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-red-900/30 rounded-full overflow-hidden">
              <div className={`h-full bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]`} style={{ width: `${budgetUsagePercent}%` }}></div>
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
              <span className="text-amber-100 text-sm">Items Low or Critical</span>
            </div>
            <div className="flex -space-x-2 mt-4">
              {lowStockItems.slice(0, 3).map((item) => (
                <span key={item.id} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 ring-2 ring-orange-500 text-xs font-bold uppercase" title={item.name}>
                  {item.name.substring(0, 2)}
                </span>
              ))}
              {lowStockItems.length > 3 && (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 ring-2 ring-orange-500 text-xs font-bold">
                  +{lowStockItems.length - 3}
                </span>
              )}
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
              <h2 className="text-4xl font-bold">{maintenanceRoomsCount}</h2>
              <span className="text-blue-200 text-sm">Rooms in Maintenance</span>
            </div>
            <p className="text-blue-100 text-sm mt-4 opacity-90">{openMaintenanceTickets.filter(m => m.priority === 'High' || m.priority === 'Critical').length} Urgent Tickets</p>
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
              <button 
                onClick={() => setIsBudgetSetupModalOpen(true)}
                className="px-3 py-1.5 text-sm font-medium text-primary bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors flex items-center gap-1.5"
              >
                <span className="material-icons-round text-base">settings</span>
                Setup Budget
              </button>

              <button className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <span className="material-icons-round text-lg">download</span>
              </button>
            </div>
          </div>
          <div className="relative h-72 w-full">
            <OpsChart expenses={expenses} />
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
            {/* Items approaching threshold (within 10 units) */}
            {inventory
              .filter(item => item.currentStock <= item.minThreshold + 10)
              .sort((a, b) => (a.currentStock - a.minThreshold) - (b.currentStock - b.minThreshold))
              .map(item => {
                const isCritical = item.currentStock <= item.minThreshold;
                const isWarning = !isCritical && item.currentStock <= item.minThreshold + 10;
                
                // Generate WhatsApp link with vendor contact
                const whatsappLink = item.contactVendor 
                  ? `https://wa.me/${item.contactVendor.replace(/\D/g, '')}?text=Hi, I would like to order more ${item.name}. Current stock: ${item.currentStock} ${item.unit}`
                  : '#';
                
                return (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isCritical 
                        ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30'
                        : isWarning
                          ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 border border-transparent'
                    } group`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                      isCritical 
                        ? 'bg-white dark:bg-red-900/40 text-red-500 dark:text-red-400'
                        : isWarning
                          ? 'bg-white dark:bg-amber-900/40 text-amber-500 dark:text-amber-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      <span className="material-icons-round text-lg">inventory_2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                      <p className={`text-xs ${
                        isCritical 
                          ? 'text-red-500 dark:text-red-400'
                          : isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.currentStock} {item.unit} remaining
                      </p>
                    </div>
                    {item.contactVendor ? (
                      <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm border transition-colors ${
                          isCritical
                            ? 'text-red-600 bg-white dark:bg-red-900/50 border-red-100 dark:border-red-800 hover:bg-red-50'
                            : 'text-amber-700 bg-white dark:bg-amber-900/50 border-amber-100 dark:border-amber-800 hover:bg-amber-50'
                        }`}
                      >
                        Order
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">{item.currentStock} {item.unit}</span>
                    )}
                  </div>
                );
              })}
            {inventory.filter(item => item.currentStock <= item.minThreshold + 10).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <span className="material-icons-round text-4xl mb-2 opacity-50">check_circle</span>
                <p>All inventory items are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Recent Operational Expenses */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {showAllExpenses ? 'All Operational Expenses' : 'Recent Operational Expenses'}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAllExpenses(!showAllExpenses)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                showAllExpenses 
                  ? 'text-primary bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {showAllExpenses ? 'Show Recent Only' : 'All Expenses'}
            </button>
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
                  .slice(0, showAllExpenses ? undefined : 5)
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

            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                    <th className="px-4 py-3 font-medium w-16">Room</th>
                    <th className="px-4 py-3 font-medium min-w-[200px]">Issue</th>
                    <th className="px-4 py-3 font-medium w-24">Priority</th>
                    <th className="px-4 py-3 font-medium min-w-[200px]">Notes</th>
                    <th className="px-4 py-3 font-medium text-right w-20">Action</th>
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
        onClose={() => {
          setIsInventorySetupModalOpen(false);
          fetchData(); // Refresh inventory data
        }}
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
      <BudgetSetupModal
        isOpen={isBudgetSetupModalOpen}
        onClose={() => {
          setIsBudgetSetupModalOpen(false);
          fetchData(); // Refresh chart data after budget update
        }}
        year={selectedYear}
      />
    </div>
  );
}
