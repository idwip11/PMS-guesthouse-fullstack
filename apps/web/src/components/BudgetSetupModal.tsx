import { useState, useEffect } from 'react';
import { budgetsApi } from '../services/api';

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
}

export default function BudgetSetupModal({ isOpen, onClose, year }: BudgetSetupModalProps) {
  const [budgets, setBudgets] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchBudgets();
    }
  }, [isOpen, year]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetsApi.getByYear(year);
      const budgetMap: Record<number, string> = {};
      data.forEach(budget => {
        budgetMap[budget.month] = budget.projectedAmount;
      });
      setBudgets(budgetMap);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (month: number, value: string) => {
    setBudgets(prev => ({
      ...prev,
      [month]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert budgets to array format
      const budgetsArray = Object.entries(budgets)
        .filter(([_, amount]) => amount && parseFloat(amount) > 0)
        .map(([month, amount]) => ({
          year,
          month: parseInt(month),
          projectedAmount: parseFloat(amount)
        }));

      if (budgetsArray.length === 0) {
        alert('Please enter at least one budget amount');
        return;
      }

      await budgetsApi.bulkUpsert(budgetsArray);
      alert('Budgets saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving budgets:', error);
      alert('Failed to save budgets. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Setup Monthly Budgets</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Year: {year}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-icons-round text-slate-500">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-slate-500">Loading budgets...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map(month => (
                <div key={month.value} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {month.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">Rp</span>
                    <input
                      type="number"
                      value={budgets[month.value] || ''}
                      onChange={(e) => handleInputChange(month.value, e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons-round text-lg">save</span>
                Save Budgets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
