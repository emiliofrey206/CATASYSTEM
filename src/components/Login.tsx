import { useState } from 'react';
import { Lock, User as UserIcon, ShieldCheck, Zap, Smartphone, Globe, ArrowRight, Sparkles, MessageSquare, Building2, ChevronDown } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col-reverse lg:flex-row bg-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- LADO IZQUIERDO: PRESENTACIÓN CORPORATIVA --- */}
      <div className="w-full lg:w-[50%] xl:w-[55%] bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between relative min-h-screen lg:min-h-0 z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10 lg:py-0">
          
          {/* AQUI ESTÁ LA SOLUCIÓN: CONTENEDOR BLANCO SÓLIDO (LIGHTBOX) A MÁXIMO TAMAÑO */}
          <div className="mb-10 lg:mb-14 inline-flex w-full max-w-[500px]">
            <div className="w-full bg-white px-6 py-6 sm:px-10 sm:py-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 flex items-center justify-center">
              <img src="/logo-catasystem.png" alt="CataSystem Logo" className="h-24 sm:h-32 lg:h-40 w-auto object-contain" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
            La evolución de tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              comercio digital.
            </span>
          </h1>
          
          <p className="text-base lg:text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
            Plataforma integral de ventas, control de inventario en tiempo real y gestión de pedidos diseñada para escalar tu negocio al siguiente nivel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-2xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><Zap className="w-5 h-5 text-blue-400" /></div>
              <div><h3 className="font-bold text-slate-200 mb-1">Ultra Rápido</h3><p className="text-sm text-slate-500 leading-relaxed">Arquitectura moderna para cargas instantáneas.</p></div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><Smartphone className="w-5 h-5 text-indigo-400" /></div>
              <div><h3 className="font-bold text-slate-200 mb-1">100% Responsivo</h3><p className="text-sm text-slate-500 leading-relaxed">Catálogos hermosos en cualquier dispositivo.</p></div>
            </div>
            <div className="flex gap-4 sm:col-span-2">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><Globe className="w-5 h-5 text-emerald-400" /></div>
              <div><h3 className="font-bold text-slate-200 mb-1">Gestión Centralizada Multi-Rubro</h3><p className="text-sm text-slate-500 leading-relaxed max-w-md">Controla tiendas, variantes y stock desde un único panel administrativo inteligente.</p></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/10 pt-8 mt-12 gap-6 sm:gap-0">
          <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tecnología de</p><p className="text-sm lg:text-base font-black text-slate-300 tracking-wide flex items-center gap-2">VASR LINK</p></div>
          <div className="sm:text-right"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ingeniería</p><p className="text-sm lg:text-base font-black text-slate-300 tracking-wide">Ing. Emilio Frey</p></div>
        </div>
      </div>

      {/* --- LADO DERECHO: INTERFAZ DE LOGIN --- */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col relative bg-slate-50/80 min-h-screen lg:min-h-0">
        
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-200/40 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/30 blur-[100px] rounded-full pointer-events-none hidden lg:block" />

        <nav className="relative z-20 w-full p-4 sm:p-6 flex flex-wrap justify-center lg:justify-end items-center gap-x-6 gap-y-4 border-b border-black/5 lg:border-none bg-white/50 lg:bg-transparent backdrop-blur-md">
          <div className="flex gap-6 items-center">
            <button type="button" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 py-2"><Building2 className="w-4 h-4 sm:w-5 sm:h-5" /> Quiénes Somos</button>
            <button type="button" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 py-2"><MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" /> Contacto</button>
          </div>
          <button type="button" className="w-full sm:w-auto text-sm sm:text-base font-bold text-white bg-slate-900 px-6 py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-95">
            <Sparkles className="w-5 h-5 text-blue-400" /> Cotiza tu Suscripción
          </button>
        </nav>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <div className="w-full max-w-[400px]">
            
            {/* LOGO EN EL MÓVIL (Lado Blanco) TAMBIÉN MÁS GRANDE */}
            <div className="lg:hidden flex items-center justify-center mb-10">
              <img src="/logo-catasystem.png" alt="CataSystem Logo" className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm" />
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />

              <div className="mb-8 text-center mt-2">
                <div className="w-16 h-16 bg-blue-50/80 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">Acceso Administrativo</h2>
                <p className="text-sm text-slate-500 font-medium">Ingresa tus credenciales para gestionar tu catálogo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Usuario</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400"><UserIcon className="h-5 w-5" /></div>
                    <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej. admin" className="w-full bg-white/50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm focus:bg-white" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 ml-1"><label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Contraseña</label></div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400"><Lock className="h-5 w-5" /></div>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/50 border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm focus:bg-white" />
                  </div>
                </div>

                {error && <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse mt-2"><span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />Credenciales incorrectas. Intenta de nuevo.</div>}

                <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-4 text-sm sm:text-base font-bold mt-6 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group active:scale-95">
                  Entrar al Sistema <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:hidden flex flex-col items-center justify-center pb-8 text-slate-400 animate-bounce">
          <span className="text-[10px] uppercase font-bold tracking-widest mb-1">Descubre más</span><ChevronDown className="w-5 h-5" />
        </div>

      </div>
    </div>
  );
}
