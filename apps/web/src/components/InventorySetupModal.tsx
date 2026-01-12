
import { useState, useEffect } from 'react';

interface InventorySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventorySetupModal({ isOpen, onClose }: InventorySetupModalProps) {
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
      className={`fixed inset-0 z-50 ${!isOpen ? 'pointer-events-none' : ''}`}
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

      {/* Modal Content */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div 
            className={`relative transform overflow-hidden rounded-2xl glass-card text-left shadow-2xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-2xl border border-white/50 dark:border-slate-700/50 ${
              isOpen ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            }`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white" id="modal-title">
                Inventory Setup
              </h3>
              <button 
                onClick={onClose}
                type="button"
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-8">
              {/* Add New Item */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Add New Item</h4>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Item Name" 
                    className="flex-1 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:border-primary focus:ring-primary dark:text-white"
                  />
                  <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <span className="material-icons-round text-sm">add</span>
                    Add Item
                  </button>
                </div>
              </div>

              {/* Existing Inventory Items */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Existing Inventory Items</h4>
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/50">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Stock</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Threshold</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 dark:bg-slate-800/20 divide-y divide-gray-100 dark:divide-gray-700/50">
                      {/* Item 1 */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                          Shampoo (50ml)
                          <div className="text-xs text-slate-400 font-normal">Toiletries</div>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={12} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={10} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title="Save">
                              <span className="material-icons-round text-lg">save</span>
                            </button>
                            <button className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Delete">
                              <span className="material-icons-round text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Item 2 */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                          Soap
                          <div className="text-xs text-slate-400 font-normal">Toiletries</div>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={45} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={20} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title="Save">
                              <span className="material-icons-round text-lg">save</span>
                            </button>
                            <button className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Delete">
                              <span className="material-icons-round text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                    {/* Item 3 */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                          Dental kit
                          <div className="text-xs text-slate-400 font-normal">Toiletries</div>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={45} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={20} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title="Save">
                              <span className="material-icons-round text-lg">save</span>
                            </button>
                            <button className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Delete">
                              <span className="material-icons-round text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Item 4 */}
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                          Extrabed
                          <div className="text-xs text-slate-400 font-normal">Bedding</div>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={7} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" defaultValue={1} className="w-20 px-2 py-1 text-sm rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 dark:text-white focus:border-primary focus:ring-primary text-center" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title="Save">
                              <span className="material-icons-round text-lg">save</span>
                            </button>
                            <button className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Delete">
                              <span className="material-icons-round text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            {/* Footer */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-gray-100 dark:border-gray-700/50">
              <button 
                type="button"
                className="w-full inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                onClick={onClose}
              >
                Done
              </button>
              <button 
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
