import { useState } from 'react';
import { Lock, User, ShieldCheck, Zap, Smartphone, Globe, ArrowRight, LayoutDashboard } from 'lucide-react';
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
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-500/30">
      
      {/* --- LADO IZQUIERDO: LANDING PAGE CORPORATIVA (Oculto en móviles) --- */}
      <div className="hidden lg:flex lg:w-[55%] bg-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
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

          <h1 className="text-5xl font-black leading-[1.1] tracking-tight mb-6">
            La evolución de tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              comercio digital.
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
            Plataforma integral de ventas, control de inventario en tiempo real y gestión de pedidos diseñada para escalar tu negocio al siguiente nivel.
          </p>

          <div className="grid grid-cols-2 gap-8 max-w-2xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Ultra Rápido</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Arquitectura moderna que garantiza tiempos de carga casi instantáneos para tus clientes.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Smartphone className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">100% Responsivo</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Catálogos hermosos y funcionales en cualquier dispositivo móvil o tablet.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Gestión Centralizada</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Controla múltiples tiendas, variantes y stock desde un único panel administrativo.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8 mt-12">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tecnología desarrollada por</p>
            <p className="text-sm font-black text-slate-300 tracking-wide">VASR LINK</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ingeniero de Software</p>
            <p className="text-sm font-black text-slate-300 tracking-wide">Ing. Emilio Frey</p>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO: FORMULARIO DE LOGIN --- */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative">
        {/* Círculo decorativo solo visible en móvil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] pointer-events-none lg:hidden" />
        
        <div className="w-full max-w-md relative z-10">
          
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight uppercase text-slate-900">CataSystem</span>
          </div>

          <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Bienvenido de nuevo</h2>
              <p className="text-sm text-slate-500 font-medium">Ingresa tus credenciales para acceder al panel de administración.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. admin"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Contraseña</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  Credenciales incorrectas. Por favor, intenta de nuevo.
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 text-white rounded-xl py-4 text-sm font-bold mt-4 hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 group"
              >
                Acceder al Sistema
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Footer en móvil */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Desarrollado por VASR LINK</p>
          </div>

        </div>
      </div>

    </div>
  );
}
