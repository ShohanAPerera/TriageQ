import { useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

const LS_USERS = 'triageq_auth_users';
const LS_CURRENT_USER = 'triageq_auth_current_user';

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

// Ensure default admin exists
export function seedDefaultAdmin() {
  const users = loadLS<User[]>(LS_USERS, []);
  if (users.length === 0) {
    users.push({
      id: 'admin-1',
      username: 'admin',
      fullName: 'System Administrator',
      role: 'Admin',
      pin: '1234',
      createdAt: new Date().toISOString(),
    });
    saveLS(LS_USERS, users);
  }
}

seedDefaultAdmin();

export function getAllUsers(): User[] {
  return loadLS<User[]>(LS_USERS, []);
}

export function registerUser(username: string, fullName: string, role: UserRole, pin: string): User {
  const users = getAllUsers();
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    fullName,
    role,
    pin,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveLS(LS_USERS, users);
  return newUser;
}

export function loginUser(username: string, pin: string): User {
  const users = getAllUsers();
  const user = users.find(u => u.username === username && u.pin === pin);
  
  if (!user) {
    throw new Error('Invalid username or PIN');
  }

  saveLS(LS_CURRENT_USER, user);
  window.dispatchEvent(new Event('auth-change'));
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(LS_CURRENT_USER);
  window.dispatchEvent(new Event('auth-change'));
}

export function getCurrentUser(): User | null {
  return loadLS<User | null>(LS_CURRENT_USER, null);
}

// React Hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    // Also listen to storage events from other tabs
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return { user, logout: logoutUser };
}
