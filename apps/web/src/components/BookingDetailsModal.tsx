import React from 'react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: {
    name: string;
    id: string;
    status: string;
  };
}

export default function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
  const [activeTab, setActiveTab] = React.useState<'guest' | 'billing'>('guest');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-glass border border-white/20 transform transition-all flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-200/60 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Edit Booking Details 
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-primary">Mr. Andi Wijaya</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Reservation ID: <span className="font-mono text-slate-700">#RES-2025-0842</span></p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <div className="px-8 pt-4 border-b border-slate-200/60 shrink-0">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('guest')}
              className={`pb-3 border-b-2 font-medium text-sm px-1 transition-colors ${
                activeTab === 'guest' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Guest Info
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`pb-3 border-b-2 font-medium text-sm px-1 transition-colors ${
                activeTab === 'billing' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Billing & Payment
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'guest' ? (
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">person</span>
                    Guest Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" type="text" defaultValue="Mr. Andi Wijaya"/>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                      <input className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" type="email" defaultValue="andi.wijaya@example.com"/>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                      <input className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" type="tel" defaultValue="+62 812 3456 7890"/>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Nationality</label>
                      <select className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none">
                        <option selected>Indonesia</option>
                        <option>Singapore</option>
                        <option>Malaysia</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">hotel</span>
                    Stay Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Check-in Date</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg">calendar_today</span>
                        <input className="w-full pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" type="date" defaultValue="2025-10-03"/>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Check-out Date</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg">calendar_month</span>
                        <input className="w-full pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" type="date" defaultValue="2025-10-05"/>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Room Assignment</label>
                      <select className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none">
                        <option selected>101 - Deluxe King</option>
                        <option>102 - Deluxe King</option>
                        <option>103 - Double Queen</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Occupancy</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg">group</span>
                          <input className="w-full pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" min="1" type="number" defaultValue="2"/>
                        </div>
                        <span className="text-xs text-slate-400">Adults</span>
                        <div className="flex-1 relative">
                          <input className="w-full px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 outline-none" min="0" type="number" defaultValue="0"/>
                        </div>
                        <span className="text-xs text-slate-400">Kids</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">room_service</span>
                    Additional Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      Breakfast Included
                      <button className="hover:text-blue-900 flex items-center"><span className="material-icons-round text-sm">close</span></button>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      Airport Pickup
                      <button className="hover:text-blue-900 flex items-center"><span className="material-icons-round text-sm">close</span></button>
                    </span>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-dashed border-slate-300 hover:bg-white hover:text-primary hover:border-primary transition-all">
                      <span className="material-icons-round text-sm">add</span>
                      Add Service
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Reservation Status</label>
                  <select className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-lg text-sm mb-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 px-3 py-2 outline-none">
                    <option selected>Checked In</option>
                    <option>Confirmed</option>
                    <option>Due Out</option>
                    <option>Cancelled</option>
                  </select>
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Source</span>
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Booking.com</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Payment</span>
                      <span className="font-medium text-emerald-600 flex items-center gap-1">
                        <span className="material-icons-round text-sm">check_circle</span> Paid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Internal Notes</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] p-3 outline-none" placeholder="Add internal notes regarding this guest...">Guest requested extra pillows. VIP treatment upon arrival.</textarea>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Total Price</span>
                    <span className="text-xl font-bold text-slate-800">$450.00</span>
                  </div>
                  <p className="text-xs text-slate-400 text-right mb-4">Inc. taxes & fees</p>
                  <button className="w-full py-2 bg-white border border-slate-300 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <span className="material-icons-round text-sm">receipt_long</span>
                    View Detailed Invoice
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-8 h-full">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span className="material-icons-round text-slate-400 text-lg">history</span>
                      Payment History
                    </h3>
                    <button className="text-xs font-medium bg-white border border-slate-200 text-primary hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm hover:shadow-md">
                      <span className="material-icons-round text-sm">add</span>
                      Add New Payment
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Method</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Amount</th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Status</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">Sep 15, 2025</td>
                          <td className="px-4 py-3">
                            <span className="text-slate-800 font-medium">Down Payment</span>
                            <span className="block text-[10px] text-slate-400">50% Deposit</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 flex items-center gap-1.5">
                            <span className="material-icons-round text-slate-400 text-sm">credit_card</span>
                            Visa ••4242
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-semibold text-right">$225.00</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Paid
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"><span className="material-icons-round text-base">more_vert</span></button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">-</td>
                          <td className="px-4 py-3">
                            <span className="text-slate-800 font-medium">Remaining Balance</span>
                            <span className="block text-[10px] text-slate-400">Due upon Check-in</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 italic text-xs">
                            --
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-medium text-right">$225.00</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                              Pending
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"><span className="material-icons-round text-base">more_vert</span></button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-200/60 text-xs text-slate-500 flex justify-between items-center">
                    <span>Showing 2 payments related to #RES-2025-0842</span>
                    <button className="text-primary hover:text-blue-700 font-medium hover:underline">View Payment Log</button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-[-10px] right-[-10px] p-3 opacity-[0.03] pointer-events-none">
                    <span className="material-icons-round text-9xl">receipt_long</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 relative z-10 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">summarize</span>
                    Payment Summary
                  </h3>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Booking Total</span>
                      <span className="font-bold text-slate-800">$450.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Paid</span>
                      <span className="font-medium text-emerald-600">$225.00</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Outstanding</span>
                      <span className="text-xl font-bold text-red-500">$225.00</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 relative z-10 group">
                    <span className="material-icons-round text-lg text-slate-400 group-hover:text-primary transition-colors">receipt_long</span>
                    View Full Invoice
                  </button>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-slate-400 text-lg">account_balance</span>
                    Finance & Payout
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Payout Status</label>
                      <select className="w-full bg-white border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer outline-none px-3 py-2">
                        <option>Pending</option>
                        <option>Processing</option>
                        <option selected>Completed</option>
                        <option>Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Payout Completed Date</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-3 top-2.5 text-slate-400 text-lg pointer-events-none">event</span>
                        <input className="w-full pl-10 bg-white border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none px-3 py-2" type="date" defaultValue="2025-09-16"/>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200/50">
                      <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group select-none">
                        <input defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer" type="checkbox"/>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">Rekonsiliasi</span>
                          <span className="text-[10px] text-slate-400">Mark as reconciled in accounting</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-slate-200/60 bg-slate-50/50 flex justify-between items-center rounded-b-2xl shrink-0">
          <button className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
            <span className="material-icons-round text-lg">delete</span>
            Remove Booking
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-200/50 transition-colors border border-transparent hover:border-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={onClose}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-icons-round text-lg">save</span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
