import { Router } from 'express';
import { db } from '../db';
import { reservations, guests, rooms, payments, invoiceItems, loyaltyMembers } from '../db/schema';
import { eq, and, ne, or, lt, gt, sql, sum } from 'drizzle-orm';

const router = Router();

// Helper function to check for overlapping reservations
async function checkRoomOverlap(roomId: number, checkInDate: string, checkOutDate: string, excludeReservationId?: string): Promise<boolean> {
  // A reservation overlaps if:
  // (new check-in < existing check-out) AND (new check-out > existing check-in)
  const conditions = [
    eq(reservations.roomId, roomId),
    lt(reservations.checkInDate, checkOutDate),
    gt(reservations.checkOutDate, checkInDate),
    ne(reservations.status, 'Cancelled') // Ignore cancelled reservations
  ];
  
  // If updating, exclude the current reservation from the check
  if (excludeReservationId) {
    conditions.push(ne(reservations.id, excludeReservationId));
  }
  
  const overlapping = await db.select({ id: reservations.id })
    .from(reservations)
    .where(and(...conditions));
    
  return overlapping.length > 0;
}

// GET /api/reservations - Get all reservations with details
router.get('/', async (req, res) => {
  try {
    const allReservations = await db.select({
      id: reservations.id,
      guestId: reservations.guestId,
      roomId: reservations.roomId,
      orderId: reservations.orderId,
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
      status: reservations.status,
      source: reservations.source,
      guestCount: reservations.guestCount,
      specialRequest: reservations.specialRequest,
      isReconciled: reservations.isReconciled,
      hasBreakfast: reservations.hasBreakfast,
      hasExtrabed: reservations.hasExtrabed,
      hasLateCheckout: reservations.hasLateCheckout,
      hasLaundry: reservations.hasLaundry,
      totalAmount: reservations.totalAmount,
      guestName: guests.fullName,
      roomNumber: rooms.roomNumber,
      roomType: rooms.roomType,
    })
    .from(reservations)
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .leftJoin(rooms, eq(reservations.roomId, rooms.id));

    // Fetch all payments to calculate status
    const allPayments = await db.select().from(payments);
    
    // Map reservations to include payment status
    const enhancedReservations = allReservations.map(res => {
      const resPayments = allPayments.filter(p => p.reservationId === res.id && p.status === 'Paid');
      const totalPaid = resPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalAmount = parseFloat(res.totalAmount);
      
      let paymentStatus = 'Unpaid';
      if (totalPaid >= totalAmount) {
        paymentStatus = 'Fully Paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'Deposit Paid';
      }
      
      return {
        ...res,
        paidAmount: totalPaid,
        paymentStatus
      };
    });
    
    // Map reservations to include payment status

    
    res.json(enhancedReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Failed to fetch reservations' });
  }
});

// GET /api/reservations/:id/payments - Get payments for a reservation
router.get('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const reservationPayments = await db.select().from(payments).where(eq(payments.reservationId, id));
    res.json(reservationPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// POST /api/reservations/:id/payments - Add a payment for a reservation
router.post('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, type, status, orderId } = req.body;
    
    const newPayment = await db.insert(payments).values({
      reservationId: id,
      orderId: orderId || null, // Denormalized for easier querying
      amount: amount.toString(),
      paymentDate: paymentDate ? paymentDate : new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: req.body.notes,
      type: type || 'Payment',
      status: status || 'Paid'
    }).returning();
    
    res.json(newPayment[0]);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Failed to add payment' });
  }
});

// PUT /api/reservations/payments/:paymentId - Update a payment
router.put('/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, paymentDate, paymentMethod, type, status } = req.body;

    const updatedPayment = await db.update(payments)
      .set({
        amount: amount ? amount.toString() : undefined,
        paymentDate: paymentDate,
        paymentMethod,
        notes: req.body.notes,
        type,
        status
      })
      .where(eq(payments.id, paymentId))
      .returning();

    res.json(updatedPayment[0]);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
});

// DELETE /api/reservations/payments/:paymentId - Delete a payment
router.delete('/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await db.delete(payments).where(eq(payments.id, paymentId)).returning();
    res.json(result[0] || { message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Failed to delete payment' });
  }
});

// GET /api/reservations/:id - Get a single reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await db.select().from(reservations).where(eq(reservations.id, id));
    if (reservation.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(reservation[0]);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Failed to fetch reservation' });
  }
});

