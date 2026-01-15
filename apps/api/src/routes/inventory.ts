import { Router } from 'express';
import { db } from '../db';
import { inventoryItems } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/inventory - Get all inventory items
router.get('/', async (req, res) => {
  try {
    const allItems = await db.select().from(inventoryItems);
    res.json(allItems);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Failed to fetch inventory items' });
  }
});

// GET /api/inventory/:id - Get a single inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    if (item.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ message: 'Failed to fetch inventory item' });
  }
});

// POST /api/inventory - Create a new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, category, currentStock, minThreshold, unit, contactVendor } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'name and category are required' });
    }

    const newItem = await db.insert(inventoryItems).values({
      name,
      category,
      currentStock: currentStock || 0,
      minThreshold: minThreshold || 10,
      unit: unit || 'pcs',
      contactVendor: contactVendor || '',
    }).returning();

    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: 'Failed to create inventory item' });
  }
});

// PUT /api/inventory/:id - Update an inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, currentStock, minThreshold, unit, contactVendor } = req.body;

    const updatedItem = await db.update(inventoryItems)
      .set({ name, category, currentStock, minThreshold, unit, contactVendor })
      .where(eq(inventoryItems.id, id))
      .returning();

    if (updatedItem.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(updatedItem[0]);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Failed to update inventory item' });
  }
});

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();

    if (deletedItem.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'Failed to delete inventory item' });
  }
});

export default router;
