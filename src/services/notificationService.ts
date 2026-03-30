import { Notification } from '../types';

const NOTIFICATIONS_KEY = 'digital_concierge_notifications';

export const notificationService = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: Notification[] = data ? JSON.parse(data) : [];
    return all.filter(n => n.userId === userId).sort((a, b) => b.data.localeCompare(a.data));
  },

  createNotification: async (userId: string, mensagem: string): Promise<void> => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: Notification[] = data ? JSON.parse(data) : [];
    
    const newNotif: Notification = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      mensagem,
      data: new Date().toISOString(),
      lida: false
    };

    all.push(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  },

  markAsRead: async (id: string): Promise<void> => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: Notification[] = data ? JSON.parse(data) : [];
    const index = all.findIndex(n => n.id === id);
    if (index !== -1) {
      all[index].lida = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    }
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: Notification[] = data ? JSON.parse(data) : [];
    all.forEach(n => {
      if (n.userId === userId) n.lida = true;
    });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  }
};
