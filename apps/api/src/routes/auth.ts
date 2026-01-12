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

export default router;
