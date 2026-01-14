import { Router } from 'express';
import { db } from '../db';
import { maintenanceTickets } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';

const router = Router();

// GET /api/maintenance - Get all maintenance tickets
router.get('/', async (req, res) => {
  try {
    const allTickets = await db.select().from(maintenanceTickets);
    res.json(allTickets);
  } catch (error) {
    console.error('Error fetching maintenance tickets:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance tickets' });
  }
});

// GET /api/maintenance/:id - Get a single maintenance ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await db.select().from(maintenanceTickets).where(eq(maintenanceTickets.id, id));
    if (ticket.length === 0) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }
    res.json(ticket[0]);
  } catch (error) {
    console.error('Error fetching maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance ticket' });
  }
});

// POST /api/maintenance - Create a new maintenance ticket
router.post('/', async (req, res) => {
  try {
    const { roomId, reportedByUserId, issueType, description, priority, status } = req.body;

    if (!roomId || !issueType) {
      return res.status(400).json({ message: 'roomId and issueType are required' });
    }

    const newTicket = await db.insert(maintenanceTickets).values({
      roomId,
      reportedByUserId,
      issueType,
      description,
      priority: priority || 'Medium',
      status: status || 'Open',
    }).returning();

    res.status(201).json(newTicket[0]);
  } catch (error) {
    console.error('Error creating maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to create maintenance ticket' });
  }
});

// POST /api/maintenance/room/:roomId - Upsert (Create or Update) maintenance ticket for a room
router.post('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { issueType, description, priority, status } = req.body;

    if (!roomId || !issueType) {
      return res.status(400).json({ message: 'roomId and issueType are required' });
    }

    // Check for existing Open or In_Progress ticket
    const existingTicket = await db.select().from(maintenanceTickets)
      .where(and(
        eq(maintenanceTickets.roomId, Number(roomId)),
        or(eq(maintenanceTickets.status, 'Open'), eq(maintenanceTickets.status, 'In_Progress'))
      ));

    let resultTicket;

    if (existingTicket.length > 0) {
      // Update existing
      const [updated] = await db.update(maintenanceTickets)
        .set({ 
           issueType, 
           description, 
           priority: priority || 'Medium',
           // Don't override active status unless specified
           status: status || existingTicket[0].status 
        })
        .where(eq(maintenanceTickets.id, existingTicket[0].id))
        .returning();
      resultTicket = updated;
    } else {
      // Create new
      const [created] = await db.insert(maintenanceTickets).values({
        roomId: Number(roomId),
        issueType,
        description,
        priority: priority || 'Medium',
        status: status || 'Open',
        // Optional: set reportedByUserId if context available
      }).returning();
      resultTicket = created;
    }

    res.json(resultTicket);
  } catch (error) {
    console.error('Error upserting maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to save maintenance ticket' });
  }
});

// PUT /api/maintenance/:id - Update a maintenance ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId, reportedByUserId, issueType, description, priority, status } = req.body;

    const updatedTicket = await db.update(maintenanceTickets)
      .set({ roomId, reportedByUserId, issueType, description, priority, status })
      .where(eq(maintenanceTickets.id, id))
      .returning();

    if (updatedTicket.length === 0) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }

    res.json(updatedTicket[0]);
  } catch (error) {
    console.error('Error updating maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to update maintenance ticket' });
  }
});

// DELETE /api/maintenance/:id - Delete a maintenance ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTicket = await db.delete(maintenanceTickets).where(eq(maintenanceTickets.id, id)).returning();

    if (deletedTicket.length === 0) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }

    res.json({ message: 'Maintenance ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to delete maintenance ticket' });
  }
});

export default router;
