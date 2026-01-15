import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RoomMap from './pages/RoomMap';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import Ops from './pages/Ops';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Housekeeping from './pages/Housekeeping';
import Login from './pages/Login';
import NewBookingModal from './components/NewBookingModal';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import NewTaskModal from './components/NewTaskModal';
import LogExpenseModal from './components/LogExpenseModal';
import BookingDetailsModal from './components/BookingDetailsModal';
import { isAuthenticated, getCurrentUser } from './services/authService';

// Role-Based Access Control Constants
const FULL_ACCESS_ROLES = ['Atmin', 'Admin', 'Manager', 'Finance', 'Marketing', 'Operational'];

// Protected Route wrapper - redirects to login if not authenticated
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

// Role-based route guard - redirects to dashboard if user lacks permission
const RoleProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const userRole = user?.role || '';
  
  if (!FULL_ACCESS_ROLES.includes(userRole)) {
    // Limited role trying to access restricted page - redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const Layout = () => {
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isLogExpenseModalOpen, setIsLogExpenseModalOpen] = useState(false);
  
  // Search Integration: Booking Details Modal
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);

  const handleEditBooking = (id: string) => {
    setSelectedBookingId(id);
    setIsBookingDetailsOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        <Header 
          onNewBooking={() => setIsNewBookingOpen(true)} 
          onCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          onNewTask={() => setIsNewTaskOpen(true)}
          onLogExpense={() => setIsLogExpenseModalOpen(true)}
          onEditBooking={handleEditBooking}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
          <Outlet />
        </main>
        
        <NewBookingModal isOpen={isNewBookingOpen} onClose={() => setIsNewBookingOpen(false)} />
        <CreateInvoiceModal isOpen={isCreateInvoiceOpen} onClose={() => setIsCreateInvoiceOpen(false)} />
        <NewTaskModal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} />
        <LogExpenseModal isOpen={isLogExpenseModalOpen} onClose={() => setIsLogExpenseModalOpen(false)} />
        <BookingDetailsModal 
          isOpen={isBookingDetailsOpen} 
          onClose={() => {
            setIsBookingDetailsOpen(false);
            setSelectedBookingId(null);
          }} 
          bookingId={selectedBookingId} 
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (with Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/room-map" element={<RoomMap />} />
          <Route path="/finance" element={<RoleProtectedRoute><Finance /></RoleProtectedRoute>} />
          <Route path="/marketing" element={<RoleProtectedRoute><Marketing /></RoleProtectedRoute>} />
          <Route path="/ops" element={<RoleProtectedRoute><Ops /></RoleProtectedRoute>} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

