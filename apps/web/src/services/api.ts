// Centralized API Service for HomiQ PMS Frontend

// Centralized API Service for HomiQ PMS Frontend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const uploadFile = async (file: File): Promise<{ url: string, filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('File upload failed');
  }
  
  return response.json();
};

// --- ROOMS API ---
export const roomsApi = {
  getAll: () => fetchApi<import('../types').Room[]>('/rooms'),
  getById: (id: string) => fetchApi<import('../types').Room>(`/rooms/${id}`),
  create: (data: Partial<import('../types').Room>) =>
    fetchApi<import('../types').Room>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').Room>) =>
    fetchApi<import('../types').Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/rooms/${id}`, { method: 'DELETE' }),
};

// --- USERS API ---
export const usersApi = {
  getAll: () => fetchApi<import('../types').User[]>('/users'),
  getById: (id: string) => fetchApi<import('../types').User>(`/users/${id}`),
  create: (data: { username: string; password: string; fullName: string; role?: string }) =>
    fetchApi<import('../types').User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').User>) =>
    fetchApi<import('../types').User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
};

// --- GUESTS API ---
export const guestsApi = {
  getAll: () => fetchApi<import('../types').Guest[]>('/guests'),
  getById: (id: string) => fetchApi<import('../types').Guest>(`/guests/${id}`),
  create: (data: Partial<import('../types').Guest>) =>
    fetchApi<import('../types').Guest>('/guests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').Guest>) =>
    fetchApi<import('../types').Guest>(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/guests/${id}`, { method: 'DELETE' }),
};

// --- RESERVATIONS API ---
export const reservationsApi = {
  getAll: () => fetchApi<import('../types').Reservation[]>('/reservations'),
  getById: (id: string) => fetchApi<import('../types').Reservation>(`/reservations/${id}`),
  create: (data: Partial<import('../types').Reservation>) =>
    fetchApi<import('../types').Reservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),

  getPayments: (id: string) =>
    fetchApi<import('../types').Payment[]>(`/reservations/${id}/payments`),
  addPayment: (id: string, data: Partial<import('../types').Payment>) =>
    fetchApi<import('../types').Payment>(`/reservations/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (paymentId: string, data: Partial<import('../types').Payment>) =>
    fetchApi<import('../types').Payment>(`/reservations/payments/${paymentId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePayment: (paymentId: string) =>
    fetchApi<{ message: string }>(`/reservations/payments/${paymentId}`, { method: 'DELETE' }),

  update: (id: string, data: Partial<import('../types').Reservation>) =>
    fetchApi<import('../types').Reservation>(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/reservations/${id}`, { method: 'DELETE' }),
  createWithDetails: (data: any) =>
    fetchApi<any>('/reservations/with-details', { method: 'POST', body: JSON.stringify(data) }),
  getTodayActivity: () => fetchApi<{
    checkIns: TodayActivityItem[];
    checkOuts: TodayActivityItem[];
    counts: { checkInCount: number; checkOutCount: number };
  }>('/reservations/today/activity'),
};

// Type for today's activity items
export interface TodayActivityItem {
  id: string;
  orderId: string;
  guestName: string;
  roomNumber: string;
  source: string;
  totalAmount: string;
  paidAmount: number;
  outstanding: number;
  initials: string;
  status: string;
}

// --- EXPENSES API ---
export const expensesApi = {
  getAll: () => fetchApi<import('../types').Expense[]>('/expenses'),
  getById: (id: string) => fetchApi<import('../types').Expense>(`/expenses/${id}`),
  create: (data: Partial<import('../types').Expense>) =>
    fetchApi<import('../types').Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').Expense>) =>
    fetchApi<import('../types').Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' }),
};

// --- INVENTORY API ---
export const inventoryApi = {
  getAll: () => fetchApi<import('../types').InventoryItem[]>('/inventory'),
  getById: (id: string) => fetchApi<import('../types').InventoryItem>(`/inventory/${id}`),
  create: (data: Partial<import('../types').InventoryItem>) =>
    fetchApi<import('../types').InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').InventoryItem>) =>
    fetchApi<import('../types').InventoryItem>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/inventory/${id}`, { method: 'DELETE' }),
};

// --- MAINTENANCE API ---
export const maintenanceApi = {
  getAll: () => fetchApi<import('../types').MaintenanceTicket[]>('/maintenance'),
  getById: (id: string) => fetchApi<import('../types').MaintenanceTicket>(`/maintenance/${id}`),
  create: (data: Partial<import('../types').MaintenanceTicket>) =>
    fetchApi<import('../types').MaintenanceTicket>('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').MaintenanceTicket>) =>
    fetchApi<import('../types').MaintenanceTicket>(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/maintenance/${id}`, { method: 'DELETE' }),
};

// --- SHIFTS API ---
export const shiftsApi = {
  getAll: () => fetchApi<import('../types').Shift[]>('/shifts'),
  getById: (id: string) => fetchApi<import('../types').Shift>(`/shifts/${id}`),
  create: (data: Partial<import('../types').Shift>) =>
    fetchApi<import('../types').Shift>('/shifts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').Shift>) =>
    fetchApi<import('../types').Shift>(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/shifts/${id}`, { method: 'DELETE' }),
};

