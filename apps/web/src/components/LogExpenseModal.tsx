import { useState, useEffect } from 'react';

interface LogExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogExpenseModal({ isOpen, onClose }: LogExpenseModalProps) {
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
      <div className={`glass-modal w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="relative h-full flex flex-col max-h-[90vh]">
          {/* Decorative Icon */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <span className="material-icons-round text-9xl text-primary">receipt_long</span>
          </div>

          <div className="p-6 md:p-10 pb-0 z-10">
             <div className="mb-8 border-b border-gray-100 dark:border-gray-700/50 pb-6 flex justify-between items-start">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                         <span className="material-icons-round">add_card</span>
                      </div>
                      New Expense Entry
                   </h2>
                   <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">Submit a new operational expense for approval and tracking.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors group z-20"
                >
                  <span className="material-icons-round text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
                </button>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pt-0 z-10">
             <form onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Expense Item / Description <span className="text-red-500">*</span>
                         </label>
                         <div className="relative">
                            <input 
                               className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-11 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-400" 
                               placeholder="e.g. Plumbing Repair Room 104" 
                               type="text"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round text-xl">description</span>
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Category <span className="text-red-500">*</span>
                         </label>
                         <div className="relative">
                            <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-11 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                               <option disabled selected>Select a category...</option>
                               <option>Repairs & Maintenance</option>
                               <option>Utilities (Water, Power, WiFi)</option>
                               <option>Supplies & Inventory</option>
                               <option>IT & Software</option>
                               <option>Staff & Labor</option>
                               <option>Marketing</option>
                               <option>Other</option>
                            </select>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round text-xl">category</span>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round pointer-events-none">expand_more</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                               Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                               <input 
                                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-8 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-400" 
                                  placeholder="0.00" 
                                  step="0.01" 
                                  type="number"
                               />
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                               Date Incurred <span className="text-red-500">*</span>
                            </label>
                            <input 
                               className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-400" 
                               type="date"
                            />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Additional Notes</label>
                         <textarea 
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-400 resize-none h-32" 
                            placeholder="Add any relevant details, approval codes, or context..."
                         ></textarea>
                      </div>
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Receipt / Invoice
                            <span className="text-xs font-normal text-slate-400 ml-2">(Optional)</span>
                         </label>
                         <div className="file-drop-zone rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group relative">
                            <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" />
                            <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                               <span className="material-icons-round text-2xl text-primary">cloud_upload</span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700/50 flex flex-col-reverse sm:flex-row justify-end gap-4">
                   <button 
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors w-full sm:w-auto text-center" 
                      type="button"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 font-medium transition-all flex items-center justify-center gap-2 w-full sm:w-auto" 
                      type="button"
                   >
                      <span className="material-icons-round">check_circle</span>
                      Submit Expense
                   </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
