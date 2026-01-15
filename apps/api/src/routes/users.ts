import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/users - Get all users (excluding password)
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    }).from(users);
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, id));

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// POST /api/users - Create a new user (simple, no hashing for now)
router.post('/', async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'username, password, and fullName are required' });
    }

    // For now, store password as-is (we'll add hashing with bcrypt later)
    const newUser = await db.insert(users).values({
      username,
      passwordHash: password, // TODO: Hash with bcrypt
      fullName,
      role: role || 'Staff',
    }).returning({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      createdAt: users.createdAt,
    });

    res.status(201).json(newUser[0]);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, role, avatarUrl } = req.body;

    const updatedUser = await db.update(users)
      .set({ username, fullName, role, avatarUrl })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      });

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();

    if (deletedUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;
