import { Router } from 'express';
import { db } from '../db';
import { rooms } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

import { users } from '../db/schema';

// GET /api/rooms - Get all rooms
router.get('/', async (req, res) => {
  try {
    const allRooms = await db.select({
      id: rooms.id,
      roomNumber: rooms.roomNumber,
      roomType: rooms.roomType,
      pricePerNight: rooms.pricePerNight,
      status: rooms.status,
      floor: rooms.floor,
      assignedUserId: rooms.assignedUserId,
      assignedUserName: users.fullName,
    })
    .from(rooms)
    .leftJoin(users, eq(rooms.assignedUserId, users.id));
    
    res.json(allRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/:id - Get a single room by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const roomId = parseInt(id, 10);
    if (isNaN(roomId)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    const room = await db.select({
      id: rooms.id,
      roomNumber: rooms.roomNumber,
      roomType: rooms.roomType,
      pricePerNight: rooms.pricePerNight,
      status: rooms.status,
      floor: rooms.floor,
      assignedUserId: rooms.assignedUserId,
      assignedUserName: users.fullName,
    })
    .from(rooms)
    .leftJoin(users, eq(rooms.assignedUserId, users.id))
    .where(eq(rooms.id, roomId));
    
    if (room.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room[0]);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Failed to fetch room' });
  }
});

// POST /api/rooms - Create a new room
router.post('/', async (req, res) => {
  try {
    const { id, roomNumber, roomType, pricePerNight, status, floor, assignedUserId } = req.body;

    if (!roomNumber || !roomType || !pricePerNight) {
      return res.status(400).json({ message: 'roomNumber, roomType, and pricePerNight are required' });
    }
    
    const newRoomValues: any = {
      roomNumber,
      roomType,
      pricePerNight,
      status: status || 'Available',
      floor: floor || null,
      assignedUserId: assignedUserId || null,
    };
    
    if (id) {
       newRoomValues.id = parseInt(id, 10);
    }

    const newRoom = await db.insert(rooms).values(newRoomValues).returning();

    res.status(201).json(newRoom[0]);
  } catch (error: any) {
    console.error('Error creating room:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ message: 'Room number or ID already exists' });
    }
    res.status(500).json({ message: 'Failed to create room' });
  }
});

// PUT /api/rooms/:id - Update a room
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const roomId = parseInt(id, 10);
    if (isNaN(roomId)) {
       return res.status(400).json({ message: 'Invalid room ID' });
    }
    const { roomNumber, roomType, pricePerNight, status, floor, assignedUserId } = req.body;

    const updatedRoom = await db.update(rooms)
      .set({
        roomNumber,
        roomType,
        pricePerNight,
        status,
        floor,
        assignedUserId,
      })
      .where(eq(rooms.id, roomId))
      .returning();

    if (updatedRoom.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(updatedRoom[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Failed to update room' });
  }
});

// DELETE /api/rooms/:id - Delete a room
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const roomId = parseInt(id, 10);
     if (isNaN(roomId)) {
       return res.status(400).json({ message: 'Invalid room ID' });
    }
    const deletedRoom = await db.delete(rooms).where(eq(rooms.id, roomId)).returning();

    if (deletedRoom.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Failed to delete room' });
  }
});

export default router;
