import { db } from './index';
import { users, guests, rooms, reservations, payments, invoiceItems, expenses, inventoryItems, maintenanceTickets, shifts } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Create Users
    const usersData = await db.insert(users).values([
      { username: 'admin', passwordHash: 'admin123', fullName: 'System Admin', role: 'Admin' },
      { username: 'receptionist', passwordHash: 'password', fullName: 'Sarah Jones', role: 'Receptionist' },
      { username: 'housekeeper', passwordHash: 'password', fullName: 'Mike Smith', role: 'Housekeeper' },
      { username: 'manager', passwordHash: 'password', fullName: 'David Brown', role: 'Admin' },
      { username: 'staff1', passwordHash: 'password', fullName: 'Emily White', role: 'Staff' },
    ]).returning();

    // 2. Create Rooms (Manual Integer IDs)
    const roomsData = await db.insert(rooms).values([
      { id: 101, roomNumber: '101', roomType: 'Standard', pricePerNight: '50.00', status: 'Occupied', floor: 1 },
      { id: 102, roomNumber: '102', roomType: 'Standard', pricePerNight: '50.00', status: 'Available', floor: 1 },
      { id: 103, roomNumber: '103', roomType: 'Deluxe', pricePerNight: '80.00', status: 'Dirty', floor: 1 },
      { id: 201, roomNumber: '201', roomType: 'Suite', pricePerNight: '120.00', status: 'Available', floor: 2 },
      { id: 202, roomNumber: '202', roomType: 'Standard', pricePerNight: '55.00', status: 'Maintenance', floor: 2 },
      { id: 203, roomNumber: '203', roomType: 'Deluxe', pricePerNight: '85.00', status: 'Occupied', floor: 2 },
      { id: 301, roomNumber: '301', roomType: 'Penthouse', pricePerNight: '200.00', status: 'Available', floor: 3 },
      { id: 302, roomNumber: '302', roomType: 'Suite', pricePerNight: '130.00', status: 'Dirty', floor: 3 },
      { id: 104, roomNumber: '104', roomType: 'Standard', pricePerNight: '50.00', status: 'Available', floor: 1 },
      { id: 105, roomNumber: '105', roomType: 'Deluxe', pricePerNight: '80.00', status: 'Occupied', floor: 1 },
    ]).returning();

    // 3. Create Guests
    const guestsData = await db.insert(guests).values([
      { fullName: 'John Doe', email: 'john@example.com', phone: '1234567890', origin: 'USA' },
      { fullName: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', origin: 'UK' },
      { fullName: 'Alice Johnson', email: 'alice@example.com', phone: '1122334455', origin: 'Canada' },
      { fullName: 'Bob Williams', email: 'bob@example.com', phone: '5566778899', origin: 'Australia' },
      { fullName: 'Charlie Brown', email: 'charlie@example.com', phone: '6677889900', origin: 'USA' },
    ]).returning();

    // 4. Create Reservations
    const reservationsData = await db.insert(reservations).values([
      {
        guestId: guestsData[0].id,
        roomId: 101, // Linked to Room 101
        orderId: 'RES-001',
        checkInDate: '2023-10-25',
        checkOutDate: '2023-10-30',
        status: 'Checked_In',
        totalAmount: '250.00',
        title: 'Booking via Booking.com',
      },
      {
        guestId: guestsData[1].id,
        roomId: 203, // Linked to Room 203
        orderId: 'RES-002',
        checkInDate: '2023-10-26',
        checkOutDate: '2023-10-28',
        status: 'Checked_In',
        totalAmount: '170.00',
        title: 'Walk-in Guest',
      },
      {
        guestId: guestsData[2].id,
        roomId: 105, // Linked to Room 105
        orderId: 'RES-003',
        checkInDate: '2023-10-27',
        checkOutDate: '2023-10-29',
        status: 'Confirmed',
        totalAmount: '160.00',
        title: 'Agoda Booking',
      },
      {
        guestId: guestsData[3].id,
        roomId: 201, // Linked to Room 201
        orderId: 'RES-004',
        checkInDate: '2023-11-01',
        checkOutDate: '2023-11-05',
        status: 'Confirmed',
        totalAmount: '480.00',
        title: 'Website Booking',
      },
    ]).returning();

    // 5. Create Payments
    await db.insert(payments).values([
      { reservationId: reservationsData[0].id, amount: '100.00', status: 'Paid', paymentMethod: 'Credit Card' },
      { reservationId: reservationsData[1].id, amount: '170.00', status: 'Paid', paymentMethod: 'Cash' },
    ]);

    // 6. Create Expenses
    await db.insert(expenses).values([
      { loggedByUserId: usersData[0].id, description: 'Cleaning Supplies', category: 'Supplies', amount: '45.00', dateIncurred: '2023-10-25', status: 'Approved' },
      { loggedByUserId: usersData[2].id, description: 'Plumbing Repair', category: 'Maintenance', amount: '150.00', dateIncurred: '2023-10-26', status: 'Pending' },
      { loggedByUserId: usersData[1].id, description: 'Groceries for Breakfast', category: 'Supplies', amount: '80.00', dateIncurred: '2023-10-27', status: 'Approved' },
      { loggedByUserId: usersData[0].id, description: 'Electricity Bill', category: 'Utilities', amount: '300.00', dateIncurred: '2023-10-28', status: 'Pending' },
    ]);

    // 7. Create Inventory
    await db.insert(inventoryItems).values([
      { name: 'Towels', category: 'Housekeeping', currentStock: 45, minThreshold: 50, unit: 'pcs' },
      { name: 'Soap Bars', category: 'Toiletries', currentStock: 120, minThreshold: 100, unit: 'bars' },
      { name: 'Shampoo Bottles', category: 'Toiletries', currentStock: 80, minThreshold: 50, unit: 'bottles' },
      { name: 'Toilet Paper', category: 'Supplies', currentStock: 200, minThreshold: 50, unit: 'rolls' },
      { name: 'Light Bulbs', category: 'Maintenance', currentStock: 15, minThreshold: 20, unit: 'pcs' },
      { name: 'Coffee Sachets', category: 'Kitchen', currentStock: 300, minThreshold: 100, unit: 'sachets' },
      { name: 'Water Bottles', category: 'Kitchen', currentStock: 50, minThreshold: 100, unit: 'bottles' },
    ]);

    // 8. Create Maintenance Tickets
    await db.insert(maintenanceTickets).values([
      { roomId: 103, reportedByUserId: usersData[0].id, issueType: 'Plumbing', description: 'Leaky faucet in bathroom', priority: 'Medium', status: 'Open' },
      { roomId: 202, reportedByUserId: usersData[2].id, issueType: 'Electrical', description: 'AC not cooling', priority: 'High', status: 'In_Progress' },
      { roomId: 302, reportedByUserId: usersData[1].id, issueType: 'Furniture', description: 'Broken chair leg', priority: 'Low', status: 'Open' },
    ]);

    // 9. Create Shifts
    await db.insert(shifts).values([
      { userId: usersData[1].id, shiftDate: '2023-10-26', startTime: '08:00:00', endTime: '16:00:00', shiftType: 'Morning', status: 'Scheduled' },
      { userId: usersData[2].id, shiftDate: '2023-10-26', startTime: '16:00:00', endTime: '23:59:00', shiftType: 'Evening', status: 'Scheduled' },
      { userId: usersData[4].id, shiftDate: '2023-10-27', startTime: '08:00:00', endTime: '16:00:00', shiftType: 'Morning', status: 'Scheduled' },
      { userId: usersData[1].id, shiftDate: '2023-10-27', startTime: '16:00:00', endTime: '23:59:00', shiftType: 'Evening', status: 'Scheduled' },
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();
