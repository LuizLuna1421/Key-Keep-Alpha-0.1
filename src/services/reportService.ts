import { Booking, ActivityLog, ActivityType, User, Material } from '../types';
import { isWithinInterval, subWeeks, subMonths, parseISO, startOfDay, endOfDay } from 'date-fns';

const LOGS_KEY = 'keykeep_activity_logs';

export const reportService = {
  logActivity: (
    user: User, 
    type: ActivityType, 
    description: string, 
    targetId?: string, 
    targetName?: string
  ) => {
    const logs: ActivityLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      type,
      description,
      targetId,
      targetName,
      data: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep only last 1000 logs for performance
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 1000)));
  },

  getLogs: (): ActivityLog[] => {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  },

  getRoomUsage: (bookings: Booking[], rooms: string[], period: 'week' | 'month' = 'month') => {
    const now = new Date();
    const startDate = period === 'week' ? subWeeks(now, 1) : subMonths(now, 1);
    
    const filteredBookings = bookings.filter(b => 
      isWithinInterval(parseISO(b.date), { start: startDate, end: now })
    );

    return rooms.map(roomName => {
      const roomBookings = filteredBookings.filter(b => b.room === roomName);
      // Simple occupancy calculation: each booking counts as a slot
      // In a real app, we'd calculate hours, but for this demo, count is fine
      return {
        name: roomName,
        count: roomBookings.length,
        percentage: Math.min(100, (roomBookings.length / (period === 'week' ? 35 : 150)) * 100) // Mock capacity
      };
    });
  },

  getTeacherActivity: (bookings: Booking[], logs: ActivityLog[], users: User[]) => {
    return users.filter(u => u.role === 'professor' || u.role === 'admin').map(user => {
      const userBookings = bookings.filter(b => b.userId === user.id);
      const userLogs = logs.filter(l => l.userId === user.id);
      
      const materialsCount = userBookings.reduce((acc, b) => acc + (b.materiais?.length || 0), 0);
      const editsCount = userLogs.filter(l => l.type === 'update').length;

      return {
        name: user.name,
        email: user.email,
        classes: userBookings.length,
        materials: materialsCount,
        edits: editsCount
      };
    });
  },

  getCourseStats: (bookings: Booking[]) => {
    const stats: Record<string, number> = {};
    bookings.forEach(b => {
      stats[b.course] = (stats[b.course] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  },

  getSystemStats: (logs: ActivityLog[]) => {
    const logins = logs.filter(l => l.type === 'login').length;
    const activeUsers = new Set(logs.map(l => l.userId)).size;
    
    return {
      logins,
      activeUsers
    };
  },

  getRecentActivity: (logs: ActivityLog[], limit = 10) => {
    return logs.slice(0, limit);
  }
};
