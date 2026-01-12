import React, { useState } from 'react';
import BookingDetailsModal from '../BookingDetailsModal';
import BookingBlock from './BookingBlock';
import { rooms, bookings } from './data';
import type { RoomStatus } from './data';
import clsx from 'clsx';

const COL_WIDTH = 100; // Width of each day column in px
const SIDEBAR_WIDTH = 220; // Width of room sidebar

const GanttChart = () => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  // Generate days array (just numbers 1-30 for this mock)
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
        case 'Clean': return 'bg-emerald-100 text-emerald-700';
        case 'Dirty': return 'bg-amber-100 text-amber-700';
        case 'OOO': return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative h-full">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        <div 
            className="grid" 
            style={{ 
                gridTemplateColumns: `${SIDEBAR_WIDTH}px repeat(${days.length}, ${COL_WIDTH}px)`,
                width: 'max-content'
            }}
        >
          {/* Header Row (Sticky Top & Left) */}
          <div className="sticky top-0 left-0 z-30 bg-white border-b border-r border-slate-100 p-4 font-semibold text-slate-500 flex items-end h-20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <span>Room / Type</span>
          </div>
          
          {days.map((day) => (
            <div key={`header-${day}`} className={clsx(
                "sticky top-0 z-20 border-b border-r border-slate-100 p-2 text-center h-20 flex flex-col justify-center",
                day === 3 ? "bg-blue-50/80 backdrop-blur-sm border-blue-100" : "bg-white/95 backdrop-blur-sm"
            )}>
              <div className={clsx(
                  "text-[10px] uppercase font-bold tracking-wider mb-1",
                  day === 3 ? "text-primary" : "text-slate-400"
              )}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day % 7]}
              </div>
              <div className={clsx(
                  "text-lg font-bold",
                  day === 3 ? "text-primary" : "text-slate-800"
              )}>
                {day.toString().padStart(2, '0')}
              </div>
               {day === 3 && <span className="text-[9px] font-medium text-primary bg-blue-100 px-1.5 rounded-full mt-1">Today</span>}
            </div>
          ))}

          {/* Room Rows */}
          {rooms.map((room) => {
             const roomBookings = bookings.filter(b => b.roomId === room.id);

             return (
                <React.Fragment key={room.id}>
                    {/* Sidebar (Sticky Left) */}
                    <div className="sticky left-0 z-20 bg-white border-b border-r border-slate-100 p-4 h-24 flex flex-col justify-center shadow-[4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-lg font-bold text-slate-800">{room.number}</span>
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide", getStatusBadge(room.status))}>
                                {room.status}
                            </span>
                        </div>
                        <span className="text-xs text-slate-500">{room.type}</span>
                    </div>

                    {/* Day Cells for this Room */}
                    {days.map((day) => (
                        <div key={`cell-${room.id}-${day}`} className={clsx(
                            "border-b border-slate-50 h-24 relative",
                            day === 3 ? "bg-blue-50/30" : (day % 2 === 0 ? "bg-white" : "bg-slate-50/30") // subtle zeebra stripe
                        )}>
                            {/* Check if a booking starts here */}
                            {roomBookings.map(booking => {
                                if (booking.startDay === day) {
                                    return (
                                        <BookingBlock 
                                            key={booking.id} 
                                            booking={booking} 
                                            style={{
                                                left: '4px',
                                                width: `${booking.length * 100 - 8}px` 
                                            }}
                                            onClick={() => {
                                                if (booking.guestName === 'Mr. Andi Wijaya') {
                                                    setIsBookingModalOpen(true);
                                                }
                                            }}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </div>
                    ))}
                </React.Fragment>
             );
          })}
        </div>
      </div>

      
      <BookingDetailsModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
};

export default GanttChart;
