import { Router } from 'express';
import { db } from '../db';
import { guests } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/guests - Get all guests
router.get('/', async (req, res) => {
  try {
    const allGuests = await db.select().from(guests);
    res.json(allGuests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ message: 'Failed to fetch guests' });
  }
});

// GET /api/guests/:id - Get a single guest by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await db.select().from(guests).where(eq(guests.id, id));
    if (guest.length === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.json(guest[0]);
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ message: 'Failed to fetch guest' });
  }
});

// POST /api/guests - Create a new guest
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, origin, notes } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: 'fullName is required' });
    }

    const newGuest = await db.insert(guests).values({
      fullName,
      email,
      phone,
      origin,
      notes,
    }).returning();

    res.status(201).json(newGuest[0]);
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ message: 'Failed to create guest' });
  }
});

// PUT /api/guests/:id - Update a guest
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, origin, notes } = req.body;

    const updatedGuest = await db.update(guests)
      .set({ fullName, email, phone, origin, notes })
      .where(eq(guests.id, id))
      .returning();

    if (updatedGuest.length === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json(updatedGuest[0]);
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ message: 'Failed to update guest' });
  }
});

// DELETE /api/guests/:id - Delete a guest
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGuest = await db.delete(guests).where(eq(guests.id, id)).returning();

    if (deletedGuest.length === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ message: 'Failed to delete guest' });
  }
});

export default router;
