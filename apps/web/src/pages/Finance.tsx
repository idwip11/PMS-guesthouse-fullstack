import FinanceChart from '../components/FinanceChart';

export default function Finance() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
              <span className="material-icons-round">monetization_on</span>
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-0.5">
              <span className="material-icons-round text-sm">trending_up</span> +12.5%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">$45,231.89</h3>
            <p className="text-xs text-slate-400 mt-1">October 2023</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800">
              <span className="material-icons-round">pending_actions</span>
            </div>
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
              8 Invoices
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Outstanding Payments</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">$3,450.00</h3>
            <p className="text-xs text-slate-400 mt-1">Due within 7 days</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <span className="material-icons-round">shopping_bag</span>
            </div>
            <span className="text-xs font-medium text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full flex items-center gap-0.5">
              <span className="material-icons-round text-sm">trending_up</span> +2.1%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Op. Expenses</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">$12,890.50</h3>
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
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">$32,341.39</h3>
            <p className="text-xs text-slate-400 mt-1">28% Margin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
              <button className="px-4 py-2 text-sm font-semibold text-primary bg-white dark:bg-slate-700 shadow-sm rounded-lg transition-all">All Transactions</button>
              <button className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">Invoices</button>
              <button className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">Refunds</button>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="material-icons-round text-lg text-slate-400">date_range</span>
                Oct 2023
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="material-icons-round text-lg text-slate-400">filter_list</span>
                Filter
              </button>
              <button className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="material-icons-round">file_download</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Guest / Entity</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">#TRX-09821</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">JD</div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">John Doe</p>
                          <p className="text-xs text-slate-500">Room 402 - Invoice #INV-2023</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Oct 24, 2023</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">$1,240.00</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                    </td>
                  </tr>
                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">#TRX-09820</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">AS</div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">Alice Smith</p>
                          <p className="text-xs text-slate-500">Room 105 - Mini Bar</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Oct 24, 2023</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">$45.50</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                    </td>
                  </tr>
                  {/* More rows */}
                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">#TRX-09819</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xs font-bold">BK</div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">Booking.com</p>
                          <p className="text-xs text-slate-500">Payout - Sep 2023</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Oct 23, 2023</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">$12,450.00</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Showing 5 of 128 transactions</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Prev</button>
                <button className="px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Next</button>
              </div>
            </div>
          </div>
          
           {/* Added Scrollable Content: Expense Breakdown & Monthly Targets */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Expense Categories</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Maintenance</span>
                            <span className="font-medium text-slate-800 dark:text-white">$5,240 (45%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Utilities</span>
                            <span className="font-medium text-slate-800 dark:text-white">$3,100 (25%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-teal-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Staff Payroll</span>
                            <span className="font-medium text-slate-800 dark:text-white">$3,650 (30%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Monthly Targets</h3>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">85%</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">Revenue Goal</p>
                            <p className="text-xs text-slate-500">$50,000 Target</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-green-500 border-l-transparent flex items-center justify-center">
                            <span className="text-xs font-bold text-green-500">92%</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">Expense Budget</p>
                            <p className="text-xs text-slate-500">Within Limits</p>
                        </div>
                    </div>
                </div>
           </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 dark:text-white">Cash Flow</h3>
              <button className="text-primary text-xs font-medium hover:underline">View Report</button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Income vs Expenses (Last 6 Months)</p>
            <FinanceChart />
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Credit Card</p>
                    <p className="text-xs text-slate-500">Visa, Mastercard</p>
                  </div>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Bank Transfer</p>
                    <p className="text-xs text-slate-500">Direct Deposit</p>
                  </div>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Cash</p>
                    <p className="text-xs text-slate-500">On-site Payment</p>
                  </div>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">10%</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Due Soon</h3>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">3 Critical</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500 flex items-center justify-center">
                  <span className="material-icons-round">priority_high</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Corp Event #22</p>
                  <p className="text-xs text-red-500">Due Today • $4,500</p>
                </div>
                <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors text-sm">arrow_forward_ios</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                  <span className="material-icons-round">receipt_long</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Room 501</p>
                  <p className="text-xs text-slate-500">Due Tomorrow • $280</p>
                </div>
                <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors text-sm">arrow_forward_ios</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
