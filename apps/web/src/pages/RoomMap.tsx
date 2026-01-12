import GanttChart from '../components/room-map/GanttChart';

export default function RoomMap() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Room Map Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row items-center justify-between shrink-0">
        <div className="relative w-full md:w-64">
          <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
            <option>HomiQ Central Guesthouse</option>
            <option>HomiQ Beachside Villa</option>
            <option>HomiQ Downtown</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <span className="material-icons-round">expand_more</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-all">
              <span className="material-icons-round text-lg">chevron_left</span>
            </button>
            <span className="text-sm font-semibold text-slate-700 min-w-[100px] text-center">October 2025</span>
            <button className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-all">
              <span className="material-icons-round text-lg">chevron_right</span>
            </button>
          </div>
          

        </div>
      </div>

      {/* Main Gantt Area */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <GanttChart />
      </div>
    </div>
  );
}
