
export default function Support() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Support Banner */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">How can we help you today?</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Our support team is available 24/7 to assist with your property management needs.</p>
          </div>
          <div className="flex-shrink-0">
            <a 
              className="group relative inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1" 
              href="#"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.66c4.56 0 8.25 3.71 8.25 8.26 0 2.2-.85 4.27-2.4 5.83a8.216 8.216 0 01-5.85 2.43c-1.44 0-2.85-.39-4.11-1.11l-.29-.17-3.07.81.82-2.99-.19-.3c-.79-1.25-1.21-2.7-1.21-4.19 0-4.55 3.69-8.26 8.25-8.26m4.58 10.25c-.25-.13-1.47-.73-1.69-.81-.23-.08-.39-.13-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.24.26-.4.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.24-.18-.49-.31z"></path>
              </svg>
              Contact via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Frequently Asked Questions</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">Can't find what you're looking for?</span>
          </div>
          <div className="space-y-4">
            <details className="group glass-card rounded-xl overflow-hidden cursor-pointer" open>
              <summary className="flex items-center justify-between p-5 text-slate-800 dark:text-white font-semibold select-none">
                How do I process a refund for a guest?
                <span className="material-icons-round text-slate-400 group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700/50 pt-4">
                To process a refund, navigate to the 'Finance' tab, select the specific transaction ID, and click on the 'Issue Refund' button. You will need to provide a reason for the refund and approve the amount. Refunds typically take 3-5 business days to appear on the guest's statement.
              </div>
            </details>
            <details className="group glass-card rounded-xl overflow-hidden cursor-pointer">
              <summary className="flex items-center justify-between p-5 text-slate-800 dark:text-white font-semibold select-none">
                Can I change the room rate for a specific date?
                <span className="material-icons-round text-slate-400 group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700/50 pt-4">
                Yes, go to 'Room Map' or 'Settings' &gt; 'Pricing'. Select the date range you wish to modify on the calendar view, click 'Edit Rate', and input the new price. You can also set dynamic pricing rules based on occupancy.
              </div>
            </details>
            <details className="group glass-card rounded-xl overflow-hidden cursor-pointer">
              <summary className="flex items-center justify-between p-5 text-slate-800 dark:text-white font-semibold select-none">
                How do I add a new staff member account?
                <span className="material-icons-round text-slate-400 group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700/50 pt-4">
                Admins can add new users under 'Settings' &gt; 'User Management'. Click 'Add New User', fill in their details, and assign a role (e.g., Receptionist, Housekeeping, Manager). An invitation email will be sent to them to set their password.
              </div>
            </details>
            <details className="group glass-card rounded-xl overflow-hidden cursor-pointer">
              <summary className="flex items-center justify-between p-5 text-slate-800 dark:text-white font-semibold select-none">
                What does the "Pending Verification" status mean?
                <span className="material-icons-round text-slate-400 group-open:rotate-180 transition-transform duration-200">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700/50 pt-4">
                This status indicates that the guest has made a booking but their ID or payment method has not yet been verified by the system. You may need to manually verify their documents upon arrival.
              </div>
            </details>
          </div>
        </div>

        {/* Ticket Form */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-icons-round">confirmation_number</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Submit a Ticket</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">For non-urgent technical issues</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="subject">Subject</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white placeholder-slate-400" 
                  id="subject" 
                  placeholder="Brief description of the issue" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="category">Category</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white" 
                    id="category"
                  >
                    <option>General</option>
                    <option>Billing</option>
                    <option>Technical</option>
                    <option>Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="priority">Priority</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white" 
                    id="priority"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="message">Message</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:text-white placeholder-slate-400 h-32 resize-none" 
                  id="message" 
                  placeholder="Describe the problem in detail..."
                ></textarea>
              </div>
              <div className="pt-2">
                <button className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                  <span>Submit Ticket</span>
                  <span className="material-icons-round text-sm">send</span>
                </button>
              </div>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-center text-slate-400">
                Typical response time: <span className="font-semibold text-slate-600 dark:text-slate-300">24 hours</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
