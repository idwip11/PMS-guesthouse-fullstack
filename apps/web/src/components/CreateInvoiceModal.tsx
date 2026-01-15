import { useState, useRef, useEffect } from 'react';
import { financeApi } from '../services/api';
import * as XLSX from 'xlsx';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportData {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeDetails: Array<{
    room_id: number;
    order_id: string;
    source: string;
    check_in_date: string;
    check_out_date: string;
    total_amount: number;
  }>;
  expenseDetails: Array<{
    description: string;
    category: string;
    amount: number;
    date_incurred: string;
    notes: string | null;
    guesthouse: number;
  }>;
}

const guesthouseOptions = [
  { label: 'All Guesthouses', value: 0 },
  { label: 'Guesthouse 1', value: 1 },
  { label: 'Guesthouse 2', value: 2 },
  { label: 'Guesthouse 3', value: 3 },
  { label: 'Guesthouse 4', value: 4 },
  { label: 'Guesthouse 5', value: 5 },
];

const getGuesthouseName = (value: number) => {
  if (value === 0) return 'All Guesthouses';
  return `Guesthouse ${value}`;
};

export default function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedGuesthouse, setSelectedGuesthouse] = useState<number>(0);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchReport();
    }
  }, [fromDate, toDate, selectedGuesthouse]);

  const fetchReport = async () => {
    if (!fromDate || !toDate) return;
    
    setLoading(true);
    try {
      const data = await financeApi.getReport(fromDate, toDate, selectedGuesthouse);
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // === Income Sheet ===
    const incomeData = reportData.incomeDetails.map(item => ({
      'Room ID': item.room_id,
      'Order ID': item.order_id,
      'Source': item.source,
      'Check-in Date': item.check_in_date,
      'Check-out Date': item.check_out_date,
      'Total Amount': item.total_amount,
    }));
    
    // Add summary row
    incomeData.push({
      'Room ID': '' as any,
      'Order ID': '',
      'Source': '',
      'Check-in Date': '',
      'Check-out Date': 'TOTAL INCOME:',
      'Total Amount': reportData.totalIncome,
    });

    const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
    XLSX.utils.book_append_sheet(wb, incomeSheet, 'Income');

    // === Expenses Sheet ===
    const expenseData = reportData.expenseDetails.map(item => ({
      'Description': item.description,
      'Category': item.category,
      'Amount': item.amount,
      'Date Incurred': item.date_incurred,
      'Notes': item.notes || '',
      'Guesthouse': getGuesthouseName(item.guesthouse),
    }));

    // Add summary row
    expenseData.push({
      'Description': '',
      'Category': '',
      'Amount': reportData.totalExpense,
      'Date Incurred': '',
      'Notes': 'TOTAL EXPENSE:',
      'Guesthouse': '',
    });

    const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, expenseSheet, 'Expenses');

    // === Summary Sheet ===
    const summaryData = [
      { 'Item': 'Report Period', 'Value': `${fromDate} to ${toDate}` },
      { 'Item': 'Guesthouse Filter', 'Value': getGuesthouseName(selectedGuesthouse) },
      { 'Item': '', 'Value': '' },
      { 'Item': 'Total Income', 'Value': reportData.totalIncome },
      { 'Item': 'Total Expense', 'Value': reportData.totalExpense },
      { 'Item': 'Net Profit', 'Value': reportData.netProfit },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Save file
    XLSX.writeFile(wb, `financial-report-${fromDate}-to-${toDate}.xlsx`);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#111621]/40 backdrop-blur-[4px] p-4 transition-all">
      <div className="glass-panel w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 bg-white/85 dark:bg-[#111621]/85 backdrop-blur-xl border border-white/60 dark:border-white/10">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Export Financial Report</h1>
            </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6" ref={reportRef}>
                <div className="glass-card p-8 rounded-2xl space-y-8 bg-white/50 dark:bg-[#111621]/50">
                    <div className="flex items-center gap-3 text-primary border-b border-gray-100 dark:border-gray-700/50 pb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <span className="material-icons-round text-2xl">date_range</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-slate-800 dark:text-white">Report Period</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Select the date range for your financial summary</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">From Date</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round">event</span>
                                <input 
                                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white text-slate-600 shadow-sm" 
                                  type="date"
                                  value={fromDate}
                                  onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">To Date</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round">event</span>
                                <input 
                                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white text-slate-600 shadow-sm" 
                                  type="date"
                                  value={toDate}
                                  onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Guesthouse Selection</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round">apartment</span>
                            <select 
                              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white shadow-sm appearance-none cursor-pointer"
                              value={selectedGuesthouse}
                              onChange={(e) => setSelectedGuesthouse(Number(e.target.value))}
                            >
                                {guesthouseOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round pointer-events-none">expand_more</span>
                        </div>
                    </div>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}

                {reportData && !loading && (
                  <div className="glass-card p-8 rounded-2xl space-y-6 bg-white/50 dark:bg-[#111621]/50">
                    <div className="flex items-center gap-3 text-primary border-b border-gray-100 dark:border-gray-700/50 pb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                            <span className="material-icons-round text-2xl">analytics</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-slate-800 dark:text-white">Financial Summary</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Totals based on selected criteria</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-icons-round text-6xl text-green-500">arrow_upward</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Income</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(reportData.totalIncome)}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-32 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-icons-round text-6xl text-red-500">arrow_downward</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Expense</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(reportData.totalExpense)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end px-1">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Income Details</h3>
                                <span className="text-xs text-slate-400">{reportData.incomeDetails.length} records</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col h-64">
                                <div className="overflow-y-auto custom-scrollbar p-2 space-y-1 flex-1">
                                    {reportData.incomeDetails.length === 0 ? (
                                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">No income records</div>
                                    ) : (
                                      reportData.incomeDetails.map((income, idx) => (
                                        <div key={idx} className="p-3 hover:bg-white dark:hover:bg-slate-700/50 rounded-lg transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-200">Room {income.room_id}</span>
                                                <span className="font-bold text-green-600 dark:text-green-400 text-sm">{formatCurrency(income.total_amount)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                              {income.order_id} • {income.source} • {income.check_in_date} to {income.check_out_date}
                                            </p>
                                        </div>
                                      ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end px-1">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Expense Details</h3>
                                <span className="text-xs text-slate-400">{reportData.expenseDetails.length} records</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col h-64">
                                <div className="overflow-y-auto custom-scrollbar p-2 space-y-1 flex-1">
                                    {reportData.expenseDetails.length === 0 ? (
                                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">No expense records</div>
                                    ) : (
                                      reportData.expenseDetails.map((expense, idx) => (
                                        <div key={idx} className="p-3 hover:bg-white dark:hover:bg-slate-700/50 rounded-lg transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-600 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400">
                                                    <span className="material-icons-round text-lg">receipt_long</span>
                                                </div>
                                                <div>
                                                  <span className="font-medium text-slate-700 dark:text-slate-200 block">{expense.description}</span>
                                                  <span className="text-xs text-slate-400">{expense.category} • {getGuesthouseName(expense.guesthouse)}</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-red-500 dark:text-red-400 text-sm">{formatCurrency(expense.amount)}</span>
                                        </div>
                                      ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                        <span className="text-base font-medium text-slate-600 dark:text-slate-400">Net Profit</span>
                        <span className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-primary' : 'text-red-500'}`}>{formatCurrency(reportData.netProfit)}</span>
                    </div>
                </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                    <button 
                      onClick={handleExportExcel}
                      disabled={!reportData}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span className="material-icons-round">table_view</span>
                        Export to Excel
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        This will download an Excel file with Income, Expenses, and Summary sheets.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
