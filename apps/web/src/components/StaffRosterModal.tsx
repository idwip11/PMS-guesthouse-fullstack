
import { useState, useEffect } from 'react';

interface StaffRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffRosterModal({ isOpen, onClose }: StaffRosterModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
<button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span className="material-icons-round text-base">chevron_left</span>
</button>
<span className="text-sm font-semibold px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">Oct 23 - Oct 29, 2023</span>
<button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
<span className="material-icons-round text-base">chevron_right</span>
</button>
</div>
<button className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
<span className="material-icons-round text-lg">person_add</span>
                        Assign New Shift
                    </button>
</div>
<div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
<table className="w-full text-left border-collapse bg-white/20 dark:bg-slate-800/20">
<thead>
<tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
<th className="px-6 py-4 font-semibold w-64">Staff Member</th>
<th className="px-4 py-4 font-semibold text-center">Mon 23</th>
<th className="px-4 py-4 font-semibold text-center">Tue 24</th>
<th className="px-4 py-4 font-semibold text-center">Wed 25</th>
<th className="px-4 py-4 font-semibold text-center">Thu 26</th>
<th className="px-4 py-4 font-semibold text-center">Fri 27</th>
<th className="px-4 py-4 font-semibold text-center">Sat 28</th>
<th className="px-4 py-4 font-semibold text-center bg-blue-50/30 dark:bg-blue-900/10">Sun 29</th>
</tr>
</thead>
<tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
<tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
<img alt="Staff" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDizQKjZazi8S5Xeaj2OlpbF5WcSONFMN-1K4L1a38Fvg0lV6bIUtcvgv9e2tP64vGdgr3BgVFqk1S-wiz12MjzrtWSSNvD-222lkjaMPOhaId8uWSx0KEXaSAFbAFdTrzanOPc7FKo7QePdFD2nUaSXbRE3eCY2M7t9EpAl5jgKjWhlt576QPq1BK2BAIT-65qM7Uo93sNprjuKkzzMafrD4OsZYEggroPahVYbPuliX7MpAJOwu4CeXQ_duqRYYylADNsapK_w"/>
</div>
<div>
<p className="font-bold text-slate-800 dark:text-white">Marcus Lee</p>
<p className="text-xs text-primary font-medium">Receptionist</p>
</div>
</div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        07:00-15:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        07:00-15:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">EVENING</span>
                                        15:00-23:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="h-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600">
<span className="material-icons-round text-sm">block</span>
</div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        07:00-15:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">EVENING</span>
                                        15:00-23:00
                                    </div>
</td>
<td className="px-2 py-4 bg-blue-50/20 dark:bg-blue-900/5">
<div className="h-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600">
<span className="material-icons-round text-sm">block</span>
</div>
</td>
</tr>
<tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
<img alt="Staff" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC948nSa4qeOvwLLyGb3HjXtPteHu9zDxn02DPKOt6_OHWiRE7VFCZo80WoicMHtMD-2dy-4I8TeS2yr7xrVdJuzHvwBwNbP-ssEeOWpkNUZxM3HLWPmz9BBautuhFP41zywzQzD-69NBbQGn3OQQhvI1WJLqQycmesnv25-rakCzjyWKG8z-_rBW2ZPdW3zVnpTXJTIx1Jijb-z3DgesJxNcIhz58CyCVXVKMmXrP5XzlFvMeYX7FWZt85wVWKPMGL6VcjxreQ0Q"/>
</div>
<div>
<p className="font-bold text-slate-800 dark:text-white">Elena Petrova</p>
<p className="text-xs text-orange-500 font-medium">Housekeeper</p>
</div>
</div>
</td>
<td className="px-2 py-4">
<div className="h-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600">
<span className="material-icons-round text-sm">block</span>
</div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        08:00-16:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        08:00-16:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        08:00-16:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        08:00-16:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="h-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600">
<span className="material-icons-round text-sm">block</span>
</div>
</td>
<td className="px-2 py-4 bg-blue-50/20 dark:bg-blue-900/5">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        08:00-16:00
                                    </div>
</td>
</tr>
<tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
<img alt="Staff" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXZxJk3UP3531fpm0yIKuLauMF0Bcj6rPZGf_SX0IEgXGh6Ksicduva0VGX_UA9Ij1n3MfdoQHubV6UE9SbnXJ5397-MU4zz_lu0j8vHW2MRBuhQj9kwBWUteovKYA0iR8c1lj12SDTQ0kKBZEL9HVnLKjioPj7Vw6fLTSHLA9H53B8U2nyv1SRKCShy-TKtVAq2ylPwu9ArHZs2cYQTCMWArVYnGjtnombKiwJMTI-trLMmnzw77RPPV-pWYGKM8OC0lkDQI9rQ"/>
</div>
<div>
<p className="font-bold text-slate-800 dark:text-white">Thomas Wu</p>
<p className="text-xs text-primary font-medium">Receptionist</p>
</div>
</div>
</td>
<td className="px-2 py-4">
<div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">EVENING</span>
                                        15:00-23:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">EVENING</span>
                                        15:00-23:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="h-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600">
<span className="material-icons-round text-sm">block</span>
</div>
</td>
<td className="px-2 py-4">
<div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">MORNING</span>
                                        07:00-15:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">EVENING</span>
                                        15:00-23:00
                                    </div>
</td>
<td className="px-2 py-4">
<div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">EVENING</span>
                                        15:00-23:00
                                    </div>
</td>
<td className="px-2 py-4 bg-blue-50/20 dark:bg-blue-900/5">
<div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 p-2 rounded-lg text-[10px] leading-tight text-center cursor-pointer hover:scale-105 transition-transform">
<span className="block font-bold">EVENING</span>
                                        15:00-23:00
                                    </div>
</td>
</tr>
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
<span className="text-xs text-slate-600 dark:text-slate-400">Morning: 08:00 - 16:00 / 09:00 - 17:00</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-indigo-400"></span>
<span className="text-xs text-slate-600 dark:text-slate-400">Evening: 17:00 - 01:00</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full border border-dashed border-slate-400"></span>
<span className="text-xs text-slate-600 dark:text-slate-400">Off-Duty / Leave</span>
</div>
</div>
</div>
<div className="md:col-span-2 p-6 bg-white/40 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-700/50">
<div className="flex items-center justify-between mb-4">
<h4 className="text-sm font-bold text-slate-800 dark:text-white">Coverage Stats</h4>
<span className="text-xs text-slate-500 font-medium italic">Week 43 overview</span>
</div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
<div className="text-center">
<p className="text-lg font-bold text-primary">42</p>
<p className="text-[10px] uppercase text-slate-500">Total Shifts</p>
</div>
<div className="text-center">
<p className="text-lg font-bold text-green-500">100%</p>
<p className="text-[10px] uppercase text-slate-500">FO Coverage</p>
</div>
<div className="text-center">
<p className="text-lg font-bold text-orange-500">92%</p>
<p className="text-[10px] uppercase text-slate-500">HK Coverage</p>
</div>
<div className="text-center">
<p className="text-lg font-bold text-slate-800 dark:text-white">5</p>
<p className="text-[10px] uppercase text-slate-500">Staff Count</p>
</div>
</div>
</div>
</div>
</div>
</div>
<div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-3 bg-white/40 dark:bg-slate-800/40">
<button className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" onClick={onClose}>
                Close
            </button>
<button className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all">
                Publish Roster
            </button>
</div>
</div>
</div>
  );
}
