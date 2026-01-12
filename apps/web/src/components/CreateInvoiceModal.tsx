import { useState } from 'react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#111621]/40 backdrop-blur-[4px] p-4 transition-all">
      <div className="glass-panel w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 bg-white/85 dark:bg-[#111621]/85 backdrop-blur-xl border border-white/60 dark:border-white/10">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Invoice</h1>
            </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="glass-card p-8 rounded-2xl space-y-8 bg-white/50 dark:bg-[#111621]/50">
                    <div className="flex items-center gap-3 text-primary border-b border-gray-100 dark:border-gray-700/50 pb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <span className="material-icons-round text-2xl">date_range</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-slate-800 dark:text-white">Report Period</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Select the date range for your financial summary</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">From Date</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round">event</span>
                                <input className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white text-slate-600 shadow-sm" type="date"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">To Date</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round">event</span>
                                <input className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white text-slate-600 shadow-sm" type="date"/>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Guesthouse Selection</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round">apartment</span>
                            <select className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white shadow-sm appearance-none cursor-pointer">
                                <option disabled selected value="">Select a property</option>
                                <option>Guesthouse 1</option>
                                <option>Guesthouse 2</option>
                                <option>Guesthouse 3</option>
                                <option>Guesthouse 4</option>
                                <option>Guesthouse 5</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round pointer-events-none">expand_more</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-2xl space-y-6 bg-white/50 dark:bg-[#111621]/50">
                    <div className="flex items-center gap-3 text-primary border-b border-gray-100 dark:border-gray-700/50 pb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                            <span className="material-icons-round text-2xl">analytics</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-slate-800 dark:text-white">Financial Summary</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Projected totals based on selected criteria</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-icons-round text-6xl text-green-500">arrow_upward</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Income</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-slate-800 dark:text-white">$12,450.00</span>
                                <span className="text-xs font-medium text-green-500 mb-1 flex items-center">
                                    
                                </span>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-icons-round text-6xl text-red-500">arrow_downward</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Outcome</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-slate-800 dark:text-white">$4,230.50</span>
                                <span className="text-xs font-medium text-slate-400 mb-1">
                                    
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end px-1">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Income Details</h3>
                                <span className="text-xs text-slate-400">Scroll for more</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col h-64">
                                <div className="overflow-y-auto custom-scrollbar p-2 space-y-1 flex-1">
                                    {[
                                        { name: 'Sarah Jenkins', amount: '$350.00', desc: 'Stayed 2 nights in Room 301, 302, with additional laundry service.' },
                                        { name: 'Michael Chen', amount: '$1,200.00', desc: 'Weekly booking Room 405 + Airport Transfer' },
                                        { name: 'Emma Watson', amount: '$450.00', desc: '3 nights Deluxe Suite (201)' },
                                        { name: 'David Miller', amount: '$890.00', desc: 'Corporate booking for 2 rooms' },
                                        { name: 'Jessica Wong', amount: '$210.00', desc: '1 night standard room' },
                                    ].map((income, i) => (
                                        <div key={i} className="p-3 hover:bg-white dark:hover:bg-slate-700/50 rounded-lg transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{income.name}</span>
                                                <span className="font-bold text-green-600 dark:text-green-400 text-sm">{income.amount}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{income.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end px-1">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Outcome Details</h3>
                                <span className="text-xs text-slate-400">Scroll for more</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col h-64">
                                <div className="overflow-y-auto custom-scrollbar p-2 space-y-1 flex-1">
                                    {[
                                        { name: 'Electricity', amount: '$450.00', icon: 'electric_bolt', color: 'orange' },
                                        { name: 'Water', amount: '$120.50', icon: 'water_drop', color: 'blue' },
                                        { name: 'Supplies', amount: '$320.00', icon: 'cleaning_services', color: 'purple' },
                                        { name: 'Internet', amount: '$85.00', icon: 'router', color: 'emerald' },
                                        { name: 'Maintenance', amount: '$250.00', icon: 'build', color: 'rose' },
                                    ].map((outcome, i) => (
                                        <div key={i} className="p-3 hover:bg-white dark:hover:bg-slate-700/50 rounded-lg transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-600 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 bg-${outcome.color}-100 dark:bg-${outcome.color}-500/10 rounded-lg text-${outcome.color}-600 dark:text-${outcome.color}-400`}>
                                                    <span className="material-icons-round text-lg">{outcome.icon}</span>
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{outcome.name}</span>
                                            </div>
                                            <span className="font-bold text-red-500 dark:text-red-400 text-sm">{outcome.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                        <span className="text-base font-medium text-slate-600 dark:text-slate-400">Net Profit</span>
                        <span className="text-2xl font-bold text-primary">$8,219.50</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 text-lg">
                        <span className="material-icons-round">picture_as_pdf</span>
                        Generate Invoice PDF
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        This will download a summarized PDF invoice for the selected period and property.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
