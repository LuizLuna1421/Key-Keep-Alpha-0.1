import { User } from '../types';

const USERS_KEY = 'digital_concierge_users';
const SESSION_KEY = 'digital_concierge_session';

export const authService = {
  handleSignup: async (userData: Omit<User, 'id'>): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u) => u.email === userData.email)) {
      throw new Error('E-mail já cadastrado.');
    }

    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(2, 11),
    };

    // Special case: if it's the first user or a specific email, we could make it admin
    // But the requirement says Admin cannot be created by interface.
    // So we just save what comes from the form (aluno or professor).

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  handleLogin: async (email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check for hardcoded admin if users list is empty or for testing
    if (email === 'admin@keykeep.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-id',
        name: 'Admin Key-Keep',
        email: 'admin@keykeep.com',
        role: 'admin',
        password: 'admin123'
      };
      // Ensure admin is in users list if not present
      if (!users.find(u => u.email === adminUser.email)) {
        users.push(adminUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      return adminUser;
    }

    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  getUser: (): User | null => {
    return authService.getCurrentUser();
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getUsers: async (): Promise<User[]> => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }
};
