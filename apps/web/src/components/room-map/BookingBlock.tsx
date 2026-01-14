import React from 'react';
import type { Booking } from './data';
import clsx from 'clsx';

interface BookingBlockProps {
  booking: Booking;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const BookingBlock = ({ booking, style, onClick }: BookingBlockProps) => {
  const getStatusStyles = (status: Booking['status']) => {
    // Priority: Cancelled Status
    if (status === 'Cancelled') return 'bg-red-900/90 text-red-100 border-red-950 shadow-none opacity-70';

    // Priority: Payment Status Coloring
    if (booking.paymentStatus === 'Fully Paid') return 'bg-blue-600 text-white shadow-blue-500/20';
    if (booking.paymentStatus === 'Deposit Paid') return 'bg-[#ffc8aa] text-[#8a4b29] shadow-orange-500/20'; // Custom yellow/orange for DP
    if (booking.paymentStatus === 'Unpaid') return 'bg-red-500 text-white shadow-red-500/20';

    // Fallback based on Reservation Status
    switch (status) {
      case 'CheckedIn':
        return 'bg-primary hover:bg-blue-700 text-white shadow-blue-500/20';
      case 'Confirmed':
        return 'bg-secondary hover:bg-cyan-600 text-white shadow-cyan-500/20';
      case 'DueOut':
        return 'bg-accent hover:bg-orange-600 text-white shadow-orange-500/20 border-r-4 border-white/20';
      case 'Maintenance':
        return 'bg-slate-100 border border-slate-300 border-dashed text-slate-600 opacity-70 hover:opacity-100';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'absolute top-2 bottom-2 rounded-lg shadow-lg flex items-center px-3 overflow-hidden cursor-pointer transition-all z-10',
        getStatusStyles(booking.status)
      )}
      style={style}
      title={`${booking.guestName} (${booking.status})`}
    >
      {booking.avatarUrl && (
        <img
          src={booking.avatarUrl}
          alt="guest"
          className="w-6 h-6 rounded-full border-2 border-white/20 mr-2 flex-shrink-0"
        />
      )}
      
      {booking.status === 'Maintenance' && (
         <span className="material-icons-round text-base mr-2">build</span>
      )}
      
      {booking.status === 'DueOut' && (
         <span className="material-icons-round text-base mr-2">flight_takeoff</span>
      )}

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold truncate">
            {booking.guestName}
          </span>
          {booking.isReconciled && (
            <span className="material-icons-round text-[16px] text-yellow-300 drop-shadow-sm flex-shrink-0" title="Reconciled">star</span>
          )}
        </div>
        {booking.details && (
          <span className="text-[10px] opacity-80 leading-none mt-0.5 truncate">
            {booking.details}
          </span>
        )}
      </div>
    </div>
  );
};

export default BookingBlock;
