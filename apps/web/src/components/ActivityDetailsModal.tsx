import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { reservationsApi } from '../services/api';
import type { TodayActivityItem } from '../services/api';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'check-in' | 'check-out' | null;
}

export default function ActivityDetailsModal({ isOpen, onClose, type }: ActivityDetailsModalProps) {
  const [animate, setAnimate] = useState(false);
  const [activities, setActivities] = useState<TodayActivityItem[]>([]);
  const [counts, setCounts] = useState({ checkInCount: 0, checkOutCount: 0 });
  const [loading, setLoading] = useState(true);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      fetchTodayActivity();
    } else {
      setAnimate(false);
    }
  }, [isOpen, type]);

  const fetchTodayActivity = async () => {
    try {
      setLoading(true);
      const data = await reservationsApi.getTodayActivity();
      setCounts(data.counts);
      
      if (type === 'check-in') {
        setActivities(data.checkIns);
      } else {
        setActivities(data.checkOuts);
      }
    } catch (error) {
      console.error('Failed to fetch today activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isCheckIn = type === 'check-in';
  const title = isCheckIn ? "Today's Check-ins" : "Today's Check-outs";
  const icon = isCheckIn ? "login" : "logout";
  const colorClass = isCheckIn ? "green" : "red";
  const subtitle = isCheckIn 
    ? `${counts.checkInCount} Guests Arriving` 
    : `${counts.checkOutCount} Guests Departing`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleScreenshot = async () => {
    if (!captureRef.current) return;
    
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: document.documentElement.className.includes('dark') ? '#1c2230' : '#ffffff',
        scale: 2, // High resolution
        logging: false,
        useCORS: true, // For cross-origin images (like avatars if any)
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `homiq-activity-${isCheckIn ? 'checkins' : 'checkouts'}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] transition-opacity" 
        onClick={onClose}
      ></div>
      <div className={`relative w-full max-w-lg transform rounded-2xl glass-card shadow-2xl transition-all flex flex-col max-h-[85vh] ${animate ? 'animate-[fadeIn_0.3s_ease-out]' : ''} bg-white dark:bg-[#1c2230]`}>
        {/* Capture Area */}
        <div ref={captureRef} className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#1c2230] rounded-t-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 bg-white/40 dark:bg-slate-800/30 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${colorClass}-100 dark:bg-${colorClass}-900/30 rounded-lg text-${colorClass}-600 dark:text-${colorClass}-400`}>
                <span className="material-icons-round text-xl">{icon}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dateString} • <span className="text-primary">{subtitle}</span></p>
              </div>
            </div>
            {/* Close button outside capture flow visually but inside ref? No, better hide it during capture or accept it */}
            <button 
              onClick={onClose}
              data-html2canvas-ignore="true"
              className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="material-icons-round text-4xl mb-2">event_busy</span>
                <p>No {isCheckIn ? 'check-ins' : 'check-outs'} scheduled for today</p>
              </div>
            ) : (
              activities.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:shadow-md transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                    {item.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.guestName}</h4>
                      {item.outstanding > 0 ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded border text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
                          {formatCurrency(item.outstanding)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded border text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                          Paid
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                        <span className="material-icons-round text-[14px]">meeting_room</span> {item.roomNumber || 'N/A'}
                      </span>
                      {item.source && <span className="text-primary font-medium">• {item.source}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 flex gap-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl backdrop-blur-sm">
           <button 
             onClick={handleScreenshot}
             className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-600 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 transform"
           >
               <span className="material-icons-round text-sm">photo_camera</span> Screenshot
            </button>
        </div>
      </div>
    </div>
  );
}
