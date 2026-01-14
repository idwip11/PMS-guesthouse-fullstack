import { Router } from 'express';
import { db } from '../db';
import { marketingCampaigns, loyaltyMembers, guests, reservations, rooms } from '../db/schema';
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

// GET real-time member stats
router.get('/stats', async (req, res) => {
  try {
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

    res.json({
      totalMembers: Number(totalMembersResult[0]?.count || 0),
      newMembersThisWeek: Number(newMembersResult[0]?.count || 0)
    });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({ message: 'Failed to fetch member stats' });
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

export default router;
