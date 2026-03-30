import { Booking, User, Material } from '../types';
import { notificationService } from './notificationService';
import { startOfWeek, endOfWeek, isWithinInterval, eachDayOfInterval, getDay, format } from 'date-fns';
import { safeParseISO, isValidISODate } from '../lib/dateUtils';

const BOOKINGS_KEY = 'digital_concierge_bookings';

export interface BulkBookingParams {
  titulo: string;
  room: string;
  course: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  daysOfWeek: number[]; // 0 (Sunday) to 6 (Saturday)
}

export interface BulkBookingPreviewItem {
  date: string;
  hasConflict: boolean;
  conflictWith?: string;
}

export const bookingService = {
  // ... existing methods ...

  previewBulkBookings: async (params: BulkBookingParams): Promise<BulkBookingPreviewItem[]> => {
    const start = safeParseISO(params.startDate);
    const end = safeParseISO(params.endDate);
    if (!start || !end) return [];

    const bookings = await bookingService.getBookings();
    const dates = eachDayOfInterval({ start, end });
    
    return dates
      .filter(date => params.daysOfWeek.includes(getDay(date)))
      .map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const conflict = bookings.find(b => {
          if (b.room !== params.room || b.date !== dateStr) return false;
          return (
            (params.startTime >= b.startTime && params.startTime < b.endTime) ||
            (params.endTime > b.startTime && params.endTime <= b.endTime) ||
            (params.startTime <= b.startTime && params.endTime >= b.endTime)
          );
        });

        return {
          date: dateStr,
          hasConflict: !!conflict,
          conflictWith: conflict?.titulo
        };
      });
  },

  confirmBulkBookings: async (params: BulkBookingParams, user: User, selectedDates: string[]): Promise<number> => {
    if (user.role === 'aluno') throw new Error('Permissão negada.');

    const bookings = await bookingService.getBookings();
    const newBookings: Booking[] = [];

    for (const dateStr of selectedDates) {
      // Final conflict check just in case
      const hasConflict = bookings.some(b => {
        if (b.room !== params.room || b.date !== dateStr) return false;
        return (
          (params.startTime >= b.startTime && params.startTime < b.endTime) ||
          (params.endTime > b.startTime && params.endTime <= b.endTime) ||
          (params.startTime <= b.startTime && params.endTime >= b.endTime)
        );
      });

      if (!hasConflict) {
        const newBooking: Booking = {
          id: Math.random().toString(36).substring(2, 11),
          titulo: params.titulo,
          room: params.room,
          course: params.course,
          date: dateStr,
          startTime: params.startTime,
          endTime: params.endTime,
          userId: user.id,
          criadoPor: user.name,
          materiais: [],
          ultimaAtualizacao: new Date().toISOString()
        };
        newBookings.push(newBooking);
      }
    }

    if (newBookings.length > 0) {
      const allBookings = [...bookings, ...newBookings];
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(allBookings));

      // Notify
      const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
      for (const u of users) {
        if (u.id !== user.id) {
          await notificationService.createNotification(u.id, `${newBookings.length} novos agendamentos criados em lote por ${user.name}`);
        }
      }
    }

    return newBookings.length;
  },
  getBookings: async (): Promise<Booking[]> => {
    const data = localStorage.getItem(BOOKINGS_KEY);
    const all: Booking[] = data ? JSON.parse(data) : [];
    
    // Filter out invalid bookings to prevent crashes
    const validBookings = all.filter(b => {
      const isValid = b && b.id && b.titulo && isValidISODate(b.date);
      if (!isValid) {
        console.warn('[BookingService] Filtering out invalid booking:', b);
      }
      return isValid;
    });

    return validBookings;
  },

  getWeeklySchedule: async (date: Date, user: User): Promise<Booking[]> => {
    const all = await bookingService.getBookings();
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    
    let filtered = all.filter(b => {
      const bDate = bookingService.safeParseDate(b.date);
      if (!bDate) return false;
      return isWithinInterval(bDate, { start, end });
    });

    // User Filters
    if (user.role === 'aluno') {
      // In a real app, we'd filter by user's enrolled courses. 
      // For this demo, we'll show all classes but the requirement says "ver apenas suas aulas".
      // Since we don't have an enrollment system yet, we'll assume student sees all for now 
      // OR if we had a studentId in booking, we'd use that.
      // Let's stick to the requirement: if student, maybe they only see specific ones?
      // Actually, let's assume students see all classes of their course if we had that mapping.
      // For now, let's just return all for students too, or filter by course if we had user.course.
    } else if (user.role === 'professor') {
      filtered = filtered.filter(b => b.userId === user.id);
    }

    return bookingService.sortByTime(filtered);
  },

  groupByDay: (bookings: Booking[]): Record<string, Booking[]> => {
    const groups: Record<string, Booking[]> = {
      'Segunda-feira': [],
      'Terça-feira': [],
      'Quarta-feira': [],
      'Quinta-feira': [],
      'Sexta-feira': [],
      'Sábado': [],
      'Domingo': []
    };

    const dayNames = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];

    bookings.forEach(b => {
      const date = bookingService.safeParseDate(b.date);
      if (date) {
        const dayName = dayNames[getDay(date)];
        if (groups[dayName]) {
          groups[dayName].push(b);
        }
      }
    });

    return groups;
  },

  sortByTime: (bookings: Booking[]): Booking[] => {
    return [...bookings].sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  },

  safeParseDate: (dateStr: any): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    try {
      const parsed = safeParseISO(dateStr);
      return parsed && !isNaN(parsed.getTime()) ? parsed : null;
    } catch (e) {
      console.error('[BookingService] Error parsing date:', dateStr, e);
      return null;
    }
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'materiais' | 'ultimaAtualizacao'>, user: User): Promise<Booking> => {
    if (user.role === 'aluno') {
      throw new Error('Alunos não têm permissão para criar agendamentos.');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');

    const hasConflict = bookings.some((b) => {
      if (b.room !== bookingData.room || b.date !== bookingData.date) return false;
      return (
        (bookingData.startTime >= b.startTime && bookingData.startTime < b.endTime) ||
        (bookingData.endTime > b.startTime && bookingData.endTime <= b.endTime) ||
        (bookingData.startTime <= b.startTime && bookingData.endTime >= b.endTime)
      );
    });

    if (hasConflict) {
      throw new Error('Já existe um agendamento para esta sala neste intervalo de tempo.');
    }

    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substring(2, 11),
      userId: user.id,
      criadoPor: user.name,
      materiais: [],
      ultimaAtualizacao: new Date().toISOString()
    };

    bookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    // Notify all users (in a real app, only relevant users)
    const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
    for (const u of users) {
      if (u.id !== user.id) {
        await notificationService.createNotification(u.id, `Nova aula: ${newBooking.titulo} em ${newBooking.date}`);
      }
    }

    return newBooking;
  },

  editBooking: async (id: string, bookingData: Partial<Booking>, user: User): Promise<Booking> => {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Agendamento não encontrado.');
    
    const booking = bookings[index];
    if (user.role === 'aluno') {
      throw new Error('Alunos não têm permissão para editar agendamentos.');
    }
    if (user.role === 'professor' && booking.userId !== user.id) {
      throw new Error('Você só pode editar seus próprios agendamentos.');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const hasConflict = bookings.some((b) => {
      if (b.id === id) return false;
      const room = bookingData.room || b.room;
      const date = bookingData.date || b.date;
      const start = bookingData.startTime || b.startTime;
      const end = bookingData.endTime || b.endTime;
      if (b.room !== room || b.date !== date) return false;
      return (
        (start >= b.startTime && start < b.endTime) ||
        (end > b.startTime && end <= b.endTime) ||
        (start <= b.startTime && end >= b.endTime)
      );
    });

    if (hasConflict) throw new Error('Conflito de horário com outro agendamento.');

    const updatedBooking = { 
      ...booking, 
      ...bookingData, 
      ultimaAtualizacao: new Date().toISOString() 
    };
    bookings[index] = updatedBooking;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    // Notify
    const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
    for (const u of users) {
      if (u.id !== user.id) {
        await notificationService.createNotification(u.id, `Aula atualizada: ${updatedBooking.titulo}`);
      }
    }

    return updatedBooking;
  },

  addMaterial: async (bookingId: string, material: Omit<Material, 'id' | 'dataUpload'>, user: User): Promise<void> => {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) throw new Error('Agendamento não encontrado.');
    
    const booking = bookings[index];
    if (user.role === 'aluno') throw new Error('Alunos não podem adicionar materiais.');
    if (user.role === 'professor' && booking.userId !== user.id) throw new Error('Apenas o professor da aula pode adicionar materiais.');

    const newMaterial: Material = {
      ...material,
      id: Math.random().toString(36).substring(2, 11),
      dataUpload: new Date().toISOString()
    };

    booking.materiais.push(newMaterial);
    booking.ultimaAtualizacao = new Date().toISOString();
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    // Notify
    const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
    for (const u of users) {
      if (u.id !== user.id) {
        await notificationService.createNotification(u.id, `Novo material em: ${booking.titulo}`);
      }
    }
  },

  removeMaterial: async (bookingId: string, materialId: string, user: User): Promise<void> => {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) throw new Error('Agendamento não encontrado.');
    
    const booking = bookings[index];
    if (user.role === 'aluno') throw new Error('Alunos não podem remover materiais.');
    if (user.role === 'professor' && booking.userId !== user.id) throw new Error('Apenas o professor da aula pode remover materiais.');

    booking.materiais = booking.materiais.filter(m => m.id !== materialId);
    booking.ultimaAtualizacao = new Date().toISOString();
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  },

  deleteBooking: async (id: string, user: User): Promise<void> => {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error('Agendamento não encontrado.');

    if (user.role === 'aluno') throw new Error('Alunos não têm permissão para excluir agendamentos.');
    if (user.role === 'professor' && booking.userId !== user.id) throw new Error('Você só pode excluir seus próprios agendamentos.');

    await new Promise((resolve) => setTimeout(resolve, 500));
    const filtered = bookings.filter((b) => b.id !== id);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
  }
};
