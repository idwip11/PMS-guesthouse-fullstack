// Centralized API Service for HomiQ PMS Frontend

const API_BASE_URL = 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
  update: (id: string, data: Partial<import('../types').Reservation>) =>
    fetchApi<import('../types').Reservation>(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ message: string }>(`/reservations/${id}`, { method: 'DELETE' }),
};

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

