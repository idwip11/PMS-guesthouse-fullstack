// Authentication Service for HomiQ PMS Frontend

// Authentication Service for HomiQ PMS Frontend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

// Login - validates credentials against the API
export async function login(username: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid username or password');
  }

  const data: LoginResponse = await response.json();
  
  // Store user in localStorage
  localStorage.setItem('homiq_user', JSON.stringify(data.user));
  
  return data.user;
}

// Logout - clears the stored session
export function logout(): void {
  localStorage.removeItem('homiq_user');
}

// Get current user from localStorage
export function getCurrentUser(): AuthUser | null {
  const userJson = localStorage.getItem('homiq_user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Update password
export async function updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Password update failed' }));
    throw new Error(error.message || 'Failed to update password');
  }
}
