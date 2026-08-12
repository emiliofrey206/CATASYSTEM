import { useState } from 'react';
import { Lock, User as UserIcon, ShieldCheck, Zap, Smartphone, Globe, ArrowRight, LayoutDashboard, Sparkles, MessageSquare, Building2 } from 'lucide-react';
import { useCatalog } from '../store';

export function Login() {
  const catalog = useCatalog();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = catalog.login(username, password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* --- LADO IZQUIERDO: PRESENTACIÓN CORPORATIVA --- */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] bg-slate-950 text-white p-12 flex-col justify-between relative">
        {/* Efectos de luz de fondo */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight uppercase">CataSystem</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
            La evolución de tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              comercio digital.
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
            Plataforma integral de ventas, control de inventario en tiempo real y gestión de pedidos diseñada para escalar tu negocio al siguiente nivel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Ultra Rápido</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Arquitectura moderna para cargas instantáneas.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Smartphone className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">100% Responsivo</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Catálogos hermosos en cualquier dispositivo.</p>
              </div>
            </div>
            <div className="flex gap-4 sm:col-span-2">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Gestión Centralizada Multi-Rubro</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md">Controla tiendas, variantes y stock desde un único panel administrativo inteligente.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8 mt-12">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tecnología de</p>
            <p className="text-sm font-black text-slate-300 tracking-wide flex items-center gap-2">VASR LINK</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ingeniería</p>
            <p className="text-sm font-black text-slate-300 tracking-wide">Ing. Emilio Frey</p>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO: INTERFAZ DE APLICACIÓN Y LOGIN --- */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col relative bg-slate-50/80">
        
        {/* Luces decorativas sutiles en el fondo derecho */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-200/40 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/30 blur-[100px] rounded-full pointer-events-none" />

        {/* NAVEGACIÓN SUPERIOR (Simulación SaaS) */}
        <nav className="relative z-20 w-full p-6 flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-6 border-b border-black/5 lg:border-none">
          <button type="button" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Quiénes Somos
          </button>
          <button type="button" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Contacto
          </button>
          <button type="button" className="text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-1.5 active:scale-95">
            <Sparkles className="w-4 h-4 text-blue-400" /> Cotiza tu Suscripción
          </button>
        </nav>

        {/* CONTENEDOR DEL FORMULARIO CENTRAL */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <div className="w-full max-w-[400px]">
            
            {/* Título móvil (solo se ve si se oculta el lado izquierdo) */}
            <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight uppercase text-slate-900">CataSystem</span>
            </div>

            {/* TARJETA DE LOGIN CON GLASSMORPHISM */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white relative overflow-hidden">
              
              {/* Adorno superior en la tarjeta */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />

              <div className="mb-8 text-center mt-2">
                <div className="w-14 h-14 bg-blue-50/80 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-inner">
                  <ShieldCheck className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Acceso Administrativo</h2>
                <p className="text-sm text-slate-500 font-medium">Ingresa tus credenciales para gestionar tu catálogo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Usuario</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej. admin"
                      className="w-full bg-white/50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Contraseña</label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm focus:bg-white"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    Credenciales incorrectas. Intenta de nuevo.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-2xl py-4 text-sm font-bold mt-6 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  Entrar al Sistema
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
            
          </div>
        </div>

        {/* Footer móvil oculto en PC */}
        <div className="mt-auto p-6 text-center lg:hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Desarrollado por VASR LINK</p>
        </div>

      </div>
    </div>
  );
}
