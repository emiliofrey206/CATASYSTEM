import { useState } from 'react';
import { catalogStore } from '../store';
import { Lock } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = catalogStore.login(username, password);
    if (!success) {
      setError('Credenciales incorrectas (Usa admin / admin)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 w-full max-w-sm shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Katalog Admin</h2>
        <p className="text-sm text-center text-slate-500 mb-8">Inicia sesión para gestionar el catálogo</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow font-medium"
              placeholder="Ej. admin"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow font-medium"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-[11px] text-red-600 font-bold bg-red-50 p-2 rounded-lg text-center">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-black text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors mt-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
