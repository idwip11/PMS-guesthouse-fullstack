
import { useState, useEffect } from 'react';

interface LoyaltyMember {
  id: string;
  memberId: string;
  guestName: string;
  pointsBalance: number;
  lastActivity: string;
}

interface LoyaltyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: LoyaltyMember[];
  onUpdatePoints: (id: string, newPoints: number) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export default function LoyaltyMembersModal({ isOpen, onClose, members, onUpdatePoints, onDeleteMember }: LoyaltyMembersModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredMembers = members.filter(m => 
    m.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (member: LoyaltyMember) => {
    setEditingId(member.id);
    setEditPoints(member.pointsBalance);
  };

  const handleSavePoints = async (id: string) => {
    await onUpdatePoints(id, editPoints);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this loyalty member?')) {
      await onDeleteMember(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/30 backdrop-blur-sm">
      <div className="glass-modal w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/20 dark:border-slate-700/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Loyalty Members
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage points and member status</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <span className="material-icons-round text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-white/10 dark:border-slate-700/20 shrink-0">
            <div className="relative max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-400">search</span>
                <input 
                    type="text" 
                    placeholder="Search members..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
            </div>
        </div>
        
        {/* List */}
        <div className="overflow-auto p-0">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur z-10">
                <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                    <th className="px-6 py-4 font-medium">Member</th>
                    <th className="px-6 py-4 font-medium">Member ID</th>
                    <th className="px-6 py-4 font-medium">Points Balance</th>
                    <th className="px-6 py-4 font-medium">Last Activity</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredMembers.map((member) => (
                    <tr key={member.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {member.guestName?.charAt(0) || 'M'}
                            </div>
                            <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{member.guestName || 'Unknown Guest'}</p>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                            <span className="material-icons-round text-[10px]">card_membership</span> {member.memberId}
                        </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 font-medium">
                            {editingId === member.id ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={editPoints}
                                        onChange={(e) => setEditPoints(Number(e.target.value))}
                                        className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                    />
                                    <button onClick={() => handleSavePoints(member.id)} className="text-green-500 hover:text-green-600"><span className="material-icons-round text-lg">check</span></button>
                                    <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600"><span className="material-icons-round text-lg">close</span></button>
                                </div>
                            ) : (
                                <span>{member.pointsBalance} pts</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {member.lastActivity ? new Date(member.lastActivity).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => startEdit(member)}
                                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-colors"
                                    title="Edit Points"
                                >
                                    <span className="material-icons-round text-lg">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(member.id)}
                                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Remove Member"
                                >
                                    <span className="material-icons-round text-lg">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {filteredMembers.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    No members found matching your search.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
