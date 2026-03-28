import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  DoorOpen, 
  Users, 
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
  X
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
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { authService } from './services/authService';
import { bookingService } from './services/bookingService';
import { User, Booking } from './types';
import { cn } from './lib/utils';

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
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
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
            'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
      >
        <div className="text-center space-y-4">
          <Logo className="h-24 mx-auto" />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Login</h1>
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
          
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center">
          <button 
            onClick={onGoToSignup}
            className="text-sm text-secondary hover:text-primary font-medium transition-colors"
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
      const user = await authService.handleSignup({ name, email, password });
      toast.success('Conta criada com sucesso!');
      onSignupSuccess(user);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
      >
        <div className="text-center space-y-4">
          <Logo className="h-20 mx-auto" />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary">Criar Conta</h1>
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
          
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <div className="text-center">
          <button 
            onClick={onGoToLogin}
            className="text-sm text-secondary hover:text-primary font-medium transition-colors"
          >
            Já tem conta? Entrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    title: '',
    room: 'Sala 01',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '08:00',
    course: 'ADS'
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const data = await bookingService.getBookings();
    setBookings(data);
    setLoading(false);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookingService.createBooking({
        ...newBooking,
        userId: user.id
      });
      toast.success('Reserva confirmada!');
      setIsModalOpen(false);
      loadBookings();
      setNewBooking({
        title: '',
        room: 'Sala 01',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '08:00',
        course: 'ADS'
      });
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

  const selectedDateBookings = bookings.filter(b => isSameDay(parseISO(b.date), selectedDate));

  const rooms = [
    { id: 'Sala 01', capacity: 30 },
    { id: 'Sala 02', capacity: 20 },
    { id: 'Auditório', capacity: 100 },
    { id: 'Laboratório A', capacity: 25 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-primary">Key-Keep</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: CalendarIcon, label: 'Cronograma' },
            { icon: DoorOpen, label: 'Salas' },
            { icon: Users, label: 'Equipe' },
            { icon: BarChart3, label: 'Relatórios' },
            { icon: Settings, label: 'Configurações' },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                item.active ? "bg-primary/5 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-semibold text-primary hidden md:block">Key-Keep</h2>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar salas, agendamentos..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-primary relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao Key-Keep, {user.name.split(' ')[0]}!</h1>
              <p className="text-gray-500">Gestão inteligente de espaços acadêmicos.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus size={18} />
              Novo Agendamento
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cronograma Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-primary">Cronograma de Reservas</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-md text-secondary"><ChevronLeft size={20} /></button>
                  <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-md text-secondary"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="bg-gray-50 py-2 text-center text-xs font-bold text-gray-400 uppercase">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  const dayBookings = bookings.filter(b => isSameDay(parseISO(b.date), day));
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "bg-white min-h-[80px] p-2 transition-colors hover:bg-gray-50 cursor-pointer relative border-2",
                        !isSameMonth(day, monthStart) ? "bg-gray-50 text-gray-300" : "text-gray-900",
                        isSelected ? "border-secondary ring-1 ring-secondary/20 z-10" : "border-transparent"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                        isToday && !isSelected && "bg-primary/10 text-primary",
                        isSelected && "bg-secondary text-white"
                      )}>
                        {format(day, 'd')}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayBookings.slice(0, 2).map(b => (
                          <div key={b.id} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate font-medium">
                            {b.time} - {b.room}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-[10px] text-gray-400 pl-1">
                            +{dayBookings.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agenda Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="font-bold text-primary">Agenda do Dia</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <div className="flex-1 space-y-4">
                {selectedDateBookings.length > 0 ? (
                  selectedDateBookings.sort((a, b) => a.time.localeCompare(b.time)).map(booking => (
                    <div key={booking.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-secondary/30 transition-colors">
                      <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-gray-200 pr-4">
                        <span className="text-sm font-bold text-primary">{booking.time}</span>
                        <Clock size={14} className="text-secondary mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{booking.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-secondary" /> {booking.room}</span>
                          <span className="flex items-center gap-1"><Users size={12} className="text-secondary" /> {booking.course}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <CalendarIcon size={24} />
                    </div>
                    <p className="text-gray-500 text-sm">Nenhum agendamento para este dia.</p>
                  </div>
                )}
              </div>
              <Button variant="secondary" className="w-full mt-6">Ver Agenda Completa</Button>
            </div>
          </div>

          {/* Room Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map(room => {
              const isOccupied = selectedDateBookings.some(b => b.room === room.id);
              return (
                <div key={room.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:border-secondary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isOccupied ? "bg-red-50 text-red-600" : "bg-secondary/10 text-secondary"
                    )}>
                      <DoorOpen size={20} />
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                      isOccupied ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {isOccupied ? 'Ocupada' : 'Livre'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{room.id}</h4>
                    <p className="text-sm text-gray-500">Capacidade: {room.capacity} pessoas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                <h3 className="text-xl font-bold">Novo Agendamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
                <Input 
                  label="Título do Evento" 
                  placeholder="Ex: Aula de Cálculo I" 
                  required
                  value={newBooking.title}
                  onChange={e => setNewBooking({...newBooking, title: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Sala</label>
                    <select 
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-secondary"
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
                    label="Horário" 
                    type="time" 
                    required
                    value={newBooking.time}
                    onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Curso</label>
                    <select 
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-secondary"
                      value={newBooking.course}
                      onChange={e => setNewBooking({...newBooking, course: e.target.value})}
                    >
                      <option value="ADS">ADS</option>
                      <option value="Direito">Direito</option>
                      <option value="Enfermagem">Enfermagem</option>
                      <option value="Psicologia">Psicologia</option>
                      <option value="Administração">Administração</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1">Confirmar Reserva</Button>
                </div>
              </form>
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
