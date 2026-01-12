import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
      </div>
      <main className="w-full max-w-md p-6 relative z-10">
        <div className="glass-card rounded-2xl p-8 md:p-10 w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 mb-6">
              <span className="material-icons-round text-4xl">maps_home_work</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">HomiQ PMS</h1>
            <p className="text-slate-500 dark:text-slate-400">Premium Property Management</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="material-icons-round text-lg">error</span>
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="username">Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors material-icons-round text-xl">person</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400" 
                  id="username" 
                  name="username" 
                  placeholder="Enter your username" 
                  required 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="password">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors material-icons-round text-xl">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="pt-4">
              <button 
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-icons-round animate-spin text-lg">refresh</span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <span className="material-icons-round text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
            <span>© HomiQ Systems v2.4 by Imamdev</span>
            <button 
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" 
              onClick={() => document.documentElement.classList.toggle('dark')} 
              title="Toggle Theme"
            >
              <span className="material-icons-round text-sm dark:hidden">dark_mode</span>
              <span className="material-icons-round text-sm hidden dark:block">light_mode</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;

