
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onNewBooking?: () => void;
  onCreateInvoice?: () => void;
  onNewTask?: () => void;
  onLogExpense?: () => void;
}

const MOCK_GUESTS = [
  { id: '1', name: 'John Doe', orderId: 'ORD-001', room: '101', status: 'Checked In' },
  { id: '2', name: 'Jane Smith', orderId: 'ORD-002', room: '205', status: 'Reserved' },
  { id: '3', name: 'Michael Brown', orderId: 'ORD-003', room: '304', status: 'Maintenance' },
  { id: '4', name: 'Sarah Wilson', orderId: 'ORD-004', room: '102', status: 'Checked Out' },
  { id: '5', name: 'David Lee', orderId: 'ORD-005', room: '201', status: 'Checked In' },
];

export default function Header({ onNewBooking, onCreateInvoice, onNewTask, onLogExpense }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isSettings = location.pathname === '/settings';
  const isSupport = location.pathname === '/support';
  const isFinance = location.pathname === '/finance';
  const isMarketing = location.pathname === '/marketing';
  const isOps = location.pathname === '/ops';
  const isHousekeeping = location.pathname === '/housekeeping';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGuests = MOCK_GUESTS.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const getPageTitle = () => {
    if (isSettings) return 'User Profile';
    if (isSupport) return 'Support Center';
    if (isFinance) return 'Finance Overview';
    if (isMarketing) return 'Marketing';
    if (isOps) return 'Operations Overview';
    if (isHousekeeping) return 'Housekeeping';
    return 'Dashboard';
  };

  const getSearchPlaceholder = () => {
    if (isSettings) return 'Search settings...';
    if (isSupport) return 'Search FAQs, articles...';
    if (isFinance) return 'Search transactions, invoices...';
    if (isMarketing) return 'Search members, campaigns...';
    if (isOps) return 'Search inventory, tickets...';
    if (isHousekeeping) return 'Find room, staff...';
    return 'Search guest name...';
  };

  const showSearch = !isSettings && !isSupport && !isMarketing && !isOps && !isHousekeeping;

  return (
    <header className="h-20 glass flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white hidden sm:block">
          {getPageTitle()}
        </h1>
        {showSearch && (
          <div className="relative group" ref={searchRef}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-icons-round">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all duration-300 outline-none dark:text-white placeholder-slate-400"
              placeholder={getSearchPlaceholder()}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />

            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 w-80 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-96 overflow-y-auto">
                  {filteredGuests.length > 0 ? (
                    <div className="py-2">
                      <h3 className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Guests Found ({filteredGuests.length})
                      </h3>
                      {filteredGuests.map((guest) => (
                        <div key={guest.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800 dark:text-white">{guest.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              guest.status === 'Checked In' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              guest.status === 'Reserved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                              {guest.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span className="flex items-center gap-1">
                              <span className="material-icons-round text-[14px]">receipt_long</span>
                              {guest.orderId}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-icons-round text-[14px]">bed</span>
                              Room {guest.room}
                            </span>
                          </div>
                          <button className="w-full mt-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 group-hover:bg-primary group-hover:text-white">
                            <span className="material-icons-round text-[14px]">edit</span>
                            Edit Booking
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                      <span className="material-icons-round text-4xl mb-2 opacity-50">person_off</span>
                      <p className="text-sm">No guests found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {!isSettings && !isSupport && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-sm font-medium">
            <span className="material-icons-round text-base">wb_sunny</span>
            <span>24°C Sunny</span>
          </div>
        )}
        
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors relative">
          <span className="material-icons-round">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </button>
        
        <button
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors"
          onClick={toggleTheme}
        >
          <span className={`material-icons-round ${isDark ? 'hidden' : 'block'}`}>dark_mode</span>
          <span className={`material-icons-round ${isDark ? 'block' : 'hidden'}`}>light_mode</span>
        </button>
        
        {isFinance ? (
          <button 
            onClick={onCreateInvoice}
            className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <span className="material-icons-round text-lg">add</span>
            Create Invoice
          </button>
        ) : isMarketing ? (
          <button 
            className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            onClick={() => window.open('http://localhost:3000/api/marketing/export', '_blank')}
          >
            <span className="material-icons-round text-lg">file_download</span>
            Export Excel
          </button>
        ) : isOps ? (
          <button 
            onClick={onLogExpense}
            className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <span className="material-icons-round text-lg">add_circle</span>
            Log Expense
          </button>
        ) : isHousekeeping ? (
           <button 
            onClick={onNewTask}
            className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <span className="material-icons-round text-lg">add_task</span>
            New Task
          </button>
        ) : isSettings ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20">
             <img 
               alt="User Profile" 
               className="w-full h-full object-cover" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNSXNCj7DPN3th_aXaIkvHKcmzG_rAb-RYGpf4fKw5NalUSBY88IqEwofvcJpNRWMUy_kdAx8rH8l597GuswKhxhbcXsJEhczUrdq4ELjjjciMV0ljFmfcgDLZ2iO3_ZGvTmWJNESrDEPlpp8e_wwbnSYWZuRTGWOd3TTW93M275wHu-mEnvLhRWcrWeqUnuX1lVovgVmffLkRNZqFRtN8R3XJrFL1NXBB0xGcylkIUIsZ0GSNleAPwvqmt8PAqmaZOxn3Kim99Q"
             />
          </div>
        ) : (
          <button 
            className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            onClick={onNewBooking}
          >
            <span className="material-icons-round text-lg">add</span>
            New Booking
          </button>
        )}
      </div>
    </header>
  );
};


