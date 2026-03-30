import { Team, TeamMessage, User } from '../types';
import { notificationService } from './notificationService';

const TEAMS_KEY = 'digital_concierge_teams';
const MESSAGES_KEY = 'digital_concierge_team_messages';

export const teamService = {
  createTeam: async (nome: string, membros: string[], user: User): Promise<Team> => {
    if (user.role === 'aluno') {
      throw new Error('Alunos não podem criar equipes.');
    }

    const teams = await teamService.getTeams();
    const newTeam: Team = {
      id: Math.random().toString(36).substring(2, 11),
      nome,
      membros: Array.from(new Set([...membros, user.email])), // Ensure creator is a member
      criadoPor: user.email,
      dataCriacao: new Date().toISOString()
    };

    teams.push(newTeam);
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));

    // Notify new members
    for (const email of membros) {
      if (email !== user.email) {
        const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
        const targetUser = users.find((u: User) => u.email === email);
        if (targetUser) {
          await notificationService.createNotification(targetUser.id, `Você foi adicionado à equipe: ${nome}`);
        }
      }
    }

    return newTeam;
  },

  getTeams: async (): Promise<Team[]> => {
    const data = localStorage.getItem(TEAMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getUserTeams: async (user: User): Promise<Team[]> => {
    const all = await teamService.getTeams();
    if (user.role === 'admin') return all;
    return all.filter(t => t.membros.includes(user.email));
  },

  updateTeamMembers: async (teamId: string, membros: string[], user: User): Promise<Team> => {
    const teams = await teamService.getTeams();
    const index = teams.findIndex(t => t.id === teamId);
    if (index === -1) throw new Error('Equipe não encontrada.');

    const team = teams[index];
    if (user.role !== 'admin' && team.criadoPor !== user.email) {
      throw new Error('Apenas o criador ou admin pode gerenciar membros.');
    }

    const oldMembers = team.membros;
    team.membros = Array.from(new Set([...membros, team.criadoPor])); // Ensure creator stays
    teams[index] = team;
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));

    // Notify newly added members
    const newMembers = team.membros.filter(m => !oldMembers.includes(m));
    for (const email of newMembers) {
      const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
      const targetUser = users.find((u: User) => u.email === email);
      if (targetUser) {
        await notificationService.createNotification(targetUser.id, `Você foi adicionado à equipe: ${team.nome}`);
      }
    }

    return team;
  },

  deleteTeam: async (teamId: string, user: User): Promise<void> => {
    const teams = await teamService.getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error('Equipe não encontrada.');

    if (user.role !== 'admin' && team.criadoPor !== user.email) {
      throw new Error('Permissão negada.');
    }

    const filtered = teams.filter(t => t.id !== teamId);
    localStorage.setItem(TEAMS_KEY, JSON.stringify(filtered));

    // Also delete messages
    const messages = await teamService.getAllMessages();
    const filteredMessages = messages.filter(m => m.teamId !== teamId);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
  },

  sendTeamMessage: async (teamId: string, mensagem: string, user: User): Promise<TeamMessage> => {
    const teams = await teamService.getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error('Equipe não encontrada.');

    if (user.role !== 'admin' && !team.membros.includes(user.email)) {
      throw new Error('Você não faz parte desta equipe.');
    }

    const messages = await teamService.getAllMessages();
    const newMessage: TeamMessage = {
      id: Math.random().toString(36).substring(2, 11),
      teamId,
      remetente: user.email,
      remetenteNome: user.name,
      mensagem,
      data: new Date().toISOString()
    };

    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Notify other members (in a real app, use WebSockets)
    const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
    for (const email of team.membros) {
      if (email !== user.email) {
        const targetUser = users.find((u: User) => u.email === email);
        if (targetUser) {
          await notificationService.createNotification(targetUser.id, `Nova mensagem em ${team.nome} de ${user.name}`);
        }
      }
    }

    return newMessage;
  },

  getTeamMessages: async (teamId: string, user: User): Promise<TeamMessage[]> => {
    const teams = await teamService.getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error('Equipe não encontrada.');

    if (user.role !== 'admin' && !team.membros.includes(user.email)) {
      throw new Error('Acesso negado.');
    }

    const all = await teamService.getAllMessages();
    return all.filter(m => m.teamId === teamId).sort((a, b) => a.data.localeCompare(b.data));
  },

  getAllMessages: async (): Promise<TeamMessage[]> => {
    const data = localStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  }
};
