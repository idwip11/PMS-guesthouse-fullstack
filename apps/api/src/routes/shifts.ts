import { Router } from 'express';
import { db } from '../db';
import { shifts } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/shifts - Get all shifts
router.get('/', async (req, res) => {
  try {
    const allShifts = await db.select().from(shifts);
    res.json(allShifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Failed to fetch shifts' });
  }
});

// GET /api/shifts/:id - Get a single shift by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await db.select().from(shifts).where(eq(shifts.id, id));
    if (shift.length === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.json(shift[0]);
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ message: 'Failed to fetch shift' });
  }
});

// POST /api/shifts - Create a new shift
router.post('/', async (req, res) => {
  try {
    const { userId, shiftDate, startTime, endTime, shiftType, status } = req.body;

    if (!userId || !shiftDate || !startTime || !endTime || !shiftType) {
      return res.status(400).json({ message: 'userId, shiftDate, startTime, endTime, and shiftType are required' });
    }

    const newShift = await db.insert(shifts).values({
      userId,
      shiftDate,
      startTime,
      endTime,
      shiftType,
      status: status || 'Scheduled',
    }).returning();

    res.status(201).json(newShift[0]);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ message: 'Failed to create shift' });
  }
});

// PUT /api/shifts/:id - Update a shift
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, shiftDate, startTime, endTime, shiftType, status } = req.body;

    const updatedShift = await db.update(shifts)
      .set({ userId, shiftDate, startTime, endTime, shiftType, status })
      .where(eq(shifts.id, id))
      .returning();

    if (updatedShift.length === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(updatedShift[0]);
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ message: 'Failed to update shift' });
  }
});

// DELETE /api/shifts/:id - Delete a shift
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShift = await db.delete(shifts).where(eq(shifts.id, id)).returning();

    if (deletedShift.length === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ message: 'Failed to delete shift' });
  }
});

export default router;