// POST /api/reservations - Create a new reservation
router.post('/', async (req, res) => {
  try {
    const {
      guestId,
      roomId,
      orderId,
      checkInDate,
      checkOutDate,
      memberId,
      status,
      source,
      guestCount,
      specialRequest,
      isReconciled,
      hasBreakfast,
      hasExtrabed,
      hasLateCheckout,
      hasLaundry,
      totalAmount,
    } = req.body;

    if (!guestId || !roomId || !orderId || !checkInDate || !checkOutDate || !totalAmount) {
      return res.status(400).json({ message: 'guestId, roomId, orderId, checkInDate, checkOutDate, and totalAmount are required' });
    }

    // Handle Loyalty Member Creation/Update with Points Calculation
    if (memberId) {
       try {
         // Calculate points: SUM(total_amount) / 200000 * 3
         const pointsResult = await db.select({
           totalSpent: sql<number>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)`
         }).from(reservations).where(eq(reservations.memberId, memberId));
         
         const totalSpent = Number(pointsResult[0]?.totalSpent || 0) + Number(totalAmount);
         const calculatedPoints = Math.floor(totalSpent / 200000) * 3;

         const existingMember = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.memberId, memberId));
         
         if (existingMember.length > 0) {
            await db.update(loyaltyMembers)
              .set({ 
                lastActivity: new Date(),
                pointsBalance: calculatedPoints
              })
              .where(eq(loyaltyMembers.memberId, memberId));
         } else {
            await db.insert(loyaltyMembers).values({
               orderId: orderId,
               memberId: memberId,
               pointsBalance: calculatedPoints,
               joinedAt: new Date(),
               lastActivity: new Date()
            });
         }
       } catch (loyaltyError) {
          console.error('Error handling loyalty member:', loyaltyError);
       }
    }

    const newReservation = await db.insert(reservations).values({
      guestId,
      roomId,
      orderId,
      memberId,
      checkInDate,
      checkOutDate,
      status: status || 'Confirmed',
      source,
      guestCount: guestCount || 1,
      specialRequest,
      isReconciled: isReconciled || false,
      hasBreakfast: hasBreakfast || false,
      hasExtrabed: hasExtrabed || false,
      hasLateCheckout: hasLateCheckout || false,
      hasLaundry: hasLaundry || false,
      totalAmount,
    }).returning();

    res.status(201).json(newReservation[0]);
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Order ID already exists' });
    }
    res.status(500).json({ message: 'Failed to create reservation' });
  }
});

// PUT /api/reservations/:id - Update a reservation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      guestId,
      roomId,
      orderId,
      memberId,
      checkInDate,
      checkOutDate,
      status,
      source,
      guestCount,
      specialRequest,
      isReconciled,
      hasBreakfast,
      hasExtrabed,
      hasLateCheckout,
      hasLaundry,
      totalAmount,
    } = req.body;

    // Check for room overlap when updating dates or room (exclude current reservation)
    if (roomId && checkInDate && checkOutDate) {
      const hasOverlap = await checkRoomOverlap(parseInt(roomId), checkInDate, checkOutDate, id);
      if (hasOverlap) {
        return res.status(409).json({ message: 'Reservation failed due to room date overlap.' });
      }
    }

    const updatedReservation = await db.update(reservations)
      .set({
        guestId,
        roomId,
        orderId,
        memberId,
        checkInDate,
        checkOutDate,
        status,
        source,
        guestCount,
        specialRequest,
        isReconciled,
        hasBreakfast,
        hasExtrabed,
        hasLateCheckout,
        hasLaundry,
        breakfastCost: req.body.breakfastCost,
        laundryCost: req.body.laundryCost,
        massageCost: req.body.massageCost,
        totalAmount,
      })
      .where(eq(reservations.id, id))
      .returning();

    if (updatedReservation.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(updatedReservation[0]);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Failed to update reservation' });
  }
});

// DELETE /api/reservations/:id - Delete a reservation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete related records first to avoid foreign key constraint violations
    // 1. Delete payments
    await db.delete(payments).where(eq(payments.reservationId, id));
    
    // 2. Delete invoice items
    await db.delete(invoiceItems).where(eq(invoiceItems.reservationId, id));
    
    // 3. Now delete the reservation itself
    const deletedReservation = await db.delete(reservations).where(eq(reservations.id, id)).returning();

    if (deletedReservation.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Failed to delete reservation' });
  }
});

// POST /api/reservations/with-details - Create a new reservation with guest and payment details
router.post('/with-details', async (req, res) => {
  try {
    const {
      // Guest Details
      fullName,
      email,
      phone,
      origin,
      notes,
      
      
      // Reservation Details
      roomId,
      orderId, // Should be passed from frontend or generated if not present
      checkInDate,
      checkOutDate,
      memberId,
      status, // Confirmed, Tentative
      source, // Booking.com, etc.
      guestCount,
      specialRequest,
      isReconciled,
      hasBreakfast,
      hasExtrabed,
      hasLateCheckout,
      hasLaundry,
      totalAmount,

      // Payment Details
      paymentStatus, // Paid, Pending, Unpaid
      paymentDate,
      paymentAmount,
    } = req.body;

    // Check for room overlap BEFORE creating guest
    const parsedRoomId = parseInt(roomId);
    const hasOverlap = await checkRoomOverlap(parsedRoomId, checkInDate, checkOutDate);
    if (hasOverlap) {
      return res.status(409).json({ message: 'Reservation failed due to room date overlap.' });
    }

    // 1. Create Guest
    // In a real scenario, we might want to check if guest exists by email/phone first.
    // For this MVP, we'll create a new guest record for each booking as requested (or simple implementation).
    const newGuest = await db.insert(guests).values({
      fullName,
      email,
      phone,
      origin,
      notes,
    }).returning();

    if (!newGuest.length) {
      throw new Error('Failed to create guest');
    }
    const guestId = newGuest[0].id;

    // 1.5 Handle Loyalty Member Creation/Update with Points Calculation
    if (memberId) {
       try {
         // Calculate points: SUM(total_amount) / 200000 * 3
         const pointsResult = await db.select({
           totalSpent: sql<number>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)`
         }).from(reservations).where(eq(reservations.memberId, memberId));
         
         const totalSpent = Number(pointsResult[0]?.totalSpent || 0) + Number(totalAmount);
         const calculatedPoints = Math.floor(totalSpent / 200000) * 3;

         const existingMember = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.memberId, memberId));
         
         if (existingMember.length > 0) {
            await db.update(loyaltyMembers)
              .set({ 
                lastActivity: new Date(),
                pointsBalance: calculatedPoints
              })
              .where(eq(loyaltyMembers.memberId, memberId));
         } else {
            await db.insert(loyaltyMembers).values({
               orderId: orderId,
               memberId: memberId,
               pointsBalance: calculatedPoints,
               joinedAt: new Date(),
               lastActivity: new Date()
            });
         }
       } catch (loyaltyError) {
          console.error('Error handling loyalty member:', loyaltyError);
          // Don't fail the whole booking if loyalty fails, just log it
       }
    }

    // 2. Create Reservation
    const newReservation = await db.insert(reservations).values({
      guestId,
      roomId: parseInt(roomId), // Ensure integer
      orderId,
      memberId,
      checkInDate,
      checkOutDate,
      status: status || 'Confirmed',
      source,
      guestCount: parseInt(guestCount) || 1,
      specialRequest,
      isReconciled: isReconciled || false,
      hasBreakfast: hasBreakfast || false,
      hasExtrabed: hasExtrabed || false,
      hasLateCheckout: hasLateCheckout || false,
      hasLaundry: hasLaundry || false,
      breakfastCost: req.body.breakfastCost ? req.body.breakfastCost.toString() : '0',
      laundryCost: req.body.laundryCost ? req.body.laundryCost.toString() : '0',
      massageCost: req.body.massageCost ? req.body.massageCost.toString() : '0',
      totalAmount: totalAmount.toString(), // Ensure string for decimal
    }).returning();

    if (!newReservation.length) {
      throw new Error('Failed to create reservation');
    }
    const reservationId = newReservation[0].id;

    // 3. Create Payment (if applicable)
    // If status is not 'Unpaid', we assume a payment entry is needed.
    // 3. Create Payment (if applicable)
    // If status is not 'Unpaid', we assume a payment entry is needed.
    if (paymentStatus && paymentStatus !== 'Unpaid') {
       // Determine amount to record
       const amountToRecord = (paymentAmount && !isNaN(parseFloat(paymentAmount))) 
          ? paymentAmount.toString() 
          : totalAmount.toString();
        
       // Map frontend status to DB type
       let paymentType = 'Payment';
       if (paymentStatus === 'Deposit Paid (DP)') paymentType = 'DP';
       if (paymentStatus === 'Fully Paid (Lunas)') paymentType = 'Completed';

       await db.insert(payments).values({
        reservationId,
        orderId, // Include orderId for traceability
        amount: amountToRecord,
        paymentDate: paymentDate ? paymentDate : new Date().toISOString().split('T')[0],
        status: 'Paid', 
        type: paymentType,
        paymentMethod: req.body.paymentMethod || 'Cash'
      });
    }

    res.status(201).json({
      message: 'Booking created successfully',
      reservation: newReservation[0],
      guest: newGuest[0]
    });

  } catch (error: any) {
    console.error('Error creating booking with details:', error);
    if (error.code === '23505') { // Unique constraint violation (likely orderId)
      return res.status(409).json({ message: 'Order ID already exists. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
});

export default router;
