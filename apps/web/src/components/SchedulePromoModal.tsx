
import { useState, useEffect } from 'react';

export interface CampaignData {
  id?: string;
  name: string;
  code: string;
  description: string;
  discountDetails: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface SchedulePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignData) => void;
  initialData?: CampaignData | null;
}

export default function SchedulePromoModal({ isOpen, onClose, onSubmit, initialData }: SchedulePromoModalProps) {
  const [formData, setFormData] = useState<CampaignData>({
    name: '',
    code: '',
    description: '',
    discountDetails: '',
    targetAudience: 'All Guests',
    startDate: '',
    endDate: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          discountDetails: '',
          targetAudience: 'All Guests',
          startDate: '',
          endDate: '',
          status: 'Active'
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/30 backdrop-blur-sm">
      <div className="glass-modal w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/20 dark:border-slate-700/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              {initialData ? 'Edit Promotion' : 'Schedule New Promotion'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your marketing campaign details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <span className="material-icons-round text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
          </button>
        </div>
        
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Promotion Name</label>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-400 dark:text-white" 
                  placeholder="e.g. Autumn Gateway Special" 
                  type="text"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Promo Code</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-round text-slate-400 text-lg">confirmation_number</span>
                  <input 
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
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
                  name="discountDetails"
                  value={formData.discountDetails}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-400 dark:text-white" 
                  placeholder="e.g. 15% Off Total Bill" 
                  type="text"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Target Audience</label>
                <select 
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer dark:text-white"
                >
                  <option>All Guests</option>
                  <option>Loyalty Members Only</option>
                  <option>First-time Bookers</option>
                  <option>VIP / Corporate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Start Date</label>
                <input 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  type="date"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm dark:text-white" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">End Date</label>
                <input 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  type="date"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm dark:text-white" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Terms & Conditions</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none dark:text-white" 
                placeholder="Describe the rules, minimum stay requirements, or exclusions..." 
                rows={4}
              ></textarea>
            </div>

            {/* Hidden Status Field (default Active) */}
            <input type="hidden" name="status" value={formData.status} />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Promo Image/Icon</label>
              <div className="glass-input border-dashed border-2 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-primary/5 cursor-pointer transition-all group">
                <span className="material-icons-round text-4xl text-slate-400 group-hover:text-primary mb-2 transition-colors">add_photo_alternate</span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload or drag & drop</span>
                <span className="text-xs text-slate-400 mt-1">Recommended: 1200x630px (Max 2MB)</span>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-white/40 dark:bg-slate-900/40 border-t border-white/20 dark:border-slate-700/30 flex items-center justify-end gap-4 -mx-8 -mb-8">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center gap-2">
                <span className="material-icons-round text-lg">schedule_send</span>
                {initialData ? 'Update Promo' : 'Schedule Promo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
