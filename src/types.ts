export type UserRole = 'aluno' | 'professor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface Material {
  id: string;
  nome: string;
  url: string; // base64
  dataUpload: string;
}

export interface Booking {
  id: string;
  titulo: string;
  description?: string;
  room: string;
  date: string; // ISO format
  startTime: string;
  endTime: string;
  course: string;
  userId: string;
  criadoPor: string;
  materiais: Material[];
  ultimaAtualizacao: string;
}

export interface Notification {
  id: string;
  userId: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied';
}

export interface Team {
  id: string;
  nome: string;
  membros: string[]; // array of emails
  criadoPor: string; // email
  dataCriacao: string;
}

export interface TeamMessage {
  id: string;
  teamId: string;
  remetente: string; // email
  remetenteNome: string;
  mensagem: string;
  data: string;
}

export type ActivityType = 'create' | 'update' | 'delete' | 'upload' | 'login';

export interface TeamView {
  usuario: string; // email
  usuarioNome: string;
  data: string;
}

export interface TeamMaterial {
  id: string;
  teamId: string;
  nome: string;
  tipo: string; // pdf, imagem, doc, etc
  arquivo: string; // base64
  enviadoPor: string; // email
  enviadoPorNome: string;
  dataEnvio: string;
  visualizacoes: TeamView[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  type: ActivityType;
  description: string;
  targetId?: string;
  targetName?: string;
  data: string; // ISO format
}

export interface SystemStats {
  logins: number;
  activeUsers: string[]; // array of userIds
}
