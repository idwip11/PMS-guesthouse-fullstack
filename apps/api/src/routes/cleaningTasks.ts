import { Router } from 'express';
import { db } from '../db';
import { cleaningTasks, taskAssignees, users } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// GET /api/cleaning-tasks - Get all cleaning tasks with assigned users
router.get('/', async (req, res) => {
  try {
    // First get all tasks
    const tasks = await db.select().from(cleaningTasks);
    
    // Then for each task, get assigned users
    const tasksWithUsers = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await db
          .select({
            id: users.id,
            username: users.username,
            fullName: users.fullName,
          })
          .from(taskAssignees)
          .innerJoin(users, eq(taskAssignees.userId, users.id))
          .where(eq(taskAssignees.taskId, task.id));
        
        return {
          ...task,
          assignedUsers: assignees,
        };
      })
    );
    
    res.json(tasksWithUsers);
  } catch (error) {
    console.error('Error fetching cleaning tasks:', error);
    res.status(500).json({ message: 'Failed to fetch cleaning tasks' });
  }
});

// POST /api/cleaning-tasks - Create a new cleaning task
router.post('/', async (req, res) => {
  try {
    const { description, roomArea, scheduledDate, priority, assignedUserIds } = req.body;
    
    if (!description || !roomArea || !scheduledDate) {
      return res.status(400).json({ message: 'description, roomArea, and scheduledDate are required' });
    }
    
    // Create the task
    const newTask = await db.insert(cleaningTasks).values({
      description,
      roomArea,
      scheduledDate,
      priority: priority || 'Medium',
      status: 'Pending',
    }).returning();
    
    // Assign users if provided
    if (assignedUserIds && assignedUserIds.length > 0) {
      const assigneeValues = assignedUserIds.map((userId: string) => ({
        taskId: newTask[0].id,
        userId,
      }));
      
      await db.insert(taskAssignees).values(assigneeValues);
    }
    
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Error creating cleaning task:', error);
    res.status(500).json({ message: 'Failed to create cleaning task' });
  }
});

// PUT /api/cleaning-tasks/:id - Update a cleaning task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, roomArea, scheduledDate, priority, status, assignedUserIds } = req.body;
    
    // Update task
    const updatedTask = await db.update(cleaningTasks)
      .set({
        description,
        roomArea,
        scheduledDate,
        priority,
        status,
      })
      .where(eq(cleaningTasks.id, id))
      .returning();
    
    if (updatedTask.length === 0) {
      return res.status(404).json({ message: 'Cleaning task not found' });
    }
    
    // Update assignees if provided
    if (assignedUserIds !== undefined) {
      // Remove existing assignees
      await db.delete(taskAssignees).where(eq(taskAssignees.taskId, id));
      
      // Add new assignees
      if (assignedUserIds.length > 0) {
        const assigneeValues = assignedUserIds.map((userId: string) => ({
          taskId: id,
          userId,
        }));
        
        await db.insert(taskAssignees).values(assigneeValues);
      }
    }
    
    res.json(updatedTask[0]);
  } catch (error) {
    console.error('Error updating cleaning task:', error);
    res.status(500).json({ message: 'Failed to update cleaning task' });
  }
});

// DELETE /api/cleaning-tasks/:id - Delete a cleaning task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTask = await db.delete(cleaningTasks)
      .where(eq(cleaningTasks.id, id))
      .returning();
    
    if (deletedTask.length === 0) {
      return res.status(404).json({ message: 'Cleaning task not found' });
    }
    
    res.json({ message: 'Cleaning task deleted successfully' });
  } catch (error) {
    console.error('Error deleting cleaning task:', error);
    res.status(500).json({ message: 'Failed to delete cleaning task' });
  }
});

export default router;
