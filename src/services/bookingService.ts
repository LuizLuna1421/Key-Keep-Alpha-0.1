import { Booking } from '../types';

const BOOKINGS_KEY = 'digital_concierge_bookings';

export const bookingService = {
  getBookings: async (): Promise<Booking[]> => {
    const bookings = localStorage.getItem(BOOKINGS_KEY);
    return bookings ? JSON.parse(bookings) : [];
  },

  createBooking: async (bookingData: Omit<Booking, 'id'>): Promise<Booking> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');

    // Check for conflicts
    const hasConflict = bookings.some(
      (b) => b.room === bookingData.room && b.date === bookingData.date && b.time === bookingData.time
    );

    if (hasConflict) {
      throw new Error('Já existe um agendamento para esta sala neste horário.');
    }

    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
    };

    bookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return newBooking;
  },

  deleteBooking: async (id: string): Promise<void> => {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const filtered = bookings.filter((b) => b.id !== id);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
  }
};
