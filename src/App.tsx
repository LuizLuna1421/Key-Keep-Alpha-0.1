import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  DoorOpen, 
  Users as UsersIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User as UserIcon,
  X,
  Menu,
  Edit,
  FileText,
  Trash2,
  Download,
  CheckCircle,
  Clock3,
  Upload,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  addWeeks,
  subWeeks
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { authService } from './services/authService';
import { bookingService, BulkBookingParams, BulkBookingPreviewItem } from './services/bookingService';
import { notificationService } from './services/notificationService';
import { teamService } from './services/teamService';
import { reportService } from './services/reportService';
import { teamMaterialService } from './services/teamMaterialService';
import { User, Booking, Notification, Material, Team, TeamMessage, ActivityLog, TeamMaterial } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Send,
  UserPlus,
  MessageSquare,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import { cn } from './lib/utils';
import { safeParseISO } from './lib/dateUtils';

// --- Components ---

const LOGO_URL = "/input_file_0.png";

const Logo = ({ className }: { className?: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={cn("bg-primary rounded-lg flex items-center justify-center text-white", className)}>
        <DoorOpen size={24} />
      </div>
    );
  }

  return (
    <img 
      src={LOGO_URL} 
      alt="Key-Keep Logo" 
      className={className} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
};

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-brand-dark shadow-md',
      secondary: 'bg-secondary text-white hover:bg-primary shadow-sm',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-3 text-base md:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95 min-h-[44px]',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'flex h-12 md:h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base md:text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all min-h-[44px]',
            error ? 'border-red-500 focus:ring-red-500' : 'focus:border-secondary',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

