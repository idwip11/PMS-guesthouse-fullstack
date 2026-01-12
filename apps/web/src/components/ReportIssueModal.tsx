
import { useState, useEffect } from 'react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
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
            className={`relative transform overflow-hidden rounded-2xl glass-card text-left shadow-2xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg border border-white/50 dark:border-slate-700/50 ${
              isOpen ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            }`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white" id="modal-title">
                Report Issue
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
            <div className="px-6 py-6 space-y-4">
              {/* Room Selection */}
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Room
                </label>
                <select
                  id="room"
                  className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="">Select a room...</option>
                  <option value="101">Room 101 (Deluxe)</option>
                  <option value="205">Room 205 (Standard)</option>
                  <option value="304">Room 304 (Suite)</option>
                  <option value="lobby">Lobby / Common Area</option>
                </select>
              </div>

              {/* Issue Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Issue Type
                </label>
                <select
                  id="type"
                  className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="">Select type...</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="appliance">Appliance</option>
                  <option value="furniture">Furniture</option>
                  <option value="hvac">HVAC / AC</option>
                  <option value="other">Other</option>
                </select>
              </div>

               {/* Priority */}
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priority" value="low" className="text-primary focus:ring-primary border-gray-300" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Low</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priority" value="medium" className="text-amber-500 focus:ring-amber-500 border-gray-300" defaultChecked />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Medium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priority" value="high" className="text-red-500 focus:ring-red-500 border-gray-300" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">High</span>
                  </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priority" value="critical" className="text-rose-600 focus:ring-rose-600 border-gray-300" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Critical</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Describe the issue in detail..."
                ></textarea>
              </div>
              
              {/* Reporter */}
               <div>
                <label htmlFor="reporter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reported By
                </label>
                <input
                  type="text"
                  id="reporter"
                   placeholder="e.g. John Doe"
                  className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-gray-100 dark:border-gray-700/50">
              <button 
                type="button"
                className="w-full inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                onClick={onClose}
              >
                Submit Report
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
