import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password (plain text for now - TODO: use bcrypt in production)
    if (user[0].passwordHash !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Return user info (excluding password)
    const { passwordHash, ...userWithoutPassword } = user[0];
    return res.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
});

// GET /api/auth/me - Get current user (for session validation)
router.get('/me', async (req: Request, res: Response) => {
  // In a real app, this would validate a JWT token
  // For now, we'll just return a placeholder
  return res.status(401).json({ message: 'Not authenticated' });
});

// PUT /api/auth/password - Update user password
router.put('/password', async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'userId, currentPassword, and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Find user by ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password (plain text for now - TODO: use bcrypt in production)
    if (user[0].passwordHash !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await db
      .update(users)
      .set({ passwordHash: newPassword })
      .where(eq(users.id, userId));

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ message: 'An error occurred while updating password' });
  }
});

export default router;
