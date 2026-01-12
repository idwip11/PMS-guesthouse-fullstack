import { Router } from 'express';
import { db } from '../db';
import { expenses } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/expenses - Get all expenses
router.get('/', async (req, res) => {
  try {
    const allExpenses = await db.select().from(expenses);
    res.json(allExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/:id - Get a single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await db.select().from(expenses).where(eq(expenses.id, id));
    if (expense.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Failed to fetch expense' });
  }
});

// POST /api/expenses - Create a new expense
router.post('/', async (req, res) => {
  try {
    const { loggedByUserId, description, category, amount, dateIncurred, status, receiptUrl } = req.body;

    if (!description || !category || !amount || !dateIncurred) {
      return res.status(400).json({ message: 'description, category, amount, and dateIncurred are required' });
    }

    const newExpense = await db.insert(expenses).values({
      loggedByUserId,
      description,
      category,
      amount,
      dateIncurred,
      status: status || 'Pending',
      receiptUrl,
    }).returning();

    res.status(201).json(newExpense[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update an expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { loggedByUserId, description, category, amount, dateIncurred, status, receiptUrl } = req.body;

    const updatedExpense = await db.update(expenses)
      .set({ loggedByUserId, description, category, amount, dateIncurred, status, receiptUrl })
      .where(eq(expenses.id, id))
      .returning();

    if (updatedExpense.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updatedExpense[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await db.delete(expenses).where(eq(expenses.id, id)).returning();

    if (deletedExpense.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

export default router;
