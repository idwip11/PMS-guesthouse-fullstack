import { Router } from 'express';
import { db } from '../db';
import { reservations, guests, rooms } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/reservations - Get all reservations
router.get('/', async (req, res) => {
  try {
    const allReservations = await db.select().from(reservations);
    res.json(allReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Failed to fetch reservations' });
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

    const newReservation = await db.insert(reservations).values({
      guestId,
      roomId,
      orderId,
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

    const updatedReservation = await db.update(reservations)
      .set({
        guestId,
        roomId,
        orderId,
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

export default router;
