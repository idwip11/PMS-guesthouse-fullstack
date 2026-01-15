import { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query'; // Assuming we might want to use react-query later, but for now simple useEffect
import FinanceChart from '../components/FinanceChart';
import { financeApi } from '../services/api';

import TargetSetupModal from '../components/TargetSetupModal';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart';

export default function Finance() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Clean Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'inflow' | 'outflow'>('all');

  useEffect(() => {
    fetchDashboard();
  }, [selectedMonth, selectedYear]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await financeApi.getDashboard(selectedMonth, selectedYear);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to fetch finance dashboard:', err);
      setError(err.message || 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTarget = async (amount: number) => {
    await financeApi.saveTarget({
        month: selectedMonth,
        year: selectedYear,
        targetAmount: amount
    });
    // Refresh data
    await fetchDashboard();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500 font-medium">Error: {error}</div>
      </div>
    );
  }

  const { kpi, transactions, chartData } = dashboardData;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((trx: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'inflow') return trx.type === 'Inflow';
    if (activeTab === 'outflow') return trx.type === 'Outflow';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Overview</h1>
            <p className="text-slate-500 text-sm">Track your revenue and expenses</p>
        </div>
        <div className="flex items-center gap-3">
            <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none text-slate-700 dark:text-slate-200"
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
            </select>
            <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none text-slate-700 dark:text-slate-200"
            >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
      </div>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
              <span className="material-icons-round">monetization_on</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-0.5 ${
                kpi.revenueChange >= 0 
                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' 
                : 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className="material-icons-round text-sm">{kpi.revenueChange >= 0 ? 'trending_up' : 'trending_down'}</span> 
              {kpi.revenueChange > 0 ? '+' : ''}{kpi.revenueChange.toFixed(1)}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(kpi.totalRevenue)}</h3>
            <p className="text-xs text-slate-400 mt-1">All time logged</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800">
              <span className="material-icons-round">pending_actions</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Outstanding Payments</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(kpi.outstanding)}</h3>
            <p className="text-xs text-slate-400 mt-1">Unpaid reservations</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <span className="material-icons-round">shopping_bag</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-0.5 ${
                kpi.expensesChange <= 0 
                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' 
                : 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className="material-icons-round text-sm">{kpi.expensesChange > 0 ? 'trending_up' : 'trending_down'}</span> 
              {kpi.expensesChange > 0 ? '+' : ''}{kpi.expensesChange.toFixed(1)}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Op. Expenses</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(kpi.opExpenses)}</h3>
            <p className="text-xs text-slate-400 mt-1">Utilities & Maintenance</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 blur-xl"></div>
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              <span className="material-icons-round">savings</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Profit</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(kpi.netProfit)}</h3>
            <p className="text-xs text-slate-400 mt-1">Revenue - Expenses</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'text-primary bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                All Transactions
              </button>
              <button 
                onClick={() => setActiveTab('inflow')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'inflow' ? 'text-primary bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                Invoices
              </button>
              <button 
                onClick={() => setActiveTab('outflow')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'outflow' ? 'text-primary bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                Expenses
              </button>
            </div>

          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((trx: any) => (
                      <tr key={trx.id + trx.type} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                               trx.type === 'Inflow' 
                               ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                               : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                           }`}>
                               {trx.type}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="font-medium text-slate-800 dark:text-white">{trx.description || trx.category}</div>
                           {trx.refId && <div className="text-xs text-slate-500">Ref: {trx.refId}</div>}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {new Date(trx.date).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 font-bold ${trx.type === 'Inflow' ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {trx.type === 'Outflow' ? '-' : '+'}{formatCurrency(trx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
             {/* Pagination controls removed for simplicity as API returns fixed limit */}
          </div>
          
           {/* Added Scrollable Content: Expense Breakdown & Monthly Targets */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl h-80 flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Expense Categories</h3>
                    <div className="flex-1 min-h-0">
                        <ExpenseCategoryChart data={dashboardData?.expenseCategories || []} />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white">Monthly Targets</h3>
                        <button 
                            onClick={() => setIsTargetModalOpen(true)}
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Setup
                        </button>
                    </div>
                    {(() => {
                        const target = dashboardData?.target || { currentRevenue: 0, monthlyTarget: 1 };
                        const percentage = Math.min(100, Math.round((target.currentRevenue / target.monthlyTarget) * 100));
                        
                        return (
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.93} strokeDashoffset={175.93 - (175.93 * percentage) / 100} className="text-primary transition-all duration-1000 ease-out" />
                                    </svg>
                                    <span className="absolute text-sm font-bold text-primary">{percentage}%</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Revenue Goal</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formatCurrency(target.currentRevenue)} / <span className="text-slate-400">{formatCurrency(target.monthlyTarget)}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
           </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 dark:text-white">Cash Flow</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Income vs Expenses (Last 6 Months)</p>
            <FinanceChart data={chartData} />
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {(() => {
                 const predefinedMethods = [
                    { name: 'Cash', color: 'bg-orange-500', subtitle: 'On-site Payment' },
                    { name: 'Credit Card', color: 'bg-blue-500', subtitle: 'Visa, Mastercard' },
                    { name: 'Bank Transfer', color: 'bg-teal-500', subtitle: 'Direct Deposit' },
                    { name: 'Online', color: 'bg-purple-500', subtitle: 'OTA (Booking.com, Agoda, etc)' }
                 ];

                 const apiMethods = dashboardData?.paymentMethods || [];

                 return predefinedMethods.map((pm) => {
                    const stats = apiMethods.find((item: any) => item.method === pm.name) || { percentage: 0, count: 0 };
                    
                    return (
                        <div key={pm.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-8 ${pm.color} rounded-full`}></div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{pm.name}</p>
                                    <p className="text-xs text-slate-500">{pm.subtitle}</p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white">{stats.percentage}%</span>
                        </div>
                    );
                 });
              })()}
            </div>
          </div>
        </div>
      </div>
      <TargetSetupModal 
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onSave={handleSaveTarget}
        initialTarget={dashboardData?.target?.monthlyTarget || 0}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  );
}
