export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Booking {
  id: string;
  title: string;
  room: string;
  date: string; // ISO format
  time: string;
  course: string;
  userId: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied';
}
