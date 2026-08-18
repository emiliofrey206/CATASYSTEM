import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Bell, Settings, TrendingUp, ShoppingBag, CheckCircle, Clock, ChevronDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces simuladas basadas en tu sistema
interface AdminDashboardProps {
  storeName?: string;
  accentColor?: string; // El color del sistema configurado por el cliente
}

export function AdminDashboard({ storeName = 'YOSEANY', accentColor = '#16a34a' }: AdminDashboardProps) {
  // Estado para el Modo Oscuro
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('TODOS');

  // Aplicar clase 'dark' al HTML cuando cambia el estado
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Datos de prueba para la interfaz
  const kpis = [
    { title: 'Ingresos Totales', value: '$ 1,204.50', trend: '+12.5%', icon: TrendingUp },
    { title: 'Pedidos Pendientes', value: '14', trend: '-2.4%', icon: Clock },
    { title: 'Ventas Completadas', value: '156', trend: '+18.2%', icon: CheckCircle },
  ];

  const orders = [
    { id: 'PED-997577', client: 'Marbelis Bravo', date: '15/8/2026', total: 15.00, status: 'PENDIENTE', items: 3 },
    { id: 'PED-293540', client: 'Yanehtzi Regalo', date: '15/8/2026', total: 14.00, status: 'PAGADO', items: 2 },
    { id: 'PED-242792', client: 'Ana Mota', date: '14/8/2026', total: 22.50, status: 'PENDIENTE', items: 1 },
    { id: 'PED-671502', client: 'Sheila Segundo', date: '13/8/2026', total: 8.00, status: 'CANCELADO', items: 1 },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-8 flex flex-col`}>
      
      {/* HEADER SUPERIOR (Estilo Helios Investments) */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Bienvenido, {storeName}</h1>
          <p className="text-sm font-medium opacity-60 mt-1">Aquí está el resumen de tu negocio en tiempo real.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Barra de Búsqueda Flotante */}
          <div className="hidden md:flex items-center bg-white dark:bg-[#151821] rounded-full px-4 py-2.5 border border-slate-200 dark:border-white/5 shadow-sm transition-all focus-within:ring-2" style={{ focusWithin: { ringColor: accentColor }}}>
            <Search className="w-4 h-4 opacity-50 mr-2" />
            <input 
              type="text" 
              placeholder="Pregúntale al sistema..." 
              className="bg-transparent border-none outline-none text-sm w-48 dark:placeholder-slate-500"
            />
          </div>

          {/* Controles de Perfil y Tema */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-full bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5 shadow-sm hover:scale-105 transition-transform"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button className="p-3 rounded-full bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5 shadow-sm hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 shadow-lg ml-2 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-[#0B0E14] rounded-full flex items-center justify-center border-2 border-transparent">
                <span className="font-black text-xs">YO</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL: KPIs y Gráficos (Estilo Bento Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Tarjeta Principal Brillante (Usa el color del sistema) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-[#151821] group"
        >
          {/* Resplandor de fondo usando el accentColor */}
          <div 
            className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-20 dark:opacity-10 group-hover:opacity-30 transition-opacity duration-700"
            style={{ backgroundColor: accentColor }}
          />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <span className="text-sm font-bold uppercase tracking-widest opacity-60">Balance Total</span>
            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-black/5 dark:bg-white/10 flex items-center gap-1">
              Hoy <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-2 relative z-10">$1,204.50</h2>
          
          <div className="mt-8 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">Salud del Negocio</span>
            </div>
            <p className="text-sm font-medium opacity-60 leading-relaxed max-w-[200px]">
              Tus ventas han aumentado un 12.5% respecto a la semana pasada.
            </p>
          </div>
        </motion.div>

        {/* Tarjetas Secundarias KPIs */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {kpis.slice(1).map((kpi, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (idx + 1) }}
              className="rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-[#151821] flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <kpi.icon className="w-5 h-5 opacity-70" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${kpi.trend.includes('+') ? 'text-green-600 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-3xl font-black mb-1">{kpi.value}</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-50">{kpi.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECCIÓN DE PEDIDOS (Estilo Watchlist) */}
      <div className="rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-white/5 bg-white dark:bg-[#11131A] shadow-sm flex-1">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: accentColor }} /> Últimos Pedidos
          </h3>
          
          {/* Píldoras de Filtro (Estilo Moderno) */}
          <div className="flex bg-slate-100 dark:bg-[#1A1D24] p-1 rounded-full overflow-x-auto max-w-full no-scrollbar">
            {['TODOS', 'PENDIENTE', 'PAGADO', 'CANCELADO'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-[#2A2E39] shadow-sm text-slate-900 dark:text-white' : 'opacity-50 hover:opacity-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Pedidos Compacta y Elegante */}
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * idx }}
              key={order.id} 
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#161922] border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#212530] shadow-sm flex items-center justify-center font-black text-xs border border-slate-100 dark:border-white/5">
                  {order.id.slice(-4)}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{order.client}</h4>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-50 mt-0.5">{order.id} • {order.items} artículos</p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="font-black">${order.total.toFixed(2)}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${order.status === 'PENDIENTE' ? 'text-orange-500' : order.status === 'PAGADO' ? 'text-green-500' : 'text-red-500'}`}>
                    {order.status}
                  </p>
                </div>
                
                {/* Botón de Acción Sutil */}
                <button 
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all border opacity-0 group-hover:opacity-100"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Ver Detalle
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
