import { Router } from 'express';
import { db } from '../db';
import { operationalBudgets } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// GET /api/budgets?year=YYYY - Get all budgets for a specific year
router.get('/', async (req, res) => {
  try {
    const year = parseInt(req.query.year as string);
    
    if (!year) {
      return res.status(400).json({ message: 'Year parameter is required' });
    }

    const budgets = await db
      .select()
      .from(operationalBudgets)
      .where(eq(operationalBudgets.year, year))
      .orderBy(operationalBudgets.month);

    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets - Bulk upsert budgets (create or update)
router.post('/', async (req, res) => {
  try {
    const budgets = req.body.budgets; // Array of { year, month, projectedAmount }

    if (!Array.isArray(budgets) || budgets.length === 0) {
      return res.status(400).json({ message: 'Budgets array is required' });
    }

    // Validate input
    for (const budget of budgets) {
      if (!budget.year || !budget.month || budget.projectedAmount === undefined) {
        return res.status(400).json({ message: 'Each budget must have year, month, and projectedAmount' });
      }
      if (budget.month < 1 || budget.month > 12) {
        return res.status(400).json({ message: 'Month must be between 1 and 12' });
      }
    }

    // Upsert each budget (insert or update if exists)
    const results = [];
    for (const budget of budgets) {
      const result = await db
        .insert(operationalBudgets)
        .values({
          year: budget.year,
          month: budget.month,
          projectedAmount: budget.projectedAmount.toString(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [operationalBudgets.year, operationalBudgets.month],
          set: {
            projectedAmount: budget.projectedAmount.toString(),
            updatedAt: new Date(),
          },
        })
        .returning();
      
      results.push(result[0]);
    }

    res.status(201).json({ message: 'Budgets saved successfully', budgets: results });
  } catch (error) {
    console.error('Error saving budgets:', error);
    res.status(500).json({ message: 'Failed to save budgets' });
  }
});

export default router;
