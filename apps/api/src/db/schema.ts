
import { pgTable, text, timestamp, boolean, uuid, date, decimal, time, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('Staff'), // Admin, Receptionist, Housekeeper
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Guests Table
export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  origin: text('origin'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Rooms Table
export const rooms = pgTable('rooms', {
  id: integer('id').primaryKey(), // Manual assignment, e.g., 101, 102, 201
  roomNumber: text('room_number').notNull().unique(),
  roomType: text('room_type').notNull(), // Deluxe, Standard, Suite
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('Available'), // Available, Occupied, Maintenance, Dirty
  floor: integer('floor'),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
});

// Reservations Table
export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  guestId: uuid('guest_id').references(() => guests.id).notNull(),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  orderId: text('order_id').notNull().unique(), // Booking Ref
  checkInDate: date('check_in_date').notNull(),
  checkOutDate: date('check_out_date').notNull(),
  status: text('status').notNull().default('Confirmed'), // Confirmed, Checked_In, Checked_Out, Cancelled
  source: text('source'), // Booking.com, Walk-in, Agoda
  guestCount: integer('guest_count').default(1),
  specialRequest: text('special_request'),
  isReconciled: boolean('is_reconciled').default(false), // Rekonsiliasi
  hasBreakfast: boolean('has_breakfast').default(false),
  hasExtrabed: boolean('has_extrabed').default(false),
  hasLateCheckout: boolean('has_late_checkout').default(false),
  hasLaundry: boolean('has_laundry').default(false),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments Table
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  reservationId: uuid('reservation_id').references(() => reservations.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: date('payment_date').defaultNow().notNull(),
  paymentMethod: text('payment_method'), // Cash, Credit Card, Transfer
  status: text('status').default('Pending'), // Paid, Pending, Failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Invoice Items (Extra breakdowns)
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  reservationId: uuid('reservation_id').references(() => reservations.id).notNull(),
  itemName: text('item_name').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Operations: Expenses
export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  loggedByUserId: uuid('logged_by_user_id').references(() => users.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  category: text('category').notNull(), // Maintenance, Supplies, Utilities
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dateIncurred: date('date_incurred').notNull(),
  status: text('status').default('Pending'), // Pending, Approved, Rejected
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Operations: Inventory
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  currentStock: integer('current_stock').notNull().default(0),
  minThreshold: integer('min_threshold').notNull().default(10),
  unit: text('unit').default('pcs'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Operations: Maintenance Tickets
export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  reportedByUserId: uuid('reported_by_user_id').references(() => users.id, { onDelete: 'cascade' }),
  issueType: text('issue_type').notNull(), // Plumbing, Electrical, Furniture
  description: text('description'),
  priority: text('priority').default('Medium'), // Low, Medium, High, Critical
  status: text('status').default('Open'), // Open, In_Progress, Resolved
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Operations: Staff Shifts
export const shifts = pgTable('shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  shiftDate: date('shift_date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  shiftType: text('shift_type').notNull(), // Morning, Evening, Night
  status: text('status').default('Scheduled'), // Scheduled, Completed, Absent
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Operations: Cleaning Tasks
export const cleaningTasks = pgTable('cleaning_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  description: text('description').notNull(),
  roomArea: text('room_area').notNull(),
  scheduledDate: date('scheduled_date').notNull(),
  priority: text('priority').notNull().default('Medium'), // Low, Medium, High, Urgent
  status: text('status').notNull().default('Pending'), // Pending, In_Progress, Completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table for many-to-many relationship between cleaning tasks and users
export const taskAssignees = pgTable('task_assignees', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => cleaningTasks.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
});

