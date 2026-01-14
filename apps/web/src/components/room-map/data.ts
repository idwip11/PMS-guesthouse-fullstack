export type RoomStatus = 'Clean' | 'Dirty' | 'OOO' | 'Inspected';
export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Penthouse' | 'Executive';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
}

export type BookingStatus = 'CheckedIn' | 'Confirmed' | 'DueOut' | 'Maintenance' | 'Cancelled';

export interface Booking {
  id: string;
  roomId: string;
  guestName: string;
  status: BookingStatus;
  paymentStatus?: 'Unpaid' | 'Deposit Paid' | 'Fully Paid';
  paidAmount?: number;
  startDay: number; // For this mock, we'll use day of the month (1-30)
  length: number; // Nights
  avatarUrl?: string;
  details?: string; // e.g., "Group: Tech Corp" or "VIP"
  isReconciled?: boolean;
}

// Generate the specific rooms requested
const roomNumbers = [
  '101', '102', '103', '104', '105',
  '201', '202', '203', '204', '205', '206',
  '301', '302', '303', '304', '305', '306',
  '401', '402', '403', '404', '405', '406',
  '501', '502', '503', '504', '505', '506'
];

export const rooms: Room[] = roomNumbers.map((num) => {
  let type: RoomType = 'Standard';
  if (num.startsWith('3')) type = 'Deluxe';
  if (num.startsWith('4')) type = 'Suite';
  if (num.startsWith('5')) type = 'Penthouse';

  // Random statuses for variety
  const statuses: RoomStatus[] = ['Clean', 'Clean', 'Clean', 'Dirty', 'Clean', 'OOO'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    id: `room-${num}`,
    number: num,
    type,
    status
  };
});

// Mock Bookings
export const bookings: Booking[] = [
  { id: 'b1', roomId: 'room-101', guestName: 'Mr. Andi Wijaya', status: 'CheckedIn', startDay: 1, length: 3, avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkuVI8D9Osc8Yh-kDiQRO_j1FlUa1lJAop6b278fHCjsmYiimV22ZS3Sf6aO0IFoDwqVsK0rxBurUtWdV34XC9bUYoruAfrlCaFJR6slviGNvn-tuy777ENlzq885Ec6MDCb5XNmtDK0ZVpuixdHBhBYfwKYRIIG-MXbmOaZnP0ozRUQvapE_qIeT6XCSHhNeZrKDMbbf7WeqUG0e1myjNXe01M9m0QfwRwY9VuOAfDTGcET0CX9eCECnN2FV8tKX2bCi7VfPO7Q' },
  { id: 'b2', roomId: 'room-101', guestName: 'Group: Tech Corp', status: 'DueOut', startDay: 4, length: 2, details: 'Flight 18:00' },
  { id: 'b3', roomId: 'room-101', guestName: 'VIP: Mr. John Doe', status: 'Maintenance', startDay: 7, length: 4, details: 'AC Repair' }, // Maintenance as a booking type for vis
  
  { id: 'b4', roomId: 'room-201', guestName: 'Ms. Sarah Connor', status: 'Confirmed', startDay: 3, length: 2 },
  
  { id: 'b5', roomId: 'room-202', guestName: 'Maintenance Block', status: 'Maintenance', startDay: 1, length: 5, details: 'Plumbing' },

  { id: 'b6', roomId: 'room-203', guestName: 'The Johnsons', status: 'CheckedIn', startDay: 2, length: 5, details: 'Extra Bed' },
  
  { id: 'b7', roomId: 'room-305', guestName: 'Mrs. Smith', status: 'Confirmed', startDay: 5, length: 3 },
  
  { id: 'b8', roomId: 'room-506', guestName: 'CEO Visit', status: 'CheckedIn', startDay: 1, length: 7, details: 'VIP' },
];
