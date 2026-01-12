
export default function Settings() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Banner */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img 
              alt="Sarah Jenkins" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNSXNCj7DPN3th_aXaIkvHKcmzG_rAb-RYGpf4fKw5NalUSBY88IqEwofvcJpNRWMUy_kdAx8rH8l597GuswKhxhbcXsJEhczUrdq4ELjjjciMV0ljFmfcgDLZ2iO3_ZGvTmWJNESrDEPlpp8e_wwbnSYWZuRTGWOd3TTW93M275wHu-mEnvLhRWcrWeqUnuX1lVovgVmffLkRNZqFRtN8R3XJrFL1NXBB0xGcylkIUIsZ0GSNleAPwvqmt8PAqmaZOxn3Kim99Q"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-blue-600 shadow-md transition-colors" title="Change Avatar">
              <span className="material-icons-round text-lg">camera_alt</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-left pt-2">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Sarah Jenkins</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Hotel Manager</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-icons-round text-base">email</span> s.jenkins@homiq.com
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-icons-round text-base">phone</span> +1 (555) 123-4567
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-icons-round text-base">location_on</span> New York, USA
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personal Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your profile details and contact info.</p>
              </div>
              <span className="material-icons-round text-slate-300 dark:text-slate-600 text-3xl">person</span>
            </div>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  type="text" 
                  defaultValue="Sarah"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  type="text" 
                  defaultValue="Jenkins"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role / Job Title</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round text-lg">badge</span>
                  <input 
                    className="pl-10 w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                    type="text" 
                    defaultValue="Hotel Manager"
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round text-lg">email</span>
                  <input 
                    className="pl-10 w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                    type="email" 
                    defaultValue="s.jenkins@homiq.com"
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round text-lg">phone</span>
                  <input 
                    className="pl-10 w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="md:col-span-2 mt-2">
                <div className="flex items-center justify-end gap-3">
                  <button className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors" type="button">Cancel</button>
                  <button className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all" type="submit">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Security Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Security</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password.</p>
              </div>
              <span className="material-icons-round text-slate-300 dark:text-slate-600 text-3xl">lock</span>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  placeholder="••••••••" 
                  type="password"
                />
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  type="password"
                />
                <p className="text-xs text-slate-400 mt-1">Min. 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  type="password"
                />
              </div>
              <div className="pt-4">
                <button className="w-full bg-slate-800 dark:bg-white hover:bg-slate-900 dark:hover:bg-gray-100 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all" type="submit">Update Password</button>
              </div>
            </form>
          </div>

          {/* Active Session */}
          <div className="glass-card rounded-2xl p-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Active Session</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                <span className="material-icons-round">laptop_mac</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">MacBook Pro</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">New York, USA • Active now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
