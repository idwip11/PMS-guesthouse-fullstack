import { useState, useRef, useEffect } from 'react';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomMultiSelect = ({ options, label, defaultSelected = [] }: { options: string[], label: string, defaultSelected?: string[] }) => {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(item => item !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(selected.filter(item => item !== option));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg min-h-[44px] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm cursor-pointer flex flex-wrap gap-2 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 && <span className="text-gray-400">{label}</span>}
        {selected.map(item => (
          <span key={item} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1">
            {item}
            <span 
              className="material-icons-round text-[14px] hover:text-red-500 cursor-pointer"
              onClick={(e) => removeOption(item, e)}
            >
              close
            </span>
          </span>
        ))}
        <div className="flex-1"></div>
        <span className="material-icons-round text-gray-400 text-[20px]">expand_more</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w- full mt-1 bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto w-full p-2 space-y-1">
          {options.map(option => (
            <div 
              key={option}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => toggleOption(option)}
            >
              <div className={`size-5 rounded border flex items-center justify-center transition-colors ${selected.includes(option) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                 {selected.includes(option) && <span className="material-icons-round text-white text-[16px]">check</span>}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-200">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NewBookingModal({ isOpen, onClose }: NewBookingModalProps) {
  const [activeTab, setActiveTab] = useState<'guest' | 'notes'>('guest');
  const [rateAmount, setRateAmount] = useState(480);
  const [taxAmount, setTaxAmount] = useState(48);
  const [serviceAmount, setServiceAmount] = useState(20);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#111621]/40 backdrop-blur-[4px] p-4 transition-all">
      <div className="glass-panel w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 bg-white/85 dark:bg-[#111621]/85 backdrop-blur-xl border border-white/60 dark:border-white/10">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-[#111318] dark:text-white text-2xl font-bold leading-tight">New Reservation</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#616e89] dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Order ID:</span>
              <span className="bg-gray-100 dark:bg-gray-800 text-[#111318] dark:text-gray-200 text-xs font-mono px-2 py-0.5 rounded">#RES-2023-8924</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar bg-white/50 dark:bg-[#111621]/50">
            <div className="px-8 pt-4 bg-white/40 dark:bg-[#111621]/40 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-8">
                <button 
                  onClick={() => setActiveTab('guest')}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'guest' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <span className="material-icons-round text-[20px]">person</span>
                  <span className="text-sm font-bold tracking-wide">Guest Info</span>
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <span className="material-icons-round text-[20px]">edit_note</span>
                  <span className="text-sm font-bold tracking-wide">Notes</span>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {activeTab === 'guest' ? (
                <>
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary"></span>
                      Primary Guest Details
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <div className="relative">
                          <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="Enter guest name" type="text" defaultValue="Alexandra Hamilton"/>
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">person</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <div className="relative">
                          <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="Contact number" type="tel" defaultValue="+1 (555) 000-0000"/>
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">call</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <div className="relative">
                          <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="email@domain.com" type="email" defaultValue="alex.h@example.com"/>
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">mail</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Origin</label>
                        <div className="relative">
                          <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="Enter Origin" type="text" defaultValue="Jakarta"/>
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">public</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-100 dark:border-gray-800"/>
                  
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500"></span>
                      Stay Details
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Dates</label>
                        <div className="flex items-center gap-2 bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <span className="material-icons-round text-gray-400 text-[20px]">calendar_today</span>
                          <input className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-[#111318] dark:text-white outline-none cursor-pointer" placeholder="Check-in" type="date" defaultValue="2023-10-24" onClick={(e) => e.currentTarget.showPicker()}/>
                          <span className="text-gray-400">→</span>
                          <input className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-[#111318] dark:text-white text-right outline-none cursor-pointer" placeholder="Check-out" type="date" defaultValue="2023-10-28" onClick={(e) => e.currentTarget.showPicker()}/>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Room Type</label>
                        <CustomMultiSelect 
                          options={['Deluxe King', 'Twin Standard', 'Suite']} 
                          label="Select Types" 
                          defaultSelected={['Deluxe King']}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Room No.</label>
                        <CustomMultiSelect 
                          options={['101', '102', '103', '104', '105', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506']} 
                          label="Select Rooms"
                          defaultSelected={['101']} 
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Adults</label>
                        <div className="relative">
                          <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" min="1" type="number" defaultValue="2"/>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Children</label>
                        <div className="relative">
                          <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" min="0" type="number" defaultValue="0"/>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Special Requests</label>
                        <textarea className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-11 min-h-[44px] resize-none overflow-hidden outline-none dark:text-white" placeholder="e.g. Late check-in, Extra pillow"></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-100 dark:border-gray-800"/>
                  
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                      <span className="size-2 rounded-full bg-purple-500"></span>
                      Billing & Payouts
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Payout Status</label>
                        <div className="relative">
                          <select className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none outline-none dark:text-white">
                            <option>Payout Completed</option>
                            <option>Pending Transfer</option>
                            <option>On Hold</option>
                          </select>
                          <span className="material-icons-round absolute right-3 top-3 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Payout Completed Date</label>
                        <div className="relative">
                          <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-[#111318] dark:text-white outline-none cursor-pointer" placeholder="DD/MM/YYYY" type="date" defaultValue="2023-10-26" onClick={(e) => e.currentTarget.showPicker()}/>
                          <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px] pointer-events-none">calendar_today</span>
                        </div>
                      </div>
                      <div className="col-span-12">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1c2230] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <div className="relative flex items-center">
                            <input className="peer sr-only" type="checkbox"/>
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#111318] dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">Rekonsiliasi (Reconciliation)</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Mark this booking as reconciled in the accounting ledger.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* NOTES TAB CONTENT */}
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-500"></span>
                        Catatan Keterangan
                    </h3>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Additional Notes / Remarks</label>
                            <textarea className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-32 resize-none outline-none dark:text-white" placeholder="Enter any special notes, guest preferences, or operational remarks here..."></textarea>
                        </div>
                    </div>
                  </div>
                  
                  <hr className="border-gray-100 dark:border-gray-800"/>
                  
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[#111318] dark:text-white text-base font-semibold flex items-center gap-2">
                        <span className="size-2 rounded-full bg-rose-500"></span>
                        Tambahan Biaya Layanan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Breakfast</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="e.g. 50.000" type="text"/>
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">restaurant</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Late Check-out / Early Check-in</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="e.g. 150.000" type="text"/>
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">schedule</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Extra Bed</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="e.g. 100.000" type="text"/>
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">bed</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Laundry</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-11 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white" placeholder="e.g. 75.000" type="text"/>
                                <span className="material-icons-round absolute right-3 top-2.5 text-gray-400 text-[20px]">local_laundry_service</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="w-80 bg-background-light/80 dark:bg-black/20 border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col shrink-0 backdrop-blur-sm">
            <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Reservation Summary</h4>
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Booking Source</label>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1c2230] p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <select className="bg-transparent border-none text-sm font-medium w-full p-0 focus:ring-0 outline-none dark:text-white">
                    <option>Booking.com</option>
                    <option>Airbnb</option>
                    <option>Traveloka</option>
                    <option>Agoda</option>
                    <option>Tiket.com</option>
                    <option>Direct / Walk-in</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 bg-white dark:bg-[#1c2230] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-5">
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Rate</span>
                  <input 
                    type="number" 
                    className="w-24 bg-transparent border-b border-gray-200 dark:border-gray-700 text-right focus:border-primary focus:outline-none text-[#111318] dark:text-white font-medium p-1"
                    placeholder="0"
                    onChange={(e) => setRateAmount(Number(e.target.value))}
                    defaultValue={480}
                  />
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Taxes & Fees</span>
                  <input 
                    type="number" 
                    className="w-24 bg-transparent border-b border-gray-200 dark:border-gray-700 text-right focus:border-primary focus:outline-none text-[#111318] dark:text-white font-medium p-1"
                    placeholder="0"
                    onChange={(e) => setTaxAmount(Number(e.target.value))}
                    defaultValue={48}
                  />
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Services</span>
                  <input 
                    type="number" 
                    className="w-24 bg-transparent border-b border-gray-200 dark:border-gray-700 text-right focus:border-primary focus:outline-none text-[#111318] dark:text-white font-medium p-1"
                    placeholder="0"
                    onChange={(e) => setServiceAmount(Number(e.target.value))}
                    defaultValue={20}
                  />
                </div>
                
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#111318] dark:text-white">Total</span>
                  <span className="text-lg font-bold text-primary">
                    Rp{(rateAmount + taxAmount + serviceAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 italic text-center mt-2">
                  * Input raw numbers only (no commas or dots).
                </p>
              </div>
      
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Reservation Status</label>
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input type="radio" name="res_status" className="peer sr-only" defaultChecked />
                      <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-600 peer-checked:border-emerald-200 transition-all flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span> Confirmed
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="res_status" className="peer sr-only" />
                      <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 peer-checked:border-amber-200 transition-all">
                        Tentative
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment Status</label>
                  <div className="relative w-full">
                    <select className="w-full appearance-none bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-gray-700 rounded-lg h-10 pl-3 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none dark:text-white">
                      <option>Deposit Paid (DP)</option>
                      <option>Fully Paid (Lunas)</option>
                      <option>Unpaid</option>
                    </select>
                    <span className="material-icons-round absolute right-2.5 top-2.5 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-[#111621]/50 backdrop-blur-sm">
              <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold h-11 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 mb-3">
                <span className="material-icons-round text-[20px]">save</span>
                Save Booking
              </button>
              <button 
                onClick={onClose}
                className="w-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium h-10 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