// --- CLEANING TASKS API ---
export const cleaningTasksApi = {
  getAll: () => fetchApi<import('../types').CleaningTask[]>('/cleaning-tasks'),
  getById: (id: string) => fetchApi<import('../types').CleaningTask>(`/cleaning-tasks/${id}`),
  create: (data: { description: string; roomArea: string; scheduledDate: string; priority?: string; assignedUserIds: string[] }) =>
    fetchApi<import('../types').CleaningTask>('/cleaning-tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('../types').CleaningTask> & { assignedUserIds?: string[] }) =>
    fetchApi<import('../types').CleaningTask>(`/cleaning-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/cleaning-tasks/${id}`, { method: 'DELETE' }),
};

// --- FINANCE API ---
export const financeApi = {
  getDashboard: (month?: number, year?: number) => {
    let url = '/finance/dashboard';
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    return fetchApi<{
        kpi: {
          totalRevenue: number;
          outstanding: number;
          opExpenses: number;
          netProfit: number;
        };
        transactions: any[];
        chartData: any[];
        paymentMethods: any[];
        target: {
            currentRevenue: number;
            monthlyTarget: number;
        };
        filter: {
            month: number;
            year: number;
        }
      }>(url);
  },
  saveTarget: (data: { month: number; year: number; targetAmount: number }) => 
    fetchApi<{ success: boolean }>('/finance/target', { method: 'POST', body: JSON.stringify(data) }),
  getReport: (startDate: string, endDate: string, guesthouse?: number) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (guesthouse !== undefined) params.append('guesthouse', guesthouse.toString());
    return fetchApi<{
      totalIncome: number;
      totalExpense: number;
      netProfit: number;
      incomeDetails: Array<{
        room_id: number;
        order_id: string;
        source: string;
        check_in_date: string;
        check_out_date: string;
        total_amount: number;
      }>;
      expenseDetails: Array<{
        description: string;
        category: string;
        amount: number;
        date_incurred: string;
        notes: string | null;
        guesthouse: number;
      }>;
      filter: {
        startDate: string;
        endDate: string;
        guesthouse: number;
      };
    }>(`/finance/report?${params.toString()}`);
  },
};

// --- BUDGETS API (Operational) ---
export const budgetsApi = {
  getByYear: (year: number) => fetchApi<import('../types').OperationalBudget[]>(`/budgets?year=${year}`),
  bulkUpsert: (budgets: Array<{ year: number; month: number; projectedAmount: number }>) =>
    fetchApi<{ message: string; budgets: import('../types').OperationalBudget[] }>('/budgets', {
      method: 'POST',
      body: JSON.stringify({ budgets }),
    }),
};

// --- MARKETING BUDGETS API ---
export const marketingBudgetsApi = {
  getByYear: (year: number) => fetchApi<Array<{ id: string, year: number, month: number, budgetAmount: string }>>(`/marketing/budgets/${year}`),
  bulkUpsert: (budgets: Array<{ year: number; month: number; amount: number }>) =>
    Promise.all(budgets.map(b => fetchApi('/marketing/budgets', { method: 'POST', body: JSON.stringify(b) })))
};

// --- MARKETING API ---
export const marketingApi = {
    lookupMember: (memberId: string) => fetchApi<{
        fullName: string;
        email: string;
        phone: string;
        origin: string;
        notes?: string;
    }>(`/marketing/lookup-member/${memberId}`),
};
