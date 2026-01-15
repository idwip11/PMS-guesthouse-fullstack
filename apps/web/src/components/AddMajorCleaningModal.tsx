import { useState, useEffect } from 'react';
import { usersApi, cleaningTasksApi } from '../services/api';
import type { User, CleaningTask } from '../types';

interface AddMajorCleaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editTask?: CleaningTask | null;
}

export default function AddMajorCleaningModal({ isOpen, onClose, onSuccess, editTask }: AddMajorCleaningModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [roomArea, setRoomArea] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchUsers();
      
      // If editing, populate form with existing data
      if (editTask) {
        setDescription(editTask.description);
        setRoomArea(editTask.roomArea);
        setScheduledDate(editTask.scheduledDate);
        setPriority(editTask.priority as 'Low' | 'Medium' | 'High' | 'Urgent');
        setSelectedUserIds(editTask.assignedUsers.map(u => u.id));
      } else {
        // Reset form for new task
        setDescription('');
        setRoomArea('');
        setScheduledDate('');
        setPriority('Medium');
        setSelectedUserIds([]);
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, editTask]);

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !roomArea || !scheduledDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editTask) {
        // Update existing task
        await cleaningTasksApi.update(editTask.id, {
          description,
          roomArea,
          scheduledDate,
          priority,
          assignedUserIds: selectedUserIds,
        });
      } else {
        // Create new task
        await cleaningTasksApi.create({
          description,
          roomArea,
          scheduledDate,
          priority,
          assignedUserIds: selectedUserIds,
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(`Failed to ${editTask ? 'update' : 'create'} cleaning task:`, error);
      alert(`Failed to ${editTask ? 'update' : 'create'} task`);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} style={{ backdropFilter: 'blur(4px)' }}>
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 transition-opacity" onClick={onClose}></div>
      <div className={`relative w-full max-w-lg glass-card rounded-2xl shadow-2xl transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {editTask ? 'Edit' : 'Add'} Major Cleaning Item
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Task Description</label>
              <input 
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm" 
                placeholder="e.g. Deep Clean Curtains" 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Room / Area</label>
                <input 
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm" 
                  placeholder="e.g. 305" 
                  type="text"
                  value={roomArea}
                  onChange={(e) => setRoomArea(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Scheduled Date</label>
                <input 
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm" 
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Assigned To</label>
                <div 
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm cursor-pointer min-h-[42px]"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  {selectedUserIds.length === 0 ? (
                    <span className="text-slate-400">Select users...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedUserIds.map(userId => {
                        const user = users.find(u => u.id === userId);
                        return user ? (
                          <span key={userId} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                            {user.fullName}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUser(userId);
                              }}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <span className="material-icons-round text-[14px]">close</span>
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                {isUserDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto z-50">
                    <div className="p-2 space-y-1">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => toggleUser(user.id)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            selectedUserIds.includes(user.id)
                              ? 'bg-primary border-primary text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {selectedUserIds.includes(user.id) && (
                              <span className="material-icons-round text-[14px]">check</span>
                            )}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-200">{user.fullName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Priority</label>
                <div className="relative">
                  <select 
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer shadow-sm"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-icons-round text-lg">expand_more</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <span className="material-icons-round text-lg">{editTask ? 'save' : 'add'}</span>
              {loading ? (editTask ? 'Updating...' : 'Adding...') : (editTask ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

