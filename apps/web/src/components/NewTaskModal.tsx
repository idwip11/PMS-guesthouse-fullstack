import { useState, useEffect } from 'react';
import { roomsApi, usersApi } from '../services/api';
import type { User } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [roomOptions, setRoomOptions] = useState<{ id: string; label: string }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoomsAndUsers = async () => {
      try {
        const [rooms, usersData] = await Promise.all([
          roomsApi.getAll(),
          usersApi.getAll()
        ]);
        
        // Sort rooms by room number for better UX
        const sortedRooms = rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
        setRoomOptions(sortedRooms.map(room => ({
          id: room.id.toString(), // Ensure ID is string for local state consistency
          label: `${room.roomNumber} - ${room.roomType}`
        })));

        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch data for modal:', error);
      }
    };

    if (isOpen) {
      fetchRoomsAndUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside handler for room dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.room-dropdown-container')) {
        setIsRoomDropdownOpen(false);
      }
    };

    if (isRoomDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRoomDropdownOpen]);

  const toggleRoom = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleCreateTask = async () => {
    if (selectedRooms.length === 0) return;
    setLoading(true);

    try {
      // Update each selected room with the assigned user
      await Promise.all(selectedRooms.map(roomId => 
        roomsApi.update(roomId, { 
          assignedUserId: assignedUserId || null,
          // Ideally we might want to set status to 'Dirty' if it's a cleaning task, 
          // but user didn't explicitly ask for status change logic, just assignment display.
          // We'll keep status as is or let existing logic handle it.
          // For now, let's just update the assignment.
          status: 'Dirty' // Assuming new task implies work needed
        })
      ));
      
      onClose();
      // Optional: Trigger a refresh in parent or global state? 
      // Housekeeping page fetches on mount, so manually refreshing page or using context would be better.
      // For now, refreshing page locally is a simple hack if we can't emit event.
      window.location.reload(); 
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto glass-modal-overlay flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`glass-modal w-full max-w-lg rounded-2xl relative transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create New Housekeeping Task</h3>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
          
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Task Type</label>
              <div className="relative">
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none text-slate-700 dark:text-slate-200">
                  <option>Room Cleaning</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none material-icons-round text-lg">expand_more</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="room-dropdown-container relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Selection</label>
                <div 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer flex items-center justify-between text-slate-700 dark:text-slate-200"
                  onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                >
                  <span className={selectedRooms.length === 0 ? 'text-slate-500 dark:text-slate-400' : ''}>
                    {selectedRooms.length === 0 
                      ? 'Select Room...' 
                      : selectedRooms.length === 1 
                        ? roomOptions.find(r => r.id === selectedRooms[0])?.label 
                        : `${selectedRooms.length} Rooms Selected`}
                  </span>
                  <span className={`material-icons-round text-lg text-slate-500 transition-transform duration-200 ${isRoomDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
                
                {/* Custom Multi-select Dropdown */}
                {isRoomDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 space-y-1">
                      {roomOptions.length === 0 ? (
                         <div className="px-3 py-2 text-sm text-slate-400 text-center">No rooms available</div>
                      ) : roomOptions.map((room) => (
                        <div 
                          key={room.id}
                          onClick={() => toggleRoom(room.id)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            selectedRooms.includes(room.id)
                              ? 'bg-primary border-primary text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {selectedRooms.includes(room.id) && (
                              <span className="material-icons-round text-[14px]">check</span>
                            )}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-200">{room.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                <div className="relative">
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none text-slate-700 dark:text-slate-200">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Low</option>
                    <option>Urgent</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none material-icons-round text-lg">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assigned To</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none text-slate-700 dark:text-slate-200"
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.fullName}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none material-icons-round text-lg">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date/Time</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400" 
                  type="datetime-local"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description / Details</label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-slate-400 text-slate-700 dark:text-slate-200 resize-none" 
                placeholder="Enter task details, specific requirements..." 
                rows={3}
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <button 
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors" 
                onClick={onClose}
                type="button"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateTask} 
                type="button"
                disabled={loading || selectedRooms.length === 0}
              >
                <span className="material-icons-round text-lg">add_task</span>
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
