import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, updatePassword, type AuthUser } from '../services/authService';
import { usersApi, uploadFile } from '../services/api';


export default function Settings() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Location state
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error' | 'denied'>('loading');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFullName(currentUser.fullName);
    }
    
    // Request geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            
            // Extract city/town and country
            const address = data.address;
            const city = address.city || address.town || address.village || address.county || address.state;
            const country = address.country_code?.toUpperCase() || '';
            
            setLocationName(`${city}, ${country}`);
            setLocationStatus('success');
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            setLocationName('Location detected');
            setLocationStatus('success');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationName('Location access denied');
            setLocationStatus('denied');
          } else {
            setLocationName('Unable to detect location');
            setLocationStatus('error');
          }
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } else {
      setLocationName('Geolocation not supported');
      setLocationStatus('error');
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const updatedUser = await usersApi.update(user.id, { fullName, avatarUrl: user.avatarUrl });
      
      // Update local storage and state
      const newUserData = { ...user, fullName: updatedUser.fullName, avatarUrl: updatedUser.avatarUrl };
      localStorage.setItem('homiq_user', JSON.stringify(newUserData));
      setUser(newUserData);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const { url } = await uploadFile(file);
      
      // Immediately update user profile with new avatar URL
      const updatedUser = await usersApi.update(user.id, { avatarUrl: url });
      
      // Update local storage and state
      const newUserData = { ...user, avatarUrl: updatedUser.avatarUrl };
      localStorage.setItem('homiq_user', JSON.stringify(newUserData));
      setUser(newUserData);
      
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setPasswordError(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await updatePassword(user.id, currentPassword, newPassword);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      alert('Password updated successfully!');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Banner */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img 
              alt={user.fullName} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg" 
              src={user.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <button 
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-blue-600 shadow-md transition-colors disabled:opacity-50" 
              title="Change Avatar"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <span className="material-icons-round text-lg">{uploading ? 'hourglass_empty' : 'camera_alt'}</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-left pt-2">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{user.fullName}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{user.role}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-icons-round text-base">badge</span> {user.username}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                <span className="material-icons-round text-base">location_on</span> {locationStatus === 'loading' ? 'Detecting...' : locationName}
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personal Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your profile details and contact info.</p>
              </div>
              <span className="material-icons-round text-slate-300 dark:text-slate-600 text-3xl">person</span>
            </div>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdateProfile}>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role (Managed by Admin)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round text-lg">admin_panel_settings</span>
                  <input 
                    className="pl-10 w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-100 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                    type="text" 
                    value={user.role}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-round text-lg">alternate_email</span>
                  <input 
                    className="pl-10 w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-100 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                    type="text" 
                    value={user.username}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-2">
                <div className="flex items-center justify-end gap-3">
                  <button 
                    className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Security Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Security</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password.</p>
              </div>
              <span className="material-icons-round text-slate-300 dark:text-slate-600 text-3xl">lock</span>
            </div>
            
            <form className="space-y-4" onSubmit={handleUpdatePassword}>
              {passwordError && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {passwordError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  placeholder="••••••••" 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">Min. 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                <input 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-primary focus:ring-primary/50 transition-colors" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="pt-4">
                <button 
                  className="w-full bg-slate-800 dark:bg-white hover:bg-slate-900 dark:hover:bg-gray-100 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all disabled:opacity-50" 
                  type="submit"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Session */}
          <div className="glass-card rounded-2xl p-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Active Session</h4>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                locationStatus === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : locationStatus === 'denied'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : locationStatus === 'loading'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                <span className="material-icons-round">
                  {locationStatus === 'loading' ? 'sync' : 
                   locationStatus === 'denied' ? 'location_off' :
                   locationStatus === 'error' ? 'error_outline' : 'location_on'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-1">
                  {locationName}
                  {locationStatus === 'loading' && (
                    <span className="animate-pulse text-xs text-slate-400">...</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {locationStatus === 'success' ? 'Active now' : 
                   locationStatus === 'denied' ? 'Please enable location access' :
                   locationStatus === 'loading' ? 'Requesting permission...' :
                   'Location unavailable'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
