import { useState, useEffect } from 'react';

interface SchedulePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SchedulePromoModal({ isOpen, onClose }: SchedulePromoModalProps) {
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`glass-modal w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/20 dark:border-slate-700/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Schedule New Promotion</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your marketing campaign details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <span className="material-icons-round text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
          </button>
        </div>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Promotion Name</label>
                <input 
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-400 dark:text-white" 
                  placeholder="e.g. Autumn Gateway Special" 
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Promo Code</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-round text-slate-400 text-lg">confirmation_number</span>
                  <input 
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm font-mono uppercase tracking-wider placeholder:text-slate-400 dark:text-white" 
                    placeholder="e.g. AUTUMN2024" 
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Benefit/Discount</label>
                <input 
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-400 dark:text-white" 
                  placeholder="e.g. 15% Off Total Bill" 
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Target Audience</label>
                <div className="relative">
                  <select className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer dark:text-white">
                    <option>All Guests</option>
                    <option>Loyalty Members Only</option>
                    <option>First-time Bookers</option>
                    <option>VIP / Corporate</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none material-icons-round text-lg">expand_more</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Promotion Period</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-round text-slate-400 text-lg">calendar_month</span>
                <input 
                  className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm dark:text-white" 
                  placeholder="Oct 01, 2024 - Oct 31, 2024" 
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Terms & Conditions</label>
              <textarea 
                className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none dark:text-white" 
                placeholder="Describe the rules, minimum stay requirements, or exclusions..." 
                rows={4}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Promo Image/Icon</label>
              <div className="glass-input border-dashed border-2 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-primary/5 cursor-pointer transition-all group">
                <span className="material-icons-round text-4xl text-slate-400 group-hover:text-primary mb-2 transition-colors">add_photo_alternate</span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload or drag & drop</span>
                <span className="text-xs text-slate-400 mt-1">Recommended: 1200x630px (Max 2MB)</span>
              </div>
            </div>
          </form>
        </div>

        <div className="px-8 py-6 bg-white/40 dark:bg-slate-900/40 border-t border-white/20 dark:border-slate-700/30 flex items-center justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="bg-primary hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span className="material-icons-round text-lg">schedule_send</span>
            Schedule Promo
          </button>
        </div>
      </div>
    </div>
  );
}
