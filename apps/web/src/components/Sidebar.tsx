import { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { getCurrentUser, logout, type AuthUser } from '../services/authService';

// Role-Based Access Control
const FULL_ACCESS_ROLES = ['Atmin', 'Admin', 'Manager', 'Finance', 'Marketing', 'Operational'];
const RESTRICTED_PATHS = ['/finance', '/marketing', '/ops']; // Hidden for limited roles

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Housekeeping', path: '/housekeeping', icon: 'cleaning_services' },
    { name: 'Room Map', path: '/room-map', icon: 'map' },
    { name: 'Finance', path: '/finance', icon: 'payments' },
    { name: 'Marketing', path: '/marketing', icon: 'campaign' },
    { name: 'Ops', path: '/ops', icon: 'engineering' },
  ];

  // Filter nav items based on user role
  const navItems = useMemo(() => {
    const userRole = user?.role || '';
    const hasFullAccess = FULL_ACCESS_ROLES.includes(userRole);
    
    if (hasFullAccess) {
      return allNavItems;
    }
    // Limited roles: filter out restricted paths
    return allNavItems.filter(item => !RESTRICTED_PATHS.includes(item.path));
  }, [user?.role]);

  const systemItems = [
    { name: 'Settings', path: '/settings', icon: 'settings' },
    { name: 'Support', path: '/support', icon: 'support_agent' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavLink = (item: { name: string; path: string; icon: string }) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
        )
      }
    >
      <span className="material-icons-round">{item.icon}</span>
      {item.name}
    </NavLink>
  );

  return (
    <aside className="w-64 flex-shrink-0 z-20 hidden md:flex flex-col glass border-r border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center">
          <img 
            src="/homiq-logo.png" 
            alt="HomiQ" 
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map(renderNavLink)}
        
        <div className="pt-6 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          System
        </div>
        
        {systemItems.map(renderNavLink)}
      </nav>
      <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 relative">
        {isDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
            >
              <span className="material-icons-round text-lg">logout</span>
              Logout
            </button>
          </div>
        )}
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
        >
          <img
            alt={user?.fullName || 'User Profile'}
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
            src={user?.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=random`}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {user?.fullName || 'Guest'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'Visitor'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
