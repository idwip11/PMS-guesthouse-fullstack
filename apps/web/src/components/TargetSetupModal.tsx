import { useState, useEffect } from 'react';

interface TargetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetAmount: number) => Promise<void>;
  initialTarget: number;
  month: number;
  year: number;
}

export default function TargetSetupModal({ isOpen, onClose, onSave, initialTarget, month, year }: TargetSetupModalProps) {
  const [target, setTarget] = useState(initialTarget);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setTarget(initialTarget);
    }
  }, [isOpen, initialTarget]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(target);
      onClose();
    } catch (error) {
      console.error('Failed to save target', error);
      alert('Failed to save target');
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1c2230] rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Set Monthly Target</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                <span className="material-icons-round text-lg">close</span>
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
                <p className="text-sm text-gray-500 mb-2">Target for <span className="font-bold text-slate-800 dark:text-white">{monthName} {year}</span></p>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-medium">Rp</span>
                    <input 
                        type="number"
                        required
                        min="0"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Save Target'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