const LoginPage = ({ onLoginSuccess, onGoToSignup }: { onLoginSuccess: (user: User) => void; onGoToSignup: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    if (!email.endsWith('@edu.fasup.com')) {
      setError('Use seu e-mail acadêmico (@edu.fasup.com).');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.handleLogin(email, password);
      reportService.logActivity(user, 'login', 'Usuário realizou login no sistema');
      toast.success('Login realizado com sucesso!');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-gray-100"
      >
        <div className="text-center space-y-4">
          <Logo className="h-20 md:h-24 mx-auto" />
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Login</h1>
            <p className="text-gray-500 text-sm">Acesse sua conta Key-Keep</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="E-mail acadêmico"
            type="email"
            placeholder="exemplo@edu.fasup.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && email && !email.endsWith('@edu.fasup.com') ? 'E-mail inválido' : ''}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && !email.endsWith('@edu.fasup.com') && <p className="text-sm text-red-500 text-center">{error}</p>}
          
          <Button type="submit" className="w-full h-12 md:h-11" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center">
          <button 
            onClick={onGoToSignup}
            className="text-sm text-secondary hover:text-primary font-medium transition-colors py-2"
          >
            Não tem conta? Criar conta
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SignupPage = ({ onSignupSuccess, onGoToLogin }: { onSignupSuccess: (user: User) => void; onGoToLogin: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'aluno' | 'professor'>('aluno');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if (!email.endsWith('@edu.fasup.com')) {
      toast.error('Use seu e-mail acadêmico (@edu.fasup.com).');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.handleSignup({ name, email, password, role });
      reportService.logActivity(user, 'login', 'Novo usuário cadastrado e logado');
      toast.success('Conta criada com sucesso!');
      onSignupSuccess(user);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 border border-gray-100"
      >
        <div className="text-center space-y-4">
          <Logo className="h-16 md:h-20 mx-auto" />
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Criar Conta</h1>
            <p className="text-gray-500 text-sm">Cadastre-se no Key-Keep</p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="E-mail acadêmico"
            type="email"
            placeholder="exemplo@edu.fasup.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <div className="space-y-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 ml-1">Tipo de Usuário</label>
            <select 
              className="flex h-12 md:h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all min-h-[44px]"
              value={role}
              onChange={(e) => setRole(e.target.value as 'aluno' | 'professor')}
            >
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          <Button type="submit" className="w-full h-12 md:h-11" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <div className="text-center">
          <button 
            onClick={onGoToLogin}
            className="text-sm text-secondary hover:text-primary font-medium transition-colors py-2"
          >
            Já tem conta? Entrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ReportsView = ({ bookings, users, logs, rooms }: { bookings: Booking[], users: User[], logs: ActivityLog[], rooms: string[] }) => {
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [roomFilter, setRoomFilter] = useState('Todas');
  const [courseFilter, setCourseFilter] = useState('Todos');

  const filteredBookings = bookings.filter(b => {
    if (roomFilter !== 'Todas' && b.room !== roomFilter) return false;
    if (courseFilter !== 'Todos' && b.course !== courseFilter) return false;
    return true;
  });

  const roomUsage = reportService.getRoomUsage(filteredBookings, rooms, period);
  const teacherActivity = reportService.getTeacherActivity(filteredBookings, logs, users);
  const courseStats = reportService.getCourseStats(filteredBookings);
  const systemStats = reportService.getSystemStats(logs);
  const recentActivity = reportService.getRecentActivity(logs);

  const COLORS = ['#F27D26', '#141414', '#5A5A40', '#8E9299', '#FF4444', '#00FF00'];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-gray-50/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Relatórios e Análises</h2>
          <p className="text-sm text-gray-500">Acompanhe o desempenho e uso do sistema</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="text-xs border-gray-200 rounded-lg bg-white px-3 py-2 focus:ring-secondary"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
          </select>
          <select 
            className="text-xs border-gray-200 rounded-lg bg-white px-3 py-2 focus:ring-secondary"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="Todas">Todas as Salas</option>
            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select 
            className="text-xs border-gray-200 rounded-lg bg-white px-3 py-2 focus:ring-secondary"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="Todos">Todos os Cursos</option>
            {['ADS', 'Direito', 'Enfermagem', 'Psicologia', 'Administração'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total de Aulas</p>
          <h3 className="text-3xl font-bold text-primary">{filteredBookings.length}</h3>
          <p className="text-[10px] text-green-600 font-medium mt-1">No período selecionado</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Usuários Ativos</p>
          <h3 className="text-3xl font-bold text-primary">{systemStats.activeUsers}</h3>
          <p className="text-[10px] text-secondary font-medium mt-1">Acessaram recentemente</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Logins Realizados</p>
          <h3 className="text-3xl font-bold text-primary">{systemStats.logins}</h3>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Total histórico</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Média de Ocupação</p>
          <h3 className="text-3xl font-bold text-primary">
            {Math.round(roomUsage.reduce((acc, r) => acc + r.percentage, 0) / (roomUsage.length || 1))}%
          </h3>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Capacidade das salas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6">Ocupação por Sala (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="percentage" fill="#F27D26" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6">Aulas por Curso</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Atividade dos Professores</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase">Professor</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase text-center">Aulas</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase text-center">Materiais</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase text-center">Edições</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase text-right">Engajamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teacherActivity.map((teacher, idx) => (
                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{teacher.name}</p>
                        <p className="text-[10px] text-gray-400">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center text-sm font-medium text-gray-700">{teacher.classes}</td>
                  <td className="py-4 text-center text-sm font-medium text-gray-700">{teacher.materials}</td>
                  <td className="py-4 text-center text-sm font-medium text-gray-700">{teacher.edits}</td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
                      <CheckCircle size={10} />
                      {Math.round((teacher.classes + teacher.materials + teacher.edits) / 3)} pts
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Log de Atividades Recentes</h3>
        <div className="space-y-4">
          {recentActivity.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                log.type === 'create' ? "bg-green-100 text-green-600" :
                log.type === 'update' ? "bg-blue-100 text-blue-600" :
                log.type === 'delete' ? "bg-red-100 text-red-600" :
                log.type === 'upload' ? "bg-purple-100 text-purple-600" :
                "bg-gray-100 text-gray-600"
              )}>
                {log.type === 'create' ? <Plus size={18} /> :
                 log.type === 'update' ? <Edit size={18} /> :
                 log.type === 'delete' ? <Trash2 size={18} /> :
                 log.type === 'upload' ? <Upload size={18} /> :
                 <LogOut size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{log.userName}</p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {format(parseISO(log.data), "d 'de' MMM, HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{log.description}</p>
                {log.targetName && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                    {log.targetName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeeklyScheduleView = ({ bookings, user }: { bookings: Booking[], user: User }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeekly = async () => {
    setLoading(true);
    const data = await bookingService.getWeeklySchedule(currentWeek, user);
    setWeeklyData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeekly();
  }, [currentWeek, user]);

  const grouped = bookingService.groupByDay(weeklyData);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const days = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gray-50/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Cronograma Semanal</h2>
          <p className="text-sm text-gray-500">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
            className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentWeek(new Date())}
            className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button 
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7 gap-4">
          {days.map((day) => {
            const dayBookings = grouped[day] || [];
            const isToday = format(new Date(), 'EEEE', { locale: ptBR }).toLowerCase() === day.toLowerCase().replace('-feira', '');
            // Simple check for today - more robust:
            const dayIndex = days.indexOf(day);
            const actualDate = addDays(weekStart, dayIndex);
            const isActuallyToday = isSameDay(actualDate, new Date());

            return (
              <div key={day} className={cn(
                "flex flex-col gap-3 min-w-0",
                isActuallyToday && "bg-primary/5 rounded-2xl p-2 -m-2 border border-primary/10"
              )}>
                <div className="flex items-center justify-between px-2">
                  <h3 className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    isActuallyToday ? "text-primary" : "text-gray-400"
                  )}>
                    {day.split('-')[0]}
                    {isActuallyToday && <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">Hoje</span>}
                  </h3>
                  <span className="text-[10px] font-medium text-gray-400">
                    {format(actualDate, 'dd/MM')}
                  </span>
                </div>

                <div className="space-y-3">
                  {dayBookings.length > 0 ? (
                    dayBookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{booking.titulo}</h4>
                            <span className="text-[9px] font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase">
                              {booking.course}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock size={12} className="text-secondary" />
                              <span className="font-semibold text-gray-700">{booking.startTime} - {booking.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin size={12} className="text-secondary" />
                              <span>{booking.room}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <UserIcon size={12} className="text-secondary" />
                              <span className="truncate">{booking.criadoPor}</span>
                            </div>
                          </div>

                          {booking.materiais && booking.materiais.length > 0 && (
                            <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                                <FileText size={12} />
                                {booking.materiais.length} {booking.materiais.length === 1 ? 'Material' : 'Materiais'}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 flex items-center justify-between text-[9px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock3 size={10} />
                              {format(parseISO(booking.ultimaAtualizacao), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                      <p className="text-[10px] text-gray-300 font-medium italic">Sem aulas</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWeeklyView, setShowWeeklyView] = useState(false);
  const [weeklyBookings, setWeeklyBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'equipes' | 'relatorios' | 'cronograma'>('dashboard');

  // Teams State
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [teamMaterials, setTeamMaterials] = useState<TeamMaterial[]>([]);
  const [teamTab, setTeamTab] = useState<'chat' | 'materiais'>('chat');
  const [viewersMaterial, setViewersMaterial] = useState<TeamMaterial | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Bulk Scheduling State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkParams, setBulkParams] = useState<BulkBookingParams>({
    titulo: '',
    room: 'Sala 01',
    course: 'ADS',
    startTime: '08:00',
    endTime: '10:00',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    daysOfWeek: [1, 2, 3, 4, 5] // Mon-Fri
  });
  const [bulkPreview, setBulkPreview] = useState<BulkBookingPreviewItem[]>([]);
  const [isBulkPreviewing, setIsBulkPreviewing] = useState(false);
  
  // Centralized State Refresh (updateUI equivalent)
  const updateUI = async () => {
    setLoading(true);
    const data = await bookingService.getBookings();
    setBookings(data);
    
    const weekly = await bookingService.getWeeklySchedule(selectedDate, user);
    setWeeklyBookings(weekly);

    const notifs = await notificationService.getNotifications(user.id);
    setNotifications(notifs);

    const userTeams = await teamService.getUserTeams(user);
    setTeams(userTeams);

    const allUsers = await authService.getUsers();
    setUsers(allUsers);

    const logs = reportService.getLogs();
    setActivityLogs(logs);
    
    if (selectedTeam) {
      const messages = await teamService.getTeamMessages(selectedTeam.id, user);
      setTeamMessages(messages);
      const materials = await teamMaterialService.getMaterialsByTeam(selectedTeam.id);
      setTeamMaterials(materials);
    }
    
    setLoading(false);
  };

  const refreshData = updateUI;

  // New Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('Todas');
  const [sortBy, setSortBy] = useState<'time' | 'title' | 'room'>('time');

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    titulo: '',
    room: 'Sala 01',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '10:00',
    course: 'ADS'
  });

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (newBooking.startTime >= newBooking.endTime) {
        throw new Error('O horário de início deve ser anterior ao horário de fim.');
      }
      
      if (isEditing && editingId) {
        const updated = await bookingService.editBooking(editingId, newBooking, user);
        reportService.logActivity(user, 'update', `Editou o agendamento: ${newBooking.titulo}`, editingId, newBooking.titulo);
        toast.success('Agendamento atualizado!');
      } else {
        const created = await bookingService.createBooking(newBooking, user);
        reportService.logActivity(user, 'create', `Criou um novo agendamento: ${newBooking.titulo}`, created.id, newBooking.titulo);
        toast.success('Reserva confirmada!');
      }
      
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingId(null);
      updateUI();
      setNewBooking({
        titulo: '',
        room: 'Sala 01',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '08:00',
        endTime: '10:00',
        course: 'ADS'
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkPreview = async () => {
    if (!bulkParams.titulo || !bulkParams.room || !bulkParams.startDate || !bulkParams.endDate) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    if (bulkParams.startTime >= bulkParams.endTime) {
      toast.error('O horário de início deve ser anterior ao horário de fim.');
      return;
    }
    if (bulkParams.daysOfWeek.length === 0) {
      toast.error('Selecione pelo menos um dia da semana.');
      return;
    }

    setProcessing(true);
    try {
      const preview = await bookingService.previewBulkBookings(bulkParams);
      setBulkPreview(preview);
      setIsBulkPreviewing(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar preview.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkConfirm = async () => {
    const selectedDates = bulkPreview.filter(p => !p.hasConflict).map(p => p.date);
    if (selectedDates.length === 0) {
      toast.error('Nenhuma data válida selecionada (todas têm conflito).');
      return;
    }

    setProcessing(true);
    try {
      const createdCount = await bookingService.confirmBulkBookings(bulkParams, user, selectedDates);
      reportService.logActivity(user, 'create', `Criou ${createdCount} agendamentos em lote: ${bulkParams.titulo}`, undefined, bulkParams.titulo);
      toast.success(`${createdCount} agendamentos criados com sucesso!`);
      setIsBulkModalOpen(false);
      setIsBulkPreviewing(false);
      setBulkPreview([]);
      updateUI();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar agendamentos em lote.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setProcessing(true);
    try {
      await bookingService.deleteBooking(bookingToDelete, user);
      reportService.logActivity(user, 'delete', `Removeu um agendamento`, bookingToDelete);
      toast.success('Agendamento removido.');
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
      updateUI();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao deletar agendamento.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    updateUI();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead(user.id);
    updateUI();
  };

  const handleUploadMaterial = async (bookingId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        await bookingService.addMaterial(bookingId, {
          nome: file.name,
          url: base64
        }, user);
        reportService.logActivity(user, 'upload', `Enviou o material: ${file.name}`, bookingId, file.name);
        toast.success('Material adicionado!');
        updateUI();
      } catch (err: any) {
        toast.error(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMaterial = async (bookingId: string, materialId: string) => {
    try {
      await bookingService.removeMaterial(bookingId, materialId, user);
      reportService.logActivity(user, 'delete', `Removeu um material`, materialId);
      toast.success('Material removido.');
      updateUI();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    setProcessing(true);
    try {
      const members = newTeamMembers.split(',').map(m => m.trim()).filter(m => m !== '');
      await teamService.createTeam(newTeamName, members, user);
      toast.success('Equipe criada com sucesso!');
      setIsTeamModalOpen(false);
      setNewTeamName('');
      setNewTeamMembers('');
      updateUI();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !newMessage.trim()) return;
    try {
      await teamService.sendTeamMessage(selectedTeam.id, newMessage, user);
      setNewMessage('');
      updateUI();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTeam) return;

    // Validate size (max 5MB for base64 demo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Limite de 5MB.');
      return;
    }

    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await teamMaterialService.uploadMaterial(
          selectedTeam.id,
          file.name,
          file.type,
          base64,
          user,
          selectedTeam
        );
        toast.success('Material enviado com sucesso!');
        updateUI();
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar material');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este material?')) return;

    try {
      await teamMaterialService.deleteMaterial(materialId, user);
      toast.success('Material removido');
      updateUI();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover material');
    }
  };

  const handleViewMaterial = async (material: TeamMaterial) => {
    try {
      await teamMaterialService.registerView(material.id, user);
      
      // Open in new tab (base64)
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${material.arquivo}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
      
      updateUI();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao visualizar material');
    }
  };

  const handleUpdateMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setProcessing(true);
    try {
      const members = newTeamMembers.split(',').map(m => m.trim()).filter(m => m !== '');
      await teamService.updateTeamMembers(selectedTeam.id, members, user);
      toast.success('Membros atualizados!');
      setIsManageMembersOpen(false);
      updateUI();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta equipe?')) return;
    try {
      await teamService.deleteTeam(teamId, user);
      toast.success('Equipe excluída.');
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
      updateUI();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Base bookings for the selected day (used for Room Status)
  const dailyBookings = bookings.filter(b => {
    const bDate = safeParseISO(b.date);
    return bDate && isSameDay(bDate, selectedDate);
  });

  // Filtered and Sorted bookings for the Agenda List
  const displayBookings = dailyBookings.filter(b => {
    const matchesRoom = roomFilter === 'Todas' || b.room === roomFilter;
    const matchesSearch = 
      (b.titulo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.room || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.course || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRoom && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'time') return (a.startTime || '').localeCompare(b.startTime || '');
    if (sortBy === 'title') return (a.titulo || '').localeCompare(b.titulo || '');
    if (sortBy === 'room') return (a.room || '').localeCompare(b.room || '');
    return 0;
  });

  const rooms = [
    { id: 'Sala 01', capacity: 30 },
    { id: 'Sala 02', capacity: 20 },
    { id: 'Auditório', capacity: 100 },
    { id: 'Laboratório A', capacity: 25 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-primary">Key-Keep</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-primary lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'equipes', icon: UsersIcon, label: 'Equipes' },
            { id: 'relatorios', icon: BarChart3, label: 'Relatórios' },
            { id: 'cronograma', icon: CalendarIcon, label: 'Cronograma' },
            { id: 'salas', icon: DoorOpen, label: 'Salas' },
            { id: 'configuracoes', icon: Settings, label: 'Configurações' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'dashboard' || item.id === 'equipes' || item.id === 'relatorios' || item.id === 'cronograma') {
                  setActiveTab(item.id as any);
                } else {
                  toast.info('Funcionalidade em desenvolvimento');
                }
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg text-base md:text-sm font-medium transition-colors min-h-[44px]",
                activeTab === item.id ? "bg-primary/5 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg text-base md:text-sm font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-primary hidden lg:block">Key-Keep</h2>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar salas, agendamentos..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-primary relative"
              >
                <Bell size={20} />
                {notifications.some(n => !n.lida) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h4 className="font-bold text-sm text-primary">Notificações</h4>
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] font-bold text-secondary hover:underline uppercase tracking-wider"
                        >
                          Ler todas
                        </button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              className={cn(
                                "p-4 border-b border-gray-50 last:border-0 transition-colors cursor-pointer hover:bg-gray-50",
                                !n.lida && "bg-secondary/5"
                              )}
                              onClick={() => handleMarkAsRead(n.id)}
                            >
                              <p className={cn("text-xs", !n.lida ? "text-gray-900 font-medium" : "text-gray-500")}>
                                {n.mensagem}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-gray-400">
                                  {(() => {
                                    const d = safeParseISO(n.data);
                                    return d ? format(d, "d 'de' MMM, HH:mm", { locale: ptBR }) : 'Data inválida';
                                  })()}
                                </span>
                                {!n.lida && <div className="w-1.5 h-1.5 bg-secondary rounded-full" />}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="mx-auto text-gray-200 mb-2" size={24} />
                            <p className="text-xs text-gray-400">Nenhuma notificação</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                {(user.name || 'U').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {activeTab === 'dashboard' ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bem-vindo ao Key-Keep, {(user.name || 'Usuário').split(' ')[0]}!</h1>
                  <p className="text-sm text-gray-500">Gestão inteligente de espaços acadêmicos.</p>
                </div>
                {(user.role === 'professor' || user.role === 'admin') && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditingId(null);
                        setNewBooking({
                          titulo: '',
                          room: 'Sala 01',
                          date: format(selectedDate, 'yyyy-MM-dd'),
                          startTime: '08:00',
                          endTime: '10:00',
                          course: 'ADS'
                        });
                        setIsModalOpen(true);
                      }} 
                      className="gap-2 w-full sm:w-auto h-12 md:h-11"
                    >
                      <Plus size={18} />
                      Novo Agendamento
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => setIsBulkModalOpen(true)} 
                      className="gap-2 w-full sm:w-auto h-12 md:h-11"
                    >
                      <CalendarIcon size={18} />
                      Agendamento em Lote
                    </Button>
                  </div>
                )}
              </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cronograma Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 space-y-6 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-primary text-sm md:text-base">Cronograma de Reservas</h3>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setShowWeeklyView(false)}
                      className={cn(
                        "px-3 py-1 text-[10px] md:text-xs font-bold rounded-md transition-all",
                        !showWeeklyView ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-primary"
                      )}
                    >
                      Mensal
                    </button>
                    <button 
                      onClick={() => setShowWeeklyView(true)}
                      className={cn(
                        "px-3 py-1 text-[10px] md:text-xs font-bold rounded-md transition-all",
                        showWeeklyView ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-primary"
                      )}
                    >
                      Semanal
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-medium text-gray-600 mr-1 md:mr-2 whitespace-nowrap">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-secondary"><ChevronLeft size={18} /></button>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-secondary"><ChevronRight size={18} /></button>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                {showWeeklyView ? (
                  <div className="min-w-[800px] grid grid-cols-7 gap-4">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dayName, idx) => {
                      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
                      const dayDate = addDays(weekStart, idx);
                      const dayBookings = weeklyBookings.filter(b => {
                        const bDate = safeParseISO(b.date);
                        return bDate && isSameDay(bDate, dayDate);
                      });
                      const isToday = isSameDay(dayDate, new Date());

                      return (
                        <div key={dayName} className="space-y-3">
                          <div className={cn(
                            "text-center p-2 rounded-lg border",
                            isToday ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-100"
                          )}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{dayName}</p>
                            <p className={cn("text-sm font-bold", isToday ? "text-primary" : "text-gray-700")}>
                              {format(dayDate, 'd')}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {dayBookings.length > 0 ? (
                              dayBookings.map(b => (
                                <div 
                                  key={b.id} 
                                  className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-secondary/30 transition-all cursor-pointer group"
                                  onClick={() => {
                                    const d = safeParseISO(b.date);
                                    if (d) setSelectedDate(d);
                                  }}
                                >
                                  <p className="text-[10px] font-bold text-primary">{b.startTime}</p>
                                  <p className="text-[11px] font-bold text-gray-900 truncate mt-0.5">{b.titulo}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <MapPin size={8} className="text-secondary" />
                                    <span className="text-[9px] text-gray-500">{b.room}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
                                <p className="text-[10px] text-gray-400">Sem aulas</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="min-w-[600px] lg:min-w-0 grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div key={day} className="bg-gray-50 py-2 text-center text-[10px] md:text-xs font-bold text-gray-400 uppercase">
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((day, idx) => {
                      const dayBookings = bookings.filter(b => {
                        const bDate = safeParseISO(b.date);
                        return bDate && isSameDay(bDate, day);
                      });
                      const isSelected = isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "bg-white min-h-[70px] md:min-h-[80px] p-1 md:p-2 transition-colors hover:bg-gray-50 cursor-pointer relative border-2",
                            !isSameMonth(day, monthStart) ? "bg-gray-50 text-gray-300" : "text-gray-900",
                            isSelected ? "border-secondary ring-1 ring-secondary/20 z-10" : "border-transparent"
                          )}
                        >
                          <span className={cn(
                            "text-xs md:text-sm font-medium w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full",
                            isToday && !isSelected && "bg-primary/10 text-primary",
                            isSelected && "bg-secondary text-white"
                          )}>
                            {format(day, 'd')}
                          </span>
                          <div className="mt-1 space-y-1">
                            {dayBookings.slice(0, 2).map(b => (
                              <div key={b.id} className="text-[9px] md:text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate font-medium">
                                {b.startTime} - {b.room}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <div className="text-[9px] md:text-[10px] text-gray-400 pl-1">
                                +{dayBookings.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Agenda Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-primary text-sm md:text-base">Agenda do Dia</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filtrar Sala</label>
                    <select 
                      className="w-full h-9 md:h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs focus:ring-2 focus:ring-secondary"
                      value={roomFilter}
                      onChange={(e) => setRoomFilter(e.target.value)}
                    >
                      <option value="Todas">Todas</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ordenar por</label>
                    <select 
                      className="w-full h-9 md:h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs focus:ring-2 focus:ring-secondary"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="time">Horário</option>
                      <option value="title">Título</option>
                      <option value="room">Sala</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {/* renderBookings logic */}
                {displayBookings.length > 0 ? (
                  displayBookings.map(booking => (
                    <div key={booking.id} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white border border-gray-100 hover:border-secondary/30 transition-all shadow-sm group">
                      <div className="flex flex-col items-center justify-center min-w-[70px] md:min-w-[80px] border-r border-gray-100 pr-3 md:pr-4">
                        <span className="text-xs md:text-sm font-bold text-primary">{booking.startTime}</span>
                        <div className="h-4 w-[1px] bg-gray-200 my-1" />
                        <span className="text-xs md:text-sm font-bold text-gray-400">{booking.endTime}</span>
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm md:text-base text-gray-900 truncate">{booking.titulo}</h4>
                          <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[9px] md:text-[10px] font-bold uppercase tracking-tight">
                            {booking.course}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] md:text-xs text-gray-500">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <MapPin size={10} className="text-secondary" /> {booking.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon size={10} className="text-secondary" /> 
                            <span className="font-medium">Prof:</span> {booking.criadoPor}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-gray-400">
                            <Clock3 size={10} />
                            Atualizado: {(() => {
                              const d = safeParseISO(booking.ultimaAtualizacao);
                              return d ? format(d, "HH:mm") : '--:--';
                            })()}
                          </span>
                        </div>

                        {/* Materials Section */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Materiais</p>
                            {(user.role === 'admin' || (user.role === 'professor' && booking.userId === user.id)) && (
                              <label className="cursor-pointer text-secondary hover:text-primary transition-colors flex items-center gap-1">
                                <Upload size={12} />
                                <span className="text-[10px] font-bold">Anexar</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => handleUploadMaterial(booking.id, e)}
                                />
                              </label>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {booking.materiais && booking.materiais.length > 0 ? (
                              booking.materiais.map(m => (
                                <div key={m.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md group/material">
                                  <FileText size={12} className="text-secondary" />
                                  <span className="text-[10px] text-gray-600 truncate max-w-[100px]">{m.nome}</span>
                                  <div className="flex items-center gap-1">
                                    <a 
                                      href={m.url} 
                                      download={m.nome}
                                      className="p-1 text-gray-400 hover:text-secondary transition-colors"
                                    >
                                      <Download size={12} />
                                    </a>
                                    {(user.role === 'admin' || (user.role === 'professor' && booking.userId === user.id)) && (
                                      <button 
                                        onClick={() => handleRemoveMaterial(booking.id, m.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-gray-400 italic">Nenhum material anexado.</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(user.role === 'admin' || (user.role === 'professor' && booking.userId === user.id)) && (
                          <>
                            <button 
                              onClick={() => {
                                setIsEditing(true);
                                setEditingId(booking.id);
                                setNewBooking({
                                  titulo: booking.titulo,
                                  room: booking.room,
                                  date: booking.date,
                                  startTime: booking.startTime,
                                  endTime: booking.endTime,
                                  course: booking.course
                                });
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                              title="Editar agendamento"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setBookingToDelete(booking.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Excluir agendamento"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-8 space-y-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <CalendarIcon size={20} />
                    </div>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {isSameDay(selectedDate, new Date()) ? "Nenhum agendamento hoje." : "Nenhum agendamento para este dia."}
                    </p>
                  </div>
                )}
              </div>
              <Button variant="secondary" className="w-full mt-6 h-10 text-xs md:text-sm">Ver Agenda Completa</Button>
            </div>
          </div>

          {/* Room Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {rooms.map(room => {
              const now = new Date();
              const currentTime = format(now, 'HH:mm');
              const isToday = isSameDay(selectedDate, now);
              
              // All bookings for this room on the selected day
              const roomBookings = dailyBookings.filter(b => b.room === room.id);
              const totalClasses = roomBookings.length;
              const uniqueCourses = Array.from(new Set(roomBookings.map(b => b.course)));
              
              // Find if there's a booking happening RIGHT NOW in this room (only if selected date is today)
              const currentBooking = isToday ? roomBookings.find(b => 
                currentTime >= b.startTime && 
                currentTime < b.endTime
              ) : null;

              // Find the next booking for this room (if today, relative to now; if future, the first one)
              const nextBooking = isToday 
                ? roomBookings.filter(b => b.startTime > currentTime).sort((a, b) => a.startTime.localeCompare(b.startTime))[0]
                : roomBookings.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

              const isOccupied = !!currentBooking;

              return (
                <div key={room.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:border-secondary/30 transition-all flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isOccupied ? "bg-red-50 text-red-600" : "bg-secondary/10 text-secondary"
                      )}>
                        <DoorOpen size={20} />
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider block mb-1",
                          isOccupied ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                          {isOccupied ? 'Ocupada Agora' : 'Disponível'}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {totalClasses} {totalClasses === 1 ? 'aula' : 'aulas'} no dia
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm md:text-base">{room.id}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {uniqueCourses.length > 0 ? (
                          uniqueCourses.map(course => (
                            <span key={course} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {course}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-gray-400 italic">Sem cursos agendados</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    {isOccupied ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Aula Atual</p>
                        <p className="text-xs font-semibold text-red-600 truncate">{currentBooking.titulo}</p>
                        <p className="text-[10px] text-gray-500">{currentBooking.startTime} - {currentBooking.endTime}</p>
                      </div>
                    ) : nextBooking ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {isToday ? (nextBooking.startTime > currentTime ? 'Próxima Aula' : 'Última Aula') : 'Primeira Aula'}
                        </p>
                        <p className="text-xs font-semibold text-primary truncate">{nextBooking.titulo}</p>
                        <p className="text-[10px] text-gray-500">
                          {isToday && nextBooking.startTime <= currentTime ? `Encerrada às ${nextBooking.endTime}` : `Inicia às ${nextBooking.startTime}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">Nenhum agendamento</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </>
          ) : activeTab === 'relatorios' ? (
            <ReportsView 
              bookings={bookings} 
              users={users} 
              logs={activityLogs} 
              rooms={rooms.map(r => r.id)} 
            />
          ) : activeTab === 'cronograma' ? (
            <WeeklyScheduleView 
              bookings={bookings} 
              user={user} 
            />
          ) : (
            <div className="h-full flex flex-col space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Minhas Equipes</h1>
                  <p className="text-sm text-gray-500">Colabore com outros usuários em grupos específicos.</p>
                </div>
                {(user.role === 'professor' || user.role === 'admin') && (
                  <Button onClick={() => setIsTeamModalOpen(true)} className="gap-2">
                    <Plus size={18} />
                    Criar Equipe
                  </Button>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
                {/* Teams List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Buscar equipes..." 
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {teams.length > 0 ? (
                      teams.map(team => (
                        <div
                          key={team.id}
                          onClick={() => setSelectedTeam(team)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-all group cursor-pointer",
                            selectedTeam?.id === team.id ? "bg-primary/5 text-primary" : "hover:bg-gray-50 text-gray-700"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0",
                              selectedTeam?.id === team.id ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                            )}>
                              {team.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-sm font-bold truncate">{team.nome}</p>
                              <p className="text-[10px] text-gray-400 truncate">{team.membros.length} membros</p>
                            </div>
                          </div>
                          {(user.role === 'admin' || team.criadoPor === user.email) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeam(team.id);
                              }}
                              className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <UsersIcon className="mx-auto text-gray-200 mb-2" size={32} />
                        <p className="text-xs text-gray-400">Nenhuma equipe encontrada</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                  {selectedTeam ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                            {selectedTeam.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{selectedTeam.nome}</h3>
                            <p className="text-[10px] text-gray-500">Membros: {selectedTeam.membros.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(user.role === 'admin' || selectedTeam.criadoPor === user.email) && (
                            <button 
                              onClick={() => {
                                setNewTeamMembers(selectedTeam.membros.filter(m => m !== selectedTeam.criadoPor).join(', '));
                                setIsManageMembersOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                              title="Gerenciar Membros"
                            >
                              <UserPlus size={20} />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Tab Switcher */}
                      <div className="flex border-b border-gray-100 bg-white shrink-0">
                        <button 
                          onClick={() => setTeamTab('chat')}
                          className={cn(
                            "flex-1 py-3 text-xs font-bold transition-all border-b-2",
                            teamTab === 'chat' ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"
                          )}
                        >
                          Chat
                        </button>
                        <button 
                          onClick={() => setTeamTab('materiais')}
                          className={cn(
                            "flex-1 py-3 text-xs font-bold transition-all border-b-2",
                            teamTab === 'materiais' ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"
                          )}
                        >
                          Materiais
                        </button>
                      </div>

                      {teamTab === 'chat' ? (
                        <>
                          {/* Messages */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {teamMessages.length > 0 ? (
                              teamMessages.map(msg => {
                                const isMe = msg.remetente === user.email;
                                return (
                                  <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    <div className={cn(
                                      "max-w-[80%] p-3 rounded-2xl shadow-sm",
                                      isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                    )}>
                                      {!isMe && <p className="text-[10px] font-bold text-secondary mb-1">{msg.remetenteNome}</p>}
                                      <p className="text-sm leading-relaxed">{msg.mensagem}</p>
                                      <p className={cn("text-[9px] mt-1 text-right", isMe ? "text-white/70" : "text-gray-400")}>
                                        {format(safeParseISO(msg.data) || new Date(), 'HH:mm')}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                                  <MessageSquare size={32} />
                                </div>
                                <p className="text-gray-500 text-sm">Nenhuma mensagem ainda. Comece a conversa!</p>
                              </div>
                            )}
                          </div>

                          {/* Chat Input */}
                          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white shrink-0">
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                placeholder="Digite sua mensagem..." 
                                className="flex-1 h-12 md:h-11 bg-gray-100 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-secondary"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                              />
                              <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-12 h-12 md:w-11 md:h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-brand-dark transition-all disabled:opacity-50 active:scale-95"
                              >
                                <Send size={20} />
                              </button>
                            </div>
                          </form>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
                          {/* Materials Header/Upload */}
                          <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Arquivos da Equipe</h4>
                            {(user.role === 'professor' || user.role === 'admin') && (
                              <label className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-primary transition-all shadow-sm active:scale-95">
                                <Upload size={14} />
                                Enviar Material
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={processing} />
                              </label>
                            )}
                          </div>

                          {/* Materials List */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {teamMaterials.length > 0 ? (
                              teamMaterials.map(material => (
                                <div 
                                  key={material.id} 
                                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
                                >
                                  <div 
                                    className="flex items-center gap-4 flex-1 cursor-pointer"
                                    onClick={() => handleViewMaterial(material)}
                                  >
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                                      <FileText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-gray-900 truncate">{material.nome}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                          <UserIcon size={10} />
                                          {material.enviadoPorNome}
                                        </span>
                                        <span 
                                          className={cn(
                                            "text-[10px] text-gray-400 flex items-center gap-1",
                                            (user.role === 'professor' || user.role === 'admin') && "cursor-pointer hover:text-secondary hover:underline"
                                          )}
                                          onClick={(e) => {
                                            if (user.role === 'professor' || user.role === 'admin') {
                                              e.stopPropagation();
                                              setViewersMaterial(material);
                                            }
                                          }}
                                        >
                                          <Eye size={10} />
                                          {material.visualizacoes.length} visualizações
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(user.role === 'admin' || material.enviadoPor === user.email) && (
                                      <button 
                                        onClick={() => handleDeleteMaterial(material.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Remover Material"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleViewMaterial(material)}
                                      className="p-2 text-gray-300 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all"
                                      title="Visualizar"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                                  <FileText size={32} />
                                </div>
                                <p className="text-gray-500 text-sm">Nenhum material enviado ainda.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
                        <UsersIcon size={48} />
                      </div>
                      <div className="max-w-xs">
                        <h3 className="text-lg font-bold text-gray-900">Selecione uma equipe</h3>
                        <p className="text-sm text-gray-500 mt-1">Escolha um grupo na lista ao lado para começar a conversar com seus colegas.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bulk Schedule Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!processing) {
                  setIsBulkModalOpen(false);
                  setIsBulkPreviewing(false);
                }
              }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-secondary text-white shrink-0">
                <h3 className="text-lg md:text-xl font-bold">Agendamento em Lote</h3>
                <button 
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setIsBulkPreviewing(false);
                  }} 
                  className="text-white/80 hover:text-white p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
                {!isBulkPreviewing ? (
                  <div className="space-y-4">
                    <Input 
                      label="Título das Aulas" 
                      placeholder="Ex: Aula de Cálculo I" 
                      required
                      value={bulkParams.titulo}
                      onChange={e => setBulkParams({...bulkParams, titulo: e.target.value})}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Sala</label>
                        <select 
                          className="w-full h-12 md:h-10 rounded-lg border border-gray-200 bg-white px-3 text-base md:text-sm focus:ring-2 focus:ring-secondary min-h-[44px]"
                          value={bulkParams.room}
                          onChange={e => setBulkParams({...bulkParams, room: e.target.value})}
                        >
                          {rooms.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Curso</label>
                        <select 
                          className="w-full h-12 md:h-10 rounded-lg border border-gray-200 bg-white px-3 text-base md:text-sm focus:ring-2 focus:ring-secondary min-h-[44px]"
                          value={bulkParams.course}
                          onChange={e => setBulkParams({...bulkParams, course: e.target.value})}
                        >
                          <option value="ADS">ADS</option>
                          <option value="Direito">Direito</option>
                          <option value="Psicologia">Psicologia</option>
                          <option value="Administração">Administração</option>
                          <option value="Enfermagem">Enfermagem</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Data Início" 
                        type="date" 
                        required
                        value={bulkParams.startDate}
                        onChange={e => setBulkParams({...bulkParams, startDate: e.target.value})}
                      />
                      <Input 
                        label="Data Fim" 
                        type="date" 
                        required
                        value={bulkParams.endDate}
                        onChange={e => setBulkParams({...bulkParams, endDate: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Horário Início" 
                        type="time" 
                        required
                        value={bulkParams.startTime}
                        onChange={e => setBulkParams({...bulkParams, startTime: e.target.value})}
                      />
                      <Input 
                        label="Horário Fim" 
                        type="time" 
                        required
                        value={bulkParams.endTime}
                        onChange={e => setBulkParams({...bulkParams, endTime: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Dias da Semana</label>
                      <div className="flex flex-wrap gap-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const newDays = bulkParams.daysOfWeek.includes(idx)
                                ? bulkParams.daysOfWeek.filter(d => d !== idx)
                                : [...bulkParams.daysOfWeek, idx];
                              setBulkParams({...bulkParams, daysOfWeek: newDays});
                            }}
                            className={cn(
                              "px-3 py-2 rounded-lg text-xs font-bold border transition-all",
                              bulkParams.daysOfWeek.includes(idx)
                                ? "bg-secondary text-white border-secondary shadow-md"
                                : "bg-gray-50 text-gray-400 border-gray-200 hover:border-secondary/30"
                            )}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="flex-1 h-12 md:h-11" 
                        onClick={() => setIsBulkModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        className="flex-1 h-12 md:h-11" 
                        onClick={handleBulkPreview}
                        disabled={processing}
                      >
                        {processing ? 'Verificando...' : 'Verificar Disponibilidade'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                      <h4 className="font-bold text-primary text-sm">Resumo do Agendamento</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <p><span className="text-gray-400">Título:</span> {bulkParams.titulo}</p>
                        <p><span className="text-gray-400">Sala:</span> {bulkParams.room}</p>
                        <p><span className="text-gray-400">Horário:</span> {bulkParams.startTime} - {bulkParams.endTime}</p>
                        <p><span className="text-gray-400">Período:</span> {bulkParams.startDate} até {bulkParams.endDate}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">Aulas a serem criadas ({bulkPreview.filter(p => !p.hasConflict).length})</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {bulkPreview.map((item, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border text-xs",
                              item.hasConflict 
                                ? "bg-red-50 border-red-100 text-red-700" 
                                : "bg-green-50 border-green-100 text-green-700"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {item.hasConflict ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                              <span className="font-medium">
                                {format(safeParseISO(item.date)!, "EEEE, d 'de' MMMM", { locale: ptBR })}
                              </span>
                            </div>
                            {item.hasConflict && (
                              <span className="text-[10px] font-bold uppercase">Conflito: {item.conflictWith}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="flex-1 h-12 md:h-11" 
                        onClick={() => setIsBulkPreviewing(false)}
                      >
                        Voltar e Editar
                      </Button>
                      <Button 
                        type="button" 
                        className="flex-1 h-12 md:h-11" 
                        onClick={handleBulkConfirm}
                        disabled={processing || bulkPreview.filter(p => !p.hasConflict).length === 0}
                      >
                        {processing ? 'Criando...' : 'Confirmar e Criar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Viewers Modal */}
      {viewersMaterial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900">Visualizações</h3>
                <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{viewersMaterial.nome}</p>
              </div>
              <button 
                onClick={() => setViewersMaterial(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {viewersMaterial.visualizacoes.length > 0 ? (
                <div className="space-y-3">
                  {viewersMaterial.visualizacoes.map((view, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-xs font-bold">
                          {view.usuarioNome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{view.usuarioNome}</p>
                          <p className="text-[10px] text-gray-500">{view.usuario}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {format(safeParseISO(view.data) || new Date(), 'dd/MM HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Eye className="mx-auto text-gray-200 mb-2" size={32} />
                  <p className="text-sm text-gray-500">Ninguém visualizou ainda.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <Button onClick={() => setViewersMaterial(null)} variant="secondary" className="px-6">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Team Creation Modal */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white shrink-0">
                <h3 className="text-lg md:text-xl font-bold">Criar Nova Equipe</h3>
                <button onClick={() => setIsTeamModalOpen(false)} className="text-white/80 hover:text-white p-1">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="p-4 md:p-6 space-y-4 overflow-y-auto">
                <Input 
                  label="Nome da Equipe" 
                  placeholder="Ex: Grupo de Estudos ADS" 
                  required
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Membros (E-mails separados por vírgula)</label>
                  <textarea 
                    className="w-full h-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base md:text-sm focus:ring-2 focus:ring-secondary min-h-[44px]"
                    placeholder="aluno1@email.com, aluno2@email.com"
                    value={newTeamMembers}
                    onChange={e => setNewTeamMembers(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 italic">Você será adicionado automaticamente como criador.</p>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1 h-12 md:h-11" onClick={() => setIsTeamModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 h-12 md:h-11" disabled={processing}>
                    {processing ? 'Criando...' : 'Criar Equipe'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Members Modal */}
      <AnimatePresence>
        {isManageMembersOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageMembersOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-secondary text-white shrink-0">
                <h3 className="text-lg md:text-xl font-bold">Gerenciar Membros</h3>
                <button onClick={() => setIsManageMembersOpen(false)} className="text-white/80 hover:text-white p-1">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateMembers} className="p-4 md:p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Membros (E-mails separados por vírgula)</label>
                  <textarea 
                    className="w-full h-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base md:text-sm focus:ring-2 focus:ring-secondary min-h-[44px]"
                    placeholder="aluno1@email.com, aluno2@email.com"
                    value={newTeamMembers}
                    onChange={e => setNewTeamMembers(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 italic">O criador da equipe não pode ser removido por aqui.</p>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1 h-12 md:h-11" onClick={() => setIsManageMembersOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 h-12 md:h-11" disabled={processing}>
                    {processing ? 'Salvando...' : 'Atualizar Membros'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white shrink-0">
                <h3 className="text-lg md:text-xl font-bold">{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="p-4 md:p-6 space-y-4 overflow-y-auto">
                <Input 
                  label="Título do Evento" 
                  placeholder="Ex: Aula de Cálculo I" 
                  required
                  value={newBooking.titulo}
                  onChange={e => setNewBooking({...newBooking, titulo: e.target.value})}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Sala</label>
                    <select 
                      className="w-full h-12 md:h-10 rounded-lg border border-gray-200 bg-white px-3 text-base md:text-sm focus:ring-2 focus:ring-secondary min-h-[44px]"
                      value={newBooking.room}
                      onChange={e => setNewBooking({...newBooking, room: e.target.value})}
                    >
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
                    </select>
                  </div>
                  <Input 
                    label="Data" 
                    type="date" 
                    required
                    value={newBooking.date}
                    onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Início" 
                    type="time" 
                    required
                    value={newBooking.startTime}
                    onChange={e => setNewBooking({...newBooking, startTime: e.target.value})}
                  />
                  <Input 
                    label="Fim" 
                    type="time" 
                    required
                    value={newBooking.endTime}
                    onChange={e => setNewBooking({...newBooking, endTime: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Curso</label>
                  <select 
                    className="w-full h-12 md:h-10 rounded-lg border border-gray-200 bg-white px-3 text-base md:text-sm focus:ring-2 focus:ring-secondary min-h-[44px]"
                    value={newBooking.course}
                    onChange={e => setNewBooking({...newBooking, course: e.target.value})}
                  >
                    <option value="ADS">ADS</option>
                    <option value="Direito">Direito</option>
                    <option value="Psicologia">Psicologia</option>
                    <option value="Administração">Administração</option>
                    <option value="Enfermagem">Enfermagem</option>
                  </select>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button type="button" variant="secondary" className="flex-1 order-2 sm:order-1 h-12 md:h-11" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancelar</Button>
                  <Button type="submit" className="flex-1 order-1 sm:order-2 h-12 md:h-11" disabled={processing}>
                    {processing ? 'Processando...' : (isEditing ? 'Salvar Alterações' : 'Confirmar Reserva')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <X size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h3>
                <p className="text-gray-500 text-sm">Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 order-2 sm:order-1 h-12 md:h-11" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={processing}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1 order-1 sm:order-2 h-12 md:h-11" 
                  onClick={handleDeleteBooking}
                  disabled={processing}
                >
                  {processing ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = authService.getUser();
    if (savedUser) {
      setUser(savedUser);
      setView('dashboard');
    }
  }, []);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setView('dashboard');
  };

  const handleSignupSuccess = (u: User) => {
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('login');
  };

  return (
    <div className="font-sans antialiased text-gray-900">
        <Toaster position="top-right" richColors />
        {view === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess} 
            onGoToSignup={() => setView('signup')} 
          />
        )}
        {view === 'signup' && (
          <SignupPage 
            onSignupSuccess={handleSignupSuccess} 
            onGoToLogin={() => setView('login')} 
          />
        )}
        {view === 'dashboard' && user && (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </div>
  );
}
