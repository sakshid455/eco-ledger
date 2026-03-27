
import { User, UserRole } from './types';

const MOCK_USERS: Record<string, User> = {
  'landowner@eco.com': { id: 'u1', email: 'landowner@eco.com', role: 'landowner', name: 'John Landowner' },
  'investor@eco.com': { id: 'u2', email: 'investor@eco.com', role: 'investor', name: 'Alice Investor' },
  'industry@eco.com': { id: 'u3', email: 'industry@eco.com', role: 'industry', name: 'Green Steel Corp' },
  'admin@eco.com': { id: 'u4', email: 'admin@eco.com', role: 'admin', name: 'System Admin' },
};

export function getMockUser(email: string): User | null {
  return MOCK_USERS[email] || null;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('eco_user');
  return stored ? JSON.parse(stored) : null;
}

export function loginMock(email: string) {
  const user = getMockUser(email);
  if (user) {
    localStorage.setItem('eco_user', JSON.stringify(user));
    return user;
  }
  return null;
}

export function logoutMock() {
  localStorage.removeItem('eco_user');
}
