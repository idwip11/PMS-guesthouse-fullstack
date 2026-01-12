import { useState } from 'react';
import SchedulePromoModal from '../components/SchedulePromoModal';

export default function Marketing() {
  const [isSchedulePromoModalOpen, setIsSchedulePromoModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Members Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-blue-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">diversity_3</span>
              </div>
              <span className="text-xs font-medium bg-green-400/20 text-green-100 px-2 py-1 rounded-full border border-green-400/30 flex items-center gap-1">
                <span className="material-icons-round text-sm">trending_up</span> +8.2%
              </span>
            </div>
            <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Members</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">1,248</h2>
            </div>
            <div className="mt-4 flex gap-1 items-center text-sm text-blue-100 opacity-90">
              <span>32 new members this week</span>
            </div>
          </div>
        </div>

        {/* Points Redeemed Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-teal-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600"></div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">stars</span>
              </div>
              <span className="text-xs font-medium bg-white/20 text-white px-2 py-1 rounded-full border border-white/30">
                This Month
              </span>
            </div>
            <h3 className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Points Redeemed</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">85.4k</h2>
            </div>
            <div className="mt-4 h-1.5 w-full bg-emerald-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/90 w-[65%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Campaign Conversion Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-orange-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600"></div>
          <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">auto_graph</span>
              </div>
            </div>
            <h3 className="text-orange-100 text-sm font-medium uppercase tracking-wide">Campaign Conversion</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-4xl font-bold">12.5%</h2>
              <span className="text-orange-200 text-sm">Avg. Rate</span>
            </div>
            <p className="text-orange-100 text-sm mt-4 opacity-90">Best performance: "Summer Sale"</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loyalty Members Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Loyalty Members (features coming soon)</h3>
            <button className="text-primary hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View All <span className="material-icons-round text-base">chevron_right</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Tier Status</th>
                  <th className="px-6 py-4 font-medium">Points Balance</th>
                  <th className="px-6 py-4 font-medium">Last Activity</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">LQ</div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Luu, Quang Thuan</p>
                        <p className="text-xs text-slate-400">ID: #99281</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 dark:from-yellow-900 dark:to-amber-900 dark:text-yellow-200 border border-amber-200 dark:border-amber-800">
                      <span className="material-icons-round text-[10px]">emoji_events</span> Gold
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 font-medium">12,450 pts</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">2 days ago</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                  </td>
                </tr>
                <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">HM</div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Han, Thi Hong Han</p>
                        <p className="text-xs text-slate-400">ID: #82104</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      Silver
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 font-medium">4,200 pts</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">1 week ago</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                  </td>
                </tr>
                <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">TN</div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Tran, Ngoc Anh Nhien</p>
                        <p className="text-xs text-slate-400">ID: #10293</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900 dark:to-indigo-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                      <span className="material-icons-round text-[10px]">diamond</span> Platinum
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 font-medium">48,920 pts</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">Just now</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                  </td>
                </tr>
                <tr className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">JS</div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">John Smith</p>
                        <p className="text-xs text-slate-400">ID: #55120</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      Silver
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 font-medium">1,100 pts</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">3 months ago</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Campaigns List */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Active Campaigns</h3>
            <button className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-icons-round">tune</span>
            </button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-800/50 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <span className="material-icons-round text-lg">local_offer</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Summer Early Bird</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">20% off for bookings &gt; 3 nights.</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span>Redemptions</span>
                  <span>45 / 100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%] rounded-full"></div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex justify-between text-xs text-slate-400">
                <span>Ends: Aug 31</span>
                <span className="group-hover:text-primary transition-colors cursor-pointer font-medium">Manage</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-800/50 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <span className="material-icons-round text-lg">card_membership</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Loyalty Upgrade</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Double points for Gold members.</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span>Participation</span>
                  <span>128 Users</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[75%] rounded-full"></div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex justify-between text-xs text-slate-400">
                <span>Ends: Oct 15</span>
                <span className="group-hover:text-primary transition-colors cursor-pointer font-medium">Manage</span>
              </div>
            </div>

            <div 
              onClick={() => setIsSchedulePromoModalOpen(true)}
              className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group flex flex-col items-center justify-center text-center py-6"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-2 group-hover:text-primary group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                <span className="material-icons-round">add</span>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">Schedule New Promo</span>
            </div>
          </div>
        </div>
      </div>
      
      <SchedulePromoModal 
        isOpen={isSchedulePromoModalOpen} 
        onClose={() => setIsSchedulePromoModalOpen(false)} 
      />
    </div>
  );
}
