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
import { isAuthenticated } from './services/authService';

// Protected Route wrapper - redirects to login if not authenticated
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

const Layout = () => {
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isLogExpenseModalOpen, setIsLogExpenseModalOpen] = useState(false);

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
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
          <Outlet />
        </main>
        
        <NewBookingModal isOpen={isNewBookingOpen} onClose={() => setIsNewBookingOpen(false)} />
        <CreateInvoiceModal isOpen={isCreateInvoiceOpen} onClose={() => setIsCreateInvoiceOpen(false)} />
        <NewTaskModal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} />
        <LogExpenseModal isOpen={isLogExpenseModalOpen} onClose={() => setIsLogExpenseModalOpen(false)} />
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
          <Route path="/finance" element={<Finance />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/ops" element={<Ops />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

