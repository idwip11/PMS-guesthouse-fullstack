// API Response Types matching the backend schema

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  origin: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Dirty';
  floor: number | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
}

export interface Reservation {
  id: string;
  guestId: string;
  roomId: string;
  orderId: string;
  memberId?: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'Confirmed' | 'Checked_In' | 'Checked_Out' | 'Cancelled';
  source: string | null;
  guestCount: number;
  specialRequest: string | null;
  notes: string | null;
  isReconciled: boolean;
  hasBreakfast: boolean;
  hasExtrabed: boolean;
  hasLateCheckout: boolean;
  hasLaundry: boolean;
  breakfastCost?: string;
  laundryCost?: string;
  massageCost?: string;
  totalAmount: string;
  createdAt: string;
  guestName?: string;
  roomNumber?: string;
  roomType?: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  orderId?: string | null; // Denormalized for easier querying
  amount: string;
  paymentDate: string;
  paymentMethod: string | null;
  notes: string | null;
  type: string;
  status: 'Paid' | 'Pending' | 'Failed';
  createdAt: string;
}

export interface Expense {
  id: string;
  loggedByUserId: string | null;
  description: string;
  category: string;
  amount: string;
  dateIncurred: string;
  notes?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  receiptUrl: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  updatedAt: string;
}

export interface MaintenanceTicket {
  id: string;
  roomId: string;
  reportedByUserId: string | null;
  issueType: string;
  description: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In_Progress' | 'Resolved';
  createdAt: string;
}

export interface Shift {
  id: string;
  userId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  status: 'Scheduled' | 'Completed' | 'Absent';
  createdAt: string;
}

export interface CleaningTask {
  id: string;
  description: string;
  roomArea: string;
  scheduledDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In_Progress' | 'Completed';
  assignedUsers: User[];
  createdAt: string;
}

