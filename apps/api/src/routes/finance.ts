import { Router } from 'express';
import { db } from '../db';
import { payments, expenses, reservations, financialTargets } from '../db/schema';
import { sql, desc, eq, not, and, gte, lt } from 'drizzle-orm';

const router = Router();

router.get('/dashboard', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month ? parseInt(month as string) : now.getMonth() + 1;
    const queryYear = year ? parseInt(year as string) : now.getFullYear();

    // 1. Total Revenue (Filtered by Time Range)
    // If month/year provided or default (current month), we filter by that month
    // Wait, "Total Revenue" KPI usually implies "All Time" or "Filtered Range"?
    // Let's make KPIs adhere to the selected filter if provided, or defaults to specific logic?
    // Actually, usually dashboard KPIs show "Current Month" or "All Time" depending on label.
    // The previous implementation showed "All time logged" for Revenue.
    // Let's stick to "All Time" for the main KPIs unless user requests otherwise, 
    // BUT the Monthly Target card specifically asked for Month/Year selection.
    // User asked "configure targets... dropdowns to select month and year".
    // This implies the whole dashboard might filter by this month/year?
    // Let's assume the dropdowns filter the ENTIRE dashboard matching standard patterns.
    
    // Construct Date Range for filtering
    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 1);
    
    const timeFilter = and(
        gte(payments.paymentDate, startDate.toISOString()),
        lt(payments.paymentDate, endDate.toISOString())
    );
    
    const expenseTimeFilter = and(
        gte(expenses.dateIncurred, startDate.toISOString()),
        lt(expenses.dateIncurred, endDate.toISOString())
    );

    // 1. Total Revenue (Filtered) - Only count payments WITH actual payment dates
    const revenueResult = await db.select({ 
      total: sql<string>`sum(${payments.amount})` 
    })
    .from(payments)
    .where(and(
      timeFilter,
      sql`${payments.paymentDate} IS NOT NULL` // Exclude unpaid OTA payments
    ));
    const totalRevenue = Number(revenueResult[0]?.total || 0);

    // 2. Total Expenses (Filtered)
    const expensesResult = await db.select({ 
      total: sql<string>`sum(${expenses.amount})` 
    })
    .from(expenses)
    .where(expenseTimeFilter);
    const totalExpenses = Number(expensesResult[0]?.total || 0);

    // --- NEW: Calculate Previous Month Data for Percentage Change ---
    const prevMonthDate = new Date(startDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthStart = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
    const prevMonthEnd = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 1);

    const prevMonthRevenueResult = await db.select({ 
      total: sql<string>`sum(${payments.amount})` 
    })
    .from(payments)
    .where(and(
        gte(payments.paymentDate, prevMonthStart.toISOString()),
        lt(payments.paymentDate, prevMonthEnd.toISOString()),
        sql`${payments.paymentDate} IS NOT NULL` // Exclude unpaid OTA payments
    ));
    const prevRevenue = Number(prevMonthRevenueResult[0]?.total || 0);

    const prevMonthExpensesResult = await db.select({ 
      total: sql<string>`sum(${expenses.amount})` 
    })
    .from(expenses)
    .where(and(
        gte(expenses.dateIncurred, prevMonthStart.toISOString()),
        lt(expenses.dateIncurred, prevMonthEnd.toISOString())
    ));
    const prevExpenses = Number(prevMonthExpensesResult[0]?.total || 0);

    // Calculate % Change
    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(totalRevenue, prevRevenue);
    const expensesChange = calculateChange(totalExpenses, prevExpenses);
    // ----------------------------------------------------------------

    // 3. Outstanding = Total Reservation Value - Payments ACTUALLY RECEIVED (with dates)
    // Logic: 
    //   - Original unpaid reservations still count as outstanding
    //   - Payments with NULL dates (pending OTA) don't reduce outstanding
    //   - Only payments WITH dates count as received revenue
    const reservationsResult = await db.select({ 
      totalVal: sql<string>`sum(${reservations.totalAmount})` 
    })
    .from(reservations)
    .where(not(eq(reservations.status, 'Cancelled')));
    const totalReservationValue = Number(reservationsResult[0]?.totalVal || 0);
    
    // Sum only payments that have been ACTUALLY RECEIVED (has payment date)
    const allTimeReceivedResult = await db.select({ 
      total: sql<string>`sum(${payments.amount})` 
    })
    .from(payments)
    .where(sql`${payments.paymentDate} IS NOT NULL`);
    const allTimeReceived = Number(allTimeReceivedResult[0]?.total || 0);
    
    const outstanding = Math.max(0, totalReservationValue - allTimeReceived);

    // 4. Net Profit (Filtered)
    const netProfit = totalRevenue - totalExpenses;

    // 5. Recent Transactions (Merge Payments & Expenses)
    // We'll fetch top 50 of each and merge/sort in memory for simplicity 
    // (Union queries in Drizzle can be complex)
    const recentPayments = await db.select({
      id: payments.id,
      date: payments.paymentDate,
      amount: payments.amount,
      type: sql<string>`'Inflow'`,
      category: payments.type,
      description: sql<string>`'Payment for Reservation'`,
      status: payments.status,
      refId: payments.orderId
    })
    .from(payments)
    .where(timeFilter) // Apply filter
    .orderBy(desc(payments.paymentDate))
    .limit(50);

    const recentExpenses = await db.select({
        id: expenses.id,
        date: expenses.dateIncurred,
        amount: expenses.amount,
        type: sql<string>`'Outflow'`,
        category: expenses.category,
        description: expenses.description,
        status: expenses.status,
        refId: sql<string>`NULL`
      })
      .from(expenses)
      .where(expenseTimeFilter) // Apply filter
      .orderBy(desc(expenses.dateIncurred))
      .limit(50);

    const allTransactions = [...recentPayments, ...recentExpenses]
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 50);

    // 6. Chart Data (Last 6 months)
    // Group by month
    // We can do this in JS for simplicity if data volume is low, or SQL
    // Let's do a simple SQL aggregation for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const dateStr = sixMonthsAgo.toISOString().split('T')[0];

    const monthlyRevenue = await db.select({
        month: sql<string>`to_char(${payments.paymentDate}, 'Mon')`,
        year: sql<string>`to_char(${payments.paymentDate}, 'YYYY')`,
        monthNum: sql<number>`extract(month from ${payments.paymentDate})`,
        total: sql<string>`sum(${payments.amount})`
    })
    .from(payments)
    .where(gte(payments.paymentDate, dateStr))
    .groupBy(sql`to_char(${payments.paymentDate}, 'Mon')`, sql`to_char(${payments.paymentDate}, 'YYYY')`, sql`extract(month from ${payments.paymentDate})`)
    .orderBy(sql`extract(month from ${payments.paymentDate})`);

    const monthlyExpenses = await db.select({
        month: sql<string>`to_char(${expenses.dateIncurred}, 'Mon')`,
        year: sql<string>`to_char(${expenses.dateIncurred}, 'YYYY')`,
        monthNum: sql<number>`extract(month from ${expenses.dateIncurred})`,
        total: sql<string>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(gte(expenses.dateIncurred, dateStr))
    .groupBy(sql`to_char(${expenses.dateIncurred}, 'Mon')`, sql`to_char(${expenses.dateIncurred}, 'YYYY')`, sql`extract(month from ${expenses.dateIncurred})`)
    .orderBy(sql`extract(month from ${expenses.dateIncurred})`);

    // Merge monthly data structure
    // Create a map of "Mon" -> { revenue: 0, expense: 0 }
    // Initialize last 6 months labels
    const monthLabels = [];
    const today = new Date();
    for(let i=5; i>=0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthLabels.push(d.toLocaleString('default', { month: 'short' }));
    }

    const chartData = monthLabels.map(label => {
        const rev = monthlyRevenue.find(r => r.month === label);
        const exp = monthlyExpenses.find(e => e.month === label);
        return {
            name: label,
            income: Number(rev?.total || 0),
            expense: Number(exp?.total || 0)
        };
    });
    
    // 7. Payment Methods Distribution
    const paymentMethodsStats = await db.select({
        method: payments.paymentMethod,
        count: sql<number>`count(*)::int`,
        total: sql<string>`sum(${payments.amount})`
    })
    .from(payments)
    .where(timeFilter)
    .groupBy(payments.paymentMethod);
    
    const totalPaymentsCount = paymentMethodsStats.reduce((sum, item) => sum + item.count, 0);
    
    const paymentMethods = paymentMethodsStats.map(stat => ({
        method: stat.method || 'Unknown',
        percentage: totalPaymentsCount > 0 ? Math.round((stat.count / totalPaymentsCount) * 100) : 0,
        count: stat.count
    })).sort((a, b) => b.percentage - a.percentage);

    // 8. Monthly Target & Realized (Use queryMonth/queryYear)
    // We already calculated totalRevenue for this specific filtered month above!
    const realizedRevenue = totalRevenue; 
    
    // Fetch Target for this specific month/year
    const targetResult = await db.select()
        .from(financialTargets)
        .where(and(
            eq(financialTargets.month, queryMonth),
            eq(financialTargets.year, queryYear)
        ));
        
    const monthlyTarget = targetResult.length > 0 ? Number(targetResult[0].targetAmount) : 0;

    // 9. Expense Categories (Filtered by Time Range)
    const expenseCategoriesResult = await db.select({
        category: expenses.category,
        total: sql<string>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(expenseTimeFilter)
    .groupBy(expenses.category)
    .orderBy(desc(sql`sum(${expenses.amount})`));

    const expenseCategories = expenseCategoriesResult.map(item => ({
        name: item.category,
        value: Number(item.total || 0)
    }));

    res.json({
        kpi: {
            totalRevenue, // Now filtered
            outstanding, // Still global
            opExpenses: totalExpenses, // Now filtered
            netProfit, // Now filtered
            revenueChange,
            expensesChange
        },
        transactions: allTransactions,
        chartData, // Keeps 6 months history
        paymentMethods,
        expenseCategories, // New field
        target: {
            currentRevenue: realizedRevenue,
            monthlyTarget
        },
        filter: {
            month: queryMonth,
            year: queryYear
        }
    });



  } catch (error) {
    console.error('Error fetching finance dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch finance dashboard' });
  }
});
// POST /api/finance/target - Set monthly target
router.post('/target', async (req, res) => {
  try {
    const { month, year, targetAmount } = req.body;
    
    if (!month || !year || targetAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if exists
    const existing = await db.select().from(financialTargets).where(and(
        eq(financialTargets.month, month),
        eq(financialTargets.year, year)
    ));

    if (existing.length > 0) {
        // Update
        await db.update(financialTargets)
            .set({ 
                targetAmount: String(targetAmount),
                updatedAt: new Date()
            })
            .where(eq(financialTargets.id, existing[0].id));
    } else {
        // Insert
        await db.insert(financialTargets).values({
            month,
            year,
            targetAmount: String(targetAmount)
        });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving financial target:', error);
    res.status(500).json({ message: 'Failed to save target' });
  }
});

// GET /api/finance/report - Financial report for export (Excel)
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate, guesthouse } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    // Parse guesthouse filter (0 or undefined = all, 1-5 = specific)
    const guesthouseFilter = guesthouse ? parseInt(guesthouse as string) : 0;

    // === INCOME: From reservations table ===
    // Filter by check_in_date within date range
    // If guesthouse filter is set, filter by room floor
    let incomeQuery: any[] = [];
    
    if (guesthouseFilter > 0) {
      // Get rooms on the specified floor (floor = guesthouse number)
      const roomsOnFloor = await db.select({ id: sql<number>`id` })
        .from(sql`rooms`)
        .where(sql`floor = ${guesthouseFilter}`);
      
      const roomIds = roomsOnFloor.map(r => r.id);
      
      if (roomIds.length > 0) {
        incomeQuery = await db.select()
          .from(reservations)
          .where(and(
            gte(reservations.checkInDate, start.toISOString().split('T')[0]),
            lt(reservations.checkInDate, end.toISOString().split('T')[0]),
            sql`room_id IN (${sql.join(roomIds, sql`, `)})`
          ));
      } else {
        incomeQuery = [];
      }
    } else {
      // All guesthouses
      incomeQuery = await db.select()
        .from(reservations)
        .where(and(
          gte(reservations.checkInDate, start.toISOString().split('T')[0]),
          lt(reservations.checkInDate, end.toISOString().split('T')[0])
        ));
    }

    const incomeDetails = (incomeQuery as any[]).map((res: any) => ({
      room_id: res.roomId || res.room_id,
      order_id: res.orderId || res.order_id,
      source: res.source,
      check_in_date: res.checkInDate || res.check_in_date,
      check_out_date: res.checkOutDate || res.check_out_date,
      total_amount: Number(res.totalAmount || res.total_amount || 0),
    }));

    // === EXPENSES: Filter by date range and guesthouse column ===
    let expenseQuery;
    
    if (guesthouseFilter > 0) {
      // Filter by specific guesthouse
      expenseQuery = await db.select({
        id: expenses.id,
        description: expenses.description,
        category: expenses.category,
        amount: expenses.amount,
        date_incurred: expenses.dateIncurred,
        notes: expenses.notes,
        guesthouse: expenses.guesthouse,
      })
      .from(expenses)
      .where(and(
        gte(expenses.dateIncurred, start.toISOString().split('T')[0]),
        lt(expenses.dateIncurred, end.toISOString().split('T')[0]),
        eq(expenses.guesthouse, guesthouseFilter)
      ));
    } else {
      // All guesthouses (0 means all, or guesthouse 1-5)
      expenseQuery = await db.select({
        id: expenses.id,
        description: expenses.description,
        category: expenses.category,
        amount: expenses.amount,
        date_incurred: expenses.dateIncurred,
        notes: expenses.notes,
        guesthouse: expenses.guesthouse,
      })
      .from(expenses)
      .where(and(
        gte(expenses.dateIncurred, start.toISOString().split('T')[0]),
        lt(expenses.dateIncurred, end.toISOString().split('T')[0])
      ));
    }

    const expenseDetails = expenseQuery.map((e: any) => ({
      description: e.description,
      category: e.category,
      amount: Number(e.amount),
      date_incurred: e.date_incurred,
      notes: e.notes,
      guesthouse: e.guesthouse,
    }));

    // Calculate totals
    const totalIncome = incomeDetails.reduce((sum, i) => sum + i.total_amount, 0);
    const totalExpense = expenseDetails.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      netProfit,
      incomeDetails,
      expenseDetails,
      filter: {
        startDate,
        endDate,
        guesthouse: guesthouseFilter,
      }
    });
  } catch (error) {
    console.error('Error fetching finance report:', error);
    res.status(500).json({ message: 'Failed to fetch finance report' });
  }
});

export default router;
