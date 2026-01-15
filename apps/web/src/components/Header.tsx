
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onNewBooking?: () => void;
  onCreateInvoice?: () => void;
  onNewTask?: () => void;
  onLogExpense?: () => void;
  onEditBooking?: (id: string) => void;
}

export default function Header({ onNewBooking, onCreateInvoice, onNewTask, onLogExpense, onEditBooking }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isSettings = location.pathname === '/settings';
  const isSupport = location.pathname === '/support';
  const isFinance = location.pathname === '/finance';
  const isMarketing = location.pathname === '/marketing';
  const isOps = location.pathname === '/ops';
  const isHousekeeping = location.pathname === '/housekeeping';

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`http://localhost:3000/api/reservations/search?q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Weather State
  const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    // Weather Fetching Logic
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
             const { latitude, longitude } = position.coords;
             const response = await fetch(
               `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
             );
             const data = await response.json();
             
             // Map WMO codes
             const code = data.current_weather.weathercode;
             let description = 'Sunny';
             if (code === 0) description = 'Clear';
             else if (code >= 1 && code <= 3) description = 'Partly Cloudy';
             else if (code >= 45 && code <= 48) description = 'Foggy';
             else if (code >= 51 && code <= 67) description = 'Rain';
             else if (code >= 71 && code <= 77) description = 'Snow';
             else if (code >= 80 && code <= 82) description = 'Showers';
             else if (code >= 95) description = 'Thunderstorm';
             
             setWeather({
               temp: Math.round(data.current_weather.temperature),
               description
             });
          } catch (error) {
             console.error('Weather fetch error:', error);
          } finally {
             setWeatherLoading(false);
          }
        }, 
        (err) => {
          console.error("Geo error", err);
          setWeatherLoading(false);
        }
      );
    } else {
        setWeatherLoading(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          setShowResults(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    return 'Search guest or order ID...';
  };

  const showSearch = !isSettings && !isSupport && !isMarketing && !isOps && !isHousekeeping;

  return (
    <header className="h-20 glass flex items-center justify-between px-8 z-50 sticky top-0">
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
            {showResults && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 w-80 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      <h3 className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Guests Found ({searchResults.length})
                      </h3>
                      {searchResults.map((guest) => (
                        <div 
                          key={guest.id} 
                          className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                          onClick={() => {
                             setShowResults(false);
                             setSearchQuery('');
                             if (onEditBooking) onEditBooking(guest.id);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800 dark:text-white">{guest.guestName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              guest.status === 'Checked In' || guest.status === 'Checked_In' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              guest.status === 'Reserved' || guest.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                              {guest.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span className="flex items-center gap-1">
                              <span className="material-icons-round text-[14px]">receipt_long</span>
                              {guest.orderId}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-icons-round text-[14px]">bed</span>
                              Room {guest.roomNumber}
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
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-sm font-medium transition-all">
            <span className="material-icons-round text-base">
                {weatherLoading ? 'refresh' : weather?.description === 'Clear' ? 'wb_sunny' : 'cloud'}
            </span>
            <span>
                {weatherLoading ? 'Loading...' : `${weather?.temp}°C ${weather?.description}`}
            </span>
          </div>
        )}
        
        {!isSettings && (
          <>
            <button
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors"
              onClick={toggleTheme}
            >
              <span className={`material-icons-round ${isDark ? 'hidden' : 'block'}`}>dark_mode</span>
              <span className={`material-icons-round ${isDark ? 'block' : 'hidden'}`}>light_mode</span>
            </button>
          </>
        )}
        
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
          null
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
