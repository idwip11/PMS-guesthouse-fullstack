
import { useState, useEffect } from 'react';
import SchedulePromoModal from '../components/SchedulePromoModal';
import MarketingBudgetSetupModal from '../components/MarketingBudgetSetupModal';
import LoyaltyMembersModal from '../components/LoyaltyMembersModal';
import type { CampaignData } from '../components/SchedulePromoModal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Marketing() {
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(null);
  const [loyaltyMembers, setLoyaltyMembers] = useState<any[]>([]);

  const [stats, setStats] = useState({ 
    totalMembers: 0, 
    newMembersThisWeek: 0,
    sourceDistribution: [] as { source: string, count: number, revenue: number }[],
    marketingROI: { spend: 0, revenue: 0, budget: 0 },
    leadTime: 0
  });

  useEffect(() => {
    fetchCampaigns();
    fetchLoyaltyMembers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/marketing/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchLoyaltyMembers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/marketing/loyalty-members');
      if (response.ok) {
        const data = await response.json();
        setLoyaltyMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty members', error);
    }
  };

  const handleUpdatePoints = async (id: string, newPoints: number) => {
    try {
        const response = await fetch(`http://localhost:3000/api/marketing/loyalty-members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pointsBalance: newPoints })
        });
        if (response.ok) {
            fetchLoyaltyMembers();
        }
    } catch (error) {
        console.error('Failed to update points', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/marketing/loyalty-members/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchLoyaltyMembers();
        }
    } catch (error) {
        console.error('Failed to delete member', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/marketing');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        console.error('Expected array of campaigns but got:', data);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      setCampaigns([]);
    }
  };

  const handleCreateOrUpdate = async (data: CampaignData) => {
    try {
      if (editingCampaign && editingCampaign.id) {
        // Update
        await fetch(`http://localhost:3000/api/marketing/${editingCampaign.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        // Create
        await fetch('http://localhost:3000/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setIsPromoModalOpen(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to save campaign', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await fetch(`http://localhost:3000/api/marketing/${id}`, {
          method: 'DELETE',
        });
        fetchCampaigns();
      } catch (error) {
        console.error('Failed to delete campaign', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setIsPromoModalOpen(true);
  };

  const openEditModal = (campaign: CampaignData) => {
    setEditingCampaign(campaign);
    setIsPromoModalOpen(true);
  };

  // Chart Data
  const sourceChartData = {
    labels: stats.sourceDistribution?.map(s => s.source) || [],
    datasets: [
      {
        data: stats.sourceDistribution?.map(s => s.count) || [],
        backgroundColor: [
          '#10b981', // emerald-500
          '#3b82f6', // blue-500
          '#f59e0b', // amber-500
          '#ef4444', // red-500
          '#8b5cf6', // violet-500
          '#ec4899', // pink-500
        ],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: true, // Show legend to avoid truncation issues if side-by-side relies on it, or we can use custom legend. User said "Direct / Walk-in" is truncated in custom legend list.
        position: 'right' as const,
        labels: {
            boxWidth: 10,
            usePointStyle: true,
            font: {
                size: 10
            }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Members Card */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-blue-900/10 dark:shadow-none bg-gradient-to-br from-blue-600 to-indigo-700 h-full">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 text-white h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">diversity_3</span>
              </div>
              <span className="text-xs font-medium bg-green-400/20 text-green-100 px-2 py-1 rounded-full border border-green-400/30 flex items-center gap-1">
                <span className="material-icons-round text-sm">trending_up</span> +{stats.newMembersThisWeek} this week
              </span>
            </div>
            <div>
              <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wide">Loyalty Members</h3>
              <h2 className="text-4xl font-bold mt-1 text-white">{stats.totalMembers.toLocaleString()}</h2>
              <p className="text-blue-100 text-sm mt-4 opacity-90">Active participants in loyalty program</p>
            </div>
          </div>
        </div>

        {/* Booking Source Distribution (REPLACED Points Redeemed) */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-teal-900/10 dark:shadow-none bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
               <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wide">Booking Source</h3>
               <p className="text-xs text-slate-400">Distribution by channel</p>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <span className="material-icons-round text-xl">pie_chart</span>
            </div>
          </div>
          <div className="flex items-center gap-4 h-32">
            <div className="w-full h-32 relative flex items-center justify-center">
               <Doughnut data={sourceChartData} options={{
                   ...chartOptions,
                   plugins: {
                       ...chartOptions.plugins,
                       legend: { display: false } // Keep custom legend but fix truncation there
                   }
               }} />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-bold text-slate-400">Sources</span>
               </div>
            </div>
          </div>
          <div className="mt-2 space-y-2 overflow-y-auto max-h-32 custom-scrollbar pr-2">
            {stats.sourceDistribution?.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sourceChartData.datasets[0].backgroundColor[index % 6] }}></span>
                <span className="text-slate-600 dark:text-slate-300 truncate" title={item.source || 'Direct'}>{item.source || 'Direct'}</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-white flex-shrink-0 ml-2 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">{item.count}</span>
            </div>
            ))}
            {(!stats.sourceDistribution || stats.sourceDistribution.length === 0) && (
            <p className="text-xs text-slate-400 italic">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Marketing ROI (REPLACED Campaign Conversion) */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-orange-900/10 dark:shadow-none bg-gradient-to-br from-orange-500 to-amber-600 h-full text-white">
          <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons-round text-xl">auto_graph</span>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-orange-100 text-sm font-medium uppercase tracking-wide">ROAS (Return on Ad Spend)</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-4xl font-bold">
                    {stats.marketingROI.budget > 0 
                      ? (stats.marketingROI.revenue / stats.marketingROI.budget).toFixed(1)
                      : '0.0'}x
                  </h2>
                  <span className="text-orange-200 text-sm">Return</span>
                </div>
              </div>
              <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Setup Budget"
              >
                 <span className="material-icons-round text-lg">settings</span>
              </button>
            </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10 text-center">
                <div>
                   <p className="text-orange-200 text-[10px] uppercase">Budget</p>
                   <p className="font-semibold text-white text-sm">{formatCurrency(stats.marketingROI?.budget || 0)}</p>
                </div>
                <div>
                   <p className="text-orange-200 text-[10px] uppercase">Revenue</p>
                   <p className="font-semibold text-white text-sm">{formatCurrency(stats.marketingROI?.revenue || 0)}</p>
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Loyalty Members & Lead Time */}
        <div className="lg:col-span-2 space-y-6">
            {/* Booking Lead Time Panel (NEW) */}
            <div className="glass-card rounded-2xl p-6 flex items-center justify-between relative">
                {/* Decorative Background - clipped */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <span className="material-icons-round text-9xl text-indigo-600 dark:text-indigo-400">hourglass_empty</span>
                    </div>
                </div>
                
                <div className="relative z-20">
                   <div className="flex items-center gap-3 mb-1 group relative w-fit">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                         <span className="material-icons-round text-xl text-indigo-600 dark:text-indigo-400">event_available</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-dashed border-indigo-300 dark:border-indigo-700 cursor-help">Booking Lead Time</h3>
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        The average number of days between booking creation and check-in date. A higher number indicates guests plan further in advance.
                        <div className="absolute left-8 -bottom-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                      </div>
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">Average advance booking period.</p>
                </div>
                <div className="relative z-20 text-right pr-4">
                   <span className="text-4xl font-bold block text-slate-800 dark:text-white">{stats.leadTime}</span>
                   <span className="text-sm text-slate-400 uppercase tracking-wide">Days Average</span>
                </div>
            </div>

            {/* Loyalty Members Table */}
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Loyalty Members</h3>
                <button 
                  onClick={() => setIsLoyaltyModalOpen(true)}
                  className="text-primary hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View All <span className="material-icons-round text-base">chevron_right</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-4 font-medium">Member</th>
                      <th className="px-6 py-4 font-medium">Member ID</th>
                      <th className="px-6 py-4 font-medium">Points Balance</th>
                      <th className="px-6 py-4 font-medium">Last Activity</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                    {loyaltyMembers.length > 0 ? (
                      loyaltyMembers.slice(0, 5).map((member) => (
                        <tr key={member.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {member.guestName?.charAt(0) || 'M'}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">{member.guestName || 'Unknown Guest'}</p>
                                <p className="text-xs text-slate-400">ID: #{member.memberId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                              <span className="material-icons-round text-[10px]">card_membership</span> {member.memberId}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 font-medium">{member.pointsBalance} pts</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                            {member.lastActivity ? new Date(member.lastActivity).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round">more_vert</span></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No loyalty members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>

        {/* Right Column: Active Campaigns */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Active Campaigns</h3>

          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            
            {Array.isArray(campaigns) && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-800/50 hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    {campaign.status}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(campaign)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-all"
                      title="Edit"
                    >
                      <span className="material-icons-round text-sm">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(campaign.id!)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-all"
                      title="Delete"
                    >
                      <span className="material-icons-round text-sm">delete</span>
                    </button>
                  </div>
                </div>
                
                <h4 className="font-semibold text-slate-800 dark:text-white mb-1">{campaign.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{campaign.discountDetails}</p>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{campaign.description}</p>
                
                <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex justify-between text-xs text-slate-400">
                  <span>Ends: {new Date(campaign.endDate).toLocaleDateString()}</span>
                  <span className="text-slate-500">{campaign.targetAudience}</span>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                No active campaigns found. Check backend connection.
              </div>
            )}

            <div 
              onClick={openCreateModal}
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
        isOpen={isPromoModalOpen} 
        onClose={() => {
          setIsPromoModalOpen(false);
          setEditingCampaign(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCampaign}
      />

      <MarketingBudgetSetupModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          fetchStats(); // Refresh ROI and Budget data
        }}
        year={new Date().getFullYear()}
      />

      <LoyaltyMembersModal
        isOpen={isLoyaltyModalOpen}
        onClose={() => setIsLoyaltyModalOpen(false)}
        members={loyaltyMembers}
        onUpdatePoints={handleUpdatePoints}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
}
