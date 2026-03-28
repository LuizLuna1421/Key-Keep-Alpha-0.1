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
      id: Math.random().toString(36).substr(2, 9),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  handleLogin: async (email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  getUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },
};
