import { useState, useEffect } from 'react';
import AddMajorCleaningModal from '../components/AddMajorCleaningModal';
import { roomsApi, cleaningTasksApi } from '../services/api';
import type { Room, CleaningTask } from '../types';

export default function Housekeeping() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMajorCleaningModalOpen, setIsAddMajorCleaningModalOpen] = useState(false);
  const [filterFloor, setFilterFloor] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [editingTask, setEditingTask] = useState<CleaningTask | null>(null);

  useEffect(() => {
    fetchRooms();
    fetchCleaningTasks();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getAll();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCleaningTasks = async () => {
    try {
      const data = await cleaningTasksApi.getAll();
      setCleaningTasks(data);
    } catch (error) {
      console.error('Failed to fetch cleaning tasks:', error);
    }
  };

  const handleStatusChange = async (roomId: number, newStatus: string) => {
      // Optimistic update
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus as any } : r));
      
      try {
        await roomsApi.update(roomId.toString(), { status: newStatus as any });
      } catch (error) {
        console.error('Failed to update status:', error);
        // Revert on error (fetching all again is safest/easiest reversion)
        fetchRooms();
      }
  };

  const filteredRooms = rooms.filter(room => {
    if (filterFloor !== null && room.floor !== filterFloor) return false;
    
    if (filterStatus) {
       if (filterStatus === 'Clean' && room.status !== 'Available') return false;
       if (filterStatus === 'Pending' && room.status !== 'Dirty') return false;
       if (filterStatus !== 'Clean' && filterStatus !== 'Pending' && room.status !== filterStatus) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalRooms = rooms.length;
  // Available = Clean
  const cleanRooms = rooms.filter(r => r.status === 'Available').length;
  // Dirty = Pending
  const pendingRooms = rooms.filter(r => r.status === 'Dirty').length;
  const dndRooms = 0;

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'Dirty': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse';
      case 'Occupied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Maintenance': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl">
            <span className="material-icons-round">meeting_room</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Total Rooms</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '-' : totalRooms}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
            <span className="material-icons-round">check_circle</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Clean</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '-' : cleanRooms}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
            <span className="material-icons-round">cleaning_services</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Pending</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '-' : pendingRooms}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
            <span className="material-icons-round">do_not_disturb_on</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">DND</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '-' : dndRooms}</p>
          </div>
        </div>
      </div>

      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Room Status & Amenities</h2>
          <div className="flex gap-2">
            <select 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1.5 focus:ring-primary focus:border-primary"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'All Guesthouse') setFilterFloor(null);
                else if (val === 'Guesthouse 1') setFilterFloor(1);
                else if (val === 'Guesthouse 2') setFilterFloor(2);
                else if (val === 'Guesthouse 3') setFilterFloor(3);
                else if (val === 'Guesthouse 4') setFilterFloor(4);
                else if (val === 'Guesthouse 5') setFilterFloor(5);
              }}
            >
              <option>All Guesthouse</option>
              <option>Guesthouse 1</option>
              <option>Guesthouse 2</option>
              <option>Guesthouse 3</option>
              <option>Guesthouse 4</option>
              <option>Guesthouse 5</option>
            </select>
            <select 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1.5 focus:ring-primary focus:border-primary"
              onChange={(e) => setFilterStatus(e.target.value === 'All Status' ? null : e.target.value)}
            >
              <option>All Status</option>
              <option value="Available">Clean</option>
              <option value="Dirty">Pending</option>
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <p className="col-span-4 text-center text-slate-500">Loading rooms...</p>
          ) : filteredRooms.map(room => (
            <div key={room.id} className={`glass-card p-5 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-shadow ${room.status === 'Dirty' ? 'border-l-4 border-l-amber-500' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{room.roomNumber}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{room.roomType}</p>
                </div>
                {/* Status Dropdown */}
                 <div className="relative">
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room.id, e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${getStatusColor(room.status)}`}
                  >
                    <option value="Available">Clean</option>
                    <option value="Dirty">Pending</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Occupied">Occupied</option>
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none material-icons-round text-[14px] opacity-70">expand_more</span>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {room.status === 'Occupied' ? 'G' : '-'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assigned to: <span className="font-medium text-slate-700 dark:text-slate-200">{room.assignedUserName || (room.status === 'Occupied' ? 'Guest' : 'Unassigned')}</span>
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Amenities</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input defaultChecked className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary" type="checkbox"/>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Towels</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input defaultChecked className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary" type="checkbox"/>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Toiletries Kit</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input defaultChecked className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary" type="checkbox"/>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Special Requests</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* Major Cleaning Schedule Table (Static for now, but keeping structure) */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Major Cleaning Schedule</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Input and track major agenda items</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAddMajorCleaningModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span className="material-icons-round text-sm">add</span> Add Item
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-medium">Task Description</th>
                <th className="px-6 py-4 font-medium">Room / Area</th>
                <th className="px-6 py-4 font-medium">Scheduled Date</th>
                <th className="px-6 py-4 font-medium">Assigned To</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
              {cleaningTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No cleaning tasks scheduled. Click "Add Item" to create one.
                  </td>
                </tr>
              ) : cleaningTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{task.roomArea}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                    {new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.assignedUsers.length === 0 ? (
                        <span className="text-slate-400 text-sm">Unassigned</span>
                      ) : (
                        task.assignedUsers.map((user, idx) => {
                          const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
                          return (
                            <div key={user.id} className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {initials}
                              </div>
                              {idx === 0 && <span className="text-slate-600 dark:text-slate-400">{user.fullName}</span>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'Urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="text-slate-400 hover:text-primary transition-colors"
                        onClick={() => setEditingTask(task)}
                      >
                        <span className="material-icons-round">edit</span>
                      </button>
                      <button 
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this task?')) {
                            try {
                              await cleaningTasksApi.delete(task.id);
                              fetchCleaningTasks();
                            } catch (error) {
                              console.error('Failed to delete task:', error);
                              alert('Failed to delete task');
                            }
                          }
                        }}
                      >
                        <span className="material-icons-round">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddMajorCleaningModal 
        isOpen={isAddMajorCleaningModalOpen || editingTask !== null} 
        onClose={() => {
          setIsAddMajorCleaningModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={() => {
          fetchCleaningTasks();
          setEditingTask(null);
        }}
        editTask={editingTask}
      />
    </div>
  );
}
