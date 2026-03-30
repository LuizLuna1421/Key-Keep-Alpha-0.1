import { TeamMaterial, TeamView, User, Team } from '../types';
import { notificationService } from './notificationService';
import { reportService } from './reportService';

const MATERIALS_KEY = 'digital_concierge_team_materials';

export const teamMaterialService = {
  uploadMaterial: async (
    teamId: string, 
    nome: string, 
    tipo: string, 
    arquivo: string, 
    user: User,
    team: Team
  ): Promise<TeamMaterial> => {
    if (user.role === 'aluno') {
      throw new Error('Alunos não têm permissão para enviar materiais.');
    }

    const materials = await teamMaterialService.getAllMaterials();
    
    const newMaterial: TeamMaterial = {
      id: Math.random().toString(36).substring(2, 11),
      teamId,
      nome,
      tipo,
      arquivo,
      enviadoPor: user.email,
      enviadoPorNome: user.name,
      dataEnvio: new Date().toISOString(),
      visualizacoes: []
    };

    materials.push(newMaterial);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));

    // Log activity
    reportService.logActivity(
      user,
      'upload',
      `Enviou material "${nome}" para a equipe "${team.nome}"`,
      newMaterial.id,
      nome
    );

    // Notify team members
    const users = JSON.parse(localStorage.getItem('digital_concierge_users') || '[]');
    for (const memberEmail of team.membros) {
      const member = users.find((u: User) => u.email === memberEmail);
      if (member && member.id !== user.id) {
        await notificationService.createNotification(
          member.id, 
          `Novo material disponível na equipe ${team.nome}: ${nome}`
        );
      }
    }

    return newMaterial;
  },

  getMaterialsByTeam: async (teamId: string): Promise<TeamMaterial[]> => {
    const all = await teamMaterialService.getAllMaterials();
    return all.filter(m => m.teamId === teamId);
  },

  getAllMaterials: async (): Promise<TeamMaterial[]> => {
    const data = localStorage.getItem(MATERIALS_KEY);
    return data ? JSON.parse(data) : [];
  },

  registerView: async (materialId: string, user: User): Promise<void> => {
    const all = await teamMaterialService.getAllMaterials();
    const index = all.findIndex(m => m.id === materialId);
    
    if (index === -1) return;

    const material = all[index];
    
    // Check if user already viewed
    const alreadyViewed = material.visualizacoes.some(v => v.usuario === user.email);
    
    if (!alreadyViewed) {
      const newView: TeamView = {
        usuario: user.email,
        usuarioNome: user.name,
        data: new Date().toISOString()
      };
      
      material.visualizacoes.push(newView);
      localStorage.setItem(MATERIALS_KEY, JSON.stringify(all));
    }
  },

  deleteMaterial: async (materialId: string, user: User): Promise<void> => {
    const all = await teamMaterialService.getAllMaterials();
    const material = all.find(m => m.id === materialId);
    
    if (!material) throw new Error('Material não encontrado.');
    
    if (user.role === 'aluno') {
      throw new Error('Alunos não podem remover materiais.');
    }
    
    if (user.role === 'professor' && material.enviadoPor !== user.email) {
      throw new Error('Você só pode remover materiais enviados por você.');
    }

    const filtered = all.filter(m => m.id !== materialId);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(filtered));

    // Log activity
    reportService.logActivity(
      user,
      'delete',
      `Removeu material "${material.nome}"`,
      material.id,
      material.nome
    );
  }
};
