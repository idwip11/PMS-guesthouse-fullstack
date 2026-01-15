import { Router } from 'express';
import { db } from '../db';
import { marketingCampaigns, loyaltyMembers, guests, reservations, rooms, expenses, marketingBudgets } from '../db/schema';
import { eq, desc, sql, gt } from 'drizzle-orm';

const router = Router();

// GET Export Excel (CSV)
router.get('/export', async (req, res) => {
  try {
    const data = await db.select({
      order_id: reservations.orderId,
      full_name: guests.fullName,
      email: guests.email,
      phone: guests.phone,
      origin: guests.origin,
      check_in_date: reservations.checkInDate,
      check_out_date: reservations.checkOutDate,
      source: reservations.source,
      member_id: reservations.memberId,
      total_amount: reservations.totalAmount,
      room_id: reservations.roomId,
      room_number: rooms.roomNumber,
      created_at: reservations.createdAt,
    })
    .from(reservations)
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .leftJoin(rooms, eq(reservations.roomId, rooms.id))
    .orderBy(desc(reservations.createdAt));

    // Convert to CSV
    const headers = [
      'order_id', 'full_name', 'email', 'phone', 'origin', 
      'check_in_date', 'check_out_date', 'source', 'member_id', 
      'total_amount', 'room_id', 'room_number', 'created_at'
    ];

    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const val = (row as any)[header];
        // Handle dates and nulls, escape quotes
        if (val === null || val === undefined) return '';
        const stringVal = String(val).replace(/"/g, '""'); // Escape double quotes
        return `"${stringVal}"`; // Wrap in quotes
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment(`pms_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvString);

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).send('Failed to export data');
  }
});

// GET real-time member stats + Marketing Dashboard Data
router.get('/stats', async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    // 1. Member Stats (All time)
    const totalMembersResult = await db.select({
      count: sql<number>`count(distinct ${loyaltyMembers.memberId})`
    }).from(loyaltyMembers);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newMembersResult = await db.select({
      count: sql<number>`count(distinct ${loyaltyMembers.memberId})`
    })
    .from(loyaltyMembers)
    .where(gt(loyaltyMembers.joinedAt, sevenDaysAgo));

    // 2. Booking Source Distribution
    const sourceDistribution = await db.select({
      source: reservations.source,
      count: sql<number>`count(*)`,
      revenue: sql<number>`sum(${reservations.totalAmount})`
    })
    .from(reservations)
    .groupBy(reservations.source);

    // 3. Marketing ROI (Monthly)
    // Marketing Spend (Expenses category = 'Marketing') for target month/year
    const marketingSpendResult = await db.execute(sql`
      SELECT sum(amount) as total 
      FROM expenses 
      WHERE category = 'Marketing'
      AND EXTRACT(MONTH FROM date_incurred) = ${targetMonth}
      AND EXTRACT(YEAR FROM date_incurred) = ${targetYear}
    `);

    const marketingSpend = Number(marketingSpendResult[0]?.total || 0);

    // Total Revenue (All reservations) for target month/year
    const totalRevenueResult = await db.execute(sql`
      SELECT sum(total_amount) as total
      FROM reservations
      WHERE EXTRACT(MONTH FROM created_at) = ${targetMonth}
      AND EXTRACT(YEAR FROM created_at) = ${targetYear}
    `);

    const totalRevenue = Number(totalRevenueResult[0]?.total || 0);

    // Fetch Budget for target month/year
    const budgetResult = await db.select()
      .from(marketingBudgets)
      .where(sql`${marketingBudgets.month} = ${targetMonth} AND ${marketingBudgets.year} = ${targetYear}`);
    
    const marketingBudget = budgetResult.length > 0 ? Number(budgetResult[0].budgetAmount) : 0;

    // ROI Calculation: (Revenue - Budget) / Budget
    // If no budget is set, fallback to (Revenue - Spend) / Spend? 
    // User requested "based on configured budget". If budget is 0, ROI is undefined/Infinite.
    // Let's return the raw numbers so frontend can decide.

    // 4. Booking Lead Time (Avg check_in - created_at)
    const leadTimeResult = await db.select({
      avgDays: sql<number>`AVG(DATE_PART('day', ${reservations.checkInDate}::timestamp - ${reservations.createdAt}::timestamp))`
    })
    .from(reservations);

    const avgLeadTime = Math.round(Number(leadTimeResult[0]?.avgDays || 0));

    res.json({
      totalMembers: Number(totalMembersResult[0]?.count || 0),
      newMembersThisWeek: Number(newMembersResult[0]?.count || 0),
      sourceDistribution: sourceDistribution.map(item => ({
        source: item.source || 'Direct',
        count: Number(item.count),
        revenue: Number(item.revenue || 0)
      })),
      marketingROI: {
        spend: marketingSpend,
        revenue: totalRevenue,
        budget: marketingBudget
      },
      leadTime: avgLeadTime
    });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({ message: 'Failed to fetch member stats' });
  }
});

// GET Budget for a year
router.get('/budgets/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const budgets = await db.select()
      .from(marketingBudgets)
      .where(eq(marketingBudgets.year, parseInt(year)));
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
});

// POST/PUT Upsert Budget
router.post('/budgets', async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    
    // Check if exists
    const existing = await db.select()
      .from(marketingBudgets)
      .where(sql`${marketingBudgets.month} = ${month} AND ${marketingBudgets.year} = ${year}`);

    if (existing.length > 0) {
      // Update
      const [updated] = await db.update(marketingBudgets)
        .set({ budgetAmount: amount, updatedAt: new Date() })
        .where(eq(marketingBudgets.id, existing[0].id))
        .returning();
      res.json(updated);
    } else {
      // Insert
      const [inserted] = await db.insert(marketingBudgets)
        .values({
          month,
          year,
          budgetAmount: amount
        })
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ message: 'Failed to save budget' });
  }
});

// GET all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.startDate));
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

// POST create campaign
router.post('/', async (req, res) => {
  try {
    const { name, code, description, memberId, discountDetails, targetAudience, startDate, endDate, status } = req.body;
    
    const [newCampaign] = await db.insert(marketingCampaigns).values({
      name,
      code,
      description,
      memberId,
      discountDetails,
      targetAudience,
      startDate,
      endDate,
      status: status || 'Active',
    }).returning();

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
});

// PUT update campaign
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, memberId, discountDetails, targetAudience, startDate, endDate, status } = req.body;

    const [updatedCampaign] = await db.update(marketingCampaigns)
      .set({
        name,
        code,
        description,
        memberId,
        discountDetails,
        targetAudience,
        startDate,
        endDate,
        status,
      })
      .where(eq(marketingCampaigns.id, id))
      .returning();

    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Failed to update campaign' });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Failed to delete campaign' });
  }
});

// GET all loyalty members
router.get('/loyalty-members', async (req, res) => {
  try {
    // Join loyalty_members -> reservations (via orderId) -> guests (via guestId)
    const members = await db.select({
      id: loyaltyMembers.id,
      orderId: loyaltyMembers.orderId,
      memberId: loyaltyMembers.memberId,
      pointsBalance: loyaltyMembers.pointsBalance,
      joinedAt: loyaltyMembers.joinedAt,
      lastActivity: loyaltyMembers.lastActivity,
      guestName: guests.fullName,
      guestEmail: guests.email,
    })
    .from(loyaltyMembers)
    .leftJoin(reservations, eq(loyaltyMembers.memberId, reservations.memberId))
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .orderBy(desc(loyaltyMembers.lastActivity));

    // Deduplicate by memberId (multiple reservations = multiple rows)
    const uniqueMembers = members.reduce((acc: any[], member) => {
      if (!acc.find(m => m.memberId === member.memberId)) {
        acc.push(member);
      }
      return acc;
    }, []);

    res.json(uniqueMembers);
  } catch (error) {
    console.error('Error fetching loyalty members:', error);
    res.status(500).json({ message: 'Failed to fetch loyalty members' });
  }
});

// PUT update loyalty member points
router.put('/loyalty-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsBalance } = req.body;

    const [updatedMember] = await db.update(loyaltyMembers)
      .set({ pointsBalance: Number(pointsBalance) })
      .where(eq(loyaltyMembers.id, id))
      .returning();

    if (!updatedMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Failed to update member' });
  }
});

// DELETE loyalty member
router.delete('/loyalty-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(loyaltyMembers).where(eq(loyaltyMembers.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Failed to delete member' });
  }
});

// GET lookup member details for auto-fill
router.get('/lookup-member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Find the most recent reservation with this memberId to get guest details
    const recentBooking = await db.select({
       fullName: guests.fullName,
       email: guests.email,
       phone: guests.phone,
       origin: guests.origin,
       notes: guests.notes
    })
    .from(reservations)
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .where(eq(reservations.memberId, memberId))
    .orderBy(desc(reservations.createdAt))
    .limit(1);

    if (recentBooking.length === 0) {
      // Also determine if member exists in loyalty table even if no reservation found (edge case)
      const loyaltyRecord = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.memberId, memberId));
      if (loyaltyRecord.length > 0) {
         return res.status(200).json({ found: true, details: null }); // Exists but no guest data to autofill?
      }
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(recentBooking[0]);
  } catch (error) {
    console.error('Error looking up member:', error);
    res.status(500).json({ message: 'Failed to lookup member' });
  }
});

export default router;
