
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { db } from './db';
import { users } from './db/schema';

// Import Routes
import roomsRouter from './routes/rooms';
import usersRouter from './routes/users';
import guestsRouter from './routes/guests';
import reservationsRouter from './routes/reservations';
import expensesRouter from './routes/expenses';
import inventoryRouter from './routes/inventory';
import maintenanceRouter from './routes/maintenance';
import shiftsRouter from './routes/shifts';
import authRouter from './routes/auth';
import cleaningTasksRouter from './routes/cleaningTasks';
import financeRouter from './routes/finance';
import marketingRouter from './routes/marketing';
import uploadRouter from './routes/upload';
import budgetsRouter from './routes/budgets';

import supportRouter from './routes/support';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HomiQ PMS API' });
});

app.get('/health', async (req, res) => {
  try {
    // Simple query to check DB connection
    const result = await db.select({ id: users.id }).from(users).limit(1);
    res.json({ status: 'ok', db: 'connected', sample: result });
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/users', usersRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/cleaning-tasks', cleaningTasksRouter);
app.use('/api/finance', financeRouter);
app.use('/api/marketing', marketingRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/support', supportRouter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
