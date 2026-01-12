import { useState, useEffect } from 'react';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'check-in' | 'check-out' | null;
}

export default function ActivityDetailsModal({ isOpen, onClose, type }: ActivityDetailsModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCheckIn = type === 'check-in';
  const title = isCheckIn ? "Today's Check-ins" : "Today's Check-outs";
  const icon = isCheckIn ? "login" : "logout";
  const colorClass = isCheckIn ? "green" : "red";
  const subtitle = isCheckIn ? "12 Guests Arriving" : "8 Guests Departing";

  const activities = isCheckIn ? [
    { name: 'Luu, Quang Thuan', status: 'Arrived', room: '4313', type: 'Booking.com', time: '10:30 AM', initials: 'LT' },
    { name: 'Alice Wonderland', status: 'Arrived', room: '304', type: 'Booking.com', time: '11:45 AM', initials: 'AW' },
    { name: 'John Smith', status: 'Pending', room: '205', type: 'Airbnb', time: '14:00 PM', initials: 'JS' },
    { name: 'Nguyen, An', status: 'Pending', room: '201', type: 'Traveloka', time: '15:30 PM', initials: 'NA' },
    { name: 'Sarah Connor', status: 'Pending', room: '101', type: 'Agoda', time: '16:00 PM', initials: 'SC' },
  ] : [
    { name: 'Irma McKinney', status: 'Checked Out', room: '0618', type: 'Booking.com', time: '09:15 AM', initials: 'IM' },
    { name: 'Bob Builder', status: 'Pending', room: '102', type: 'Airbnb', time: '11:00 AM', initials: 'BB' },
    { name: 'Charlie Chaplin', status: 'Checked Out', room: '305', type: 'Traveloka', time: '08:30 AM', initials: 'CC' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] transition-opacity" 
        onClick={onClose}
      ></div>
      <div className={`relative w-full max-w-lg transform rounded-2xl glass-card shadow-2xl transition-all flex flex-col max-h-[85vh] ${animate ? 'animate-[fadeIn_0.3s_ease-out]' : ''} bg-white dark:bg-[#1c2230]`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 bg-white/40 dark:bg-slate-800/30 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${colorClass}-100 dark:bg-${colorClass}-900/30 rounded-lg text-${colorClass}-600 dark:text-${colorClass}-400`}>
              <span className="material-icons-round text-xl">{icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Thursday, Oct 24 • <span className="text-primary">{subtitle}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {activities.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:shadow-md transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                {item.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                    item.status === 'Arrived' || item.status === 'Checked Out' 
                      ? `text-${colorClass}-600 dark:text-${colorClass}-400 bg-${colorClass}-50 dark:bg-${colorClass}-900/20 border-${colorClass}-100 dark:border-${colorClass}-800`
                      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                    <span className="material-icons-round text-[14px]">meeting_room</span> {item.room}
                  </span>
                  {item.type && <span className="text-primary font-medium">• {item.type}</span>}
                  <span className="ml-auto flex items-center gap-1 text-slate-400">
                    <span className="material-icons-round text-[14px]">schedule</span> {item.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 flex gap-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl backdrop-blur-sm">
           <button className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-600 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-all shadow-sm flex justify-center items-center gap-2">
               <span className="material-icons-round text-sm">photo_camera</span> Screenshot
            </button>
        </div>
      </div>
    </div>
  );
}
