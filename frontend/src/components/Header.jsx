import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { LogOut, Menu, X, LayoutDashboard, Users, CheckSquare, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.jpg';

const menuItems = [
  { label: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'users', icon: Users, path: '/usuarios', adminOnly: true },
  { label: 'tasks', icon: CheckSquare, path: '/tareas', adminOnly: true },
  { label: 'assignments', icon: Calendar, path: '/asignaciones' },
  { label: 'pending_requests', icon: Clock, path: '/solicitudes', pastorOnly: true },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { lang, changeLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const filteredItems = menuItems.filter(item =>
    (!item.adminOnly || user?.rol === 'pastor') &&
    (!item.pastorOnly || user?.rol === 'pastor')
  );

  return (
    <header className="bg-slate-950 border-b border-blue-400/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 object-contain rounded-full shadow-lg shadow-cyan-500/20" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-white">{t('app_name')}</h1>
            <p className="text-xs text-cyan-400 font-medium tracking-wide">{t('manage_assignments')}</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-2">
            <button
              onClick={() => changeLang('es')}
              className={`px-3 py-1 text-xs font-bold rounded transition ${lang === 'es'
                  ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-400'
                  : 'bg-slate-900 border border-blue-400/10 text-gray-400 hover:text-white'
                }`}
            >
              ES
            </button>
            <button
              onClick={() => changeLang('en')}
              className={`px-3 py-1 text-xs font-bold rounded transition ${lang === 'en'
                  ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-400'
                  : 'bg-slate-900 border border-blue-400/10 text-gray-400 hover:text-white'
                }`}
            >
              EN
            </button>
          </div>

          <div className="text-right">
            <p className="text-white font-semibold">{user?.nombre || t('welcome')}</p>
            <span className="inline-block px-2 py-0.5 bg-cyan-900/30 text-cyan-400 text-xs rounded border border-cyan-500/20 capitalize">
              {user?.rol || 'Miembro'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">{t('sign_out')}</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-cyan-400 hover:bg-slate-900/50 rounded-lg border border-cyan-500/30"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden border-t border-blue-400/20 bg-slate-950 absolute w-full left-0 shadow-2xl z-50">
          <div className="p-4 space-y-4">
            {/* User Info Mobile */}
            <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/30">
                {user?.nombre?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold text-white">{user?.nombre}</p>
                <p className="text-xs text-cyan-400 capitalize">{user?.rol}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive
                      ? 'bg-cyan-900/30 border border-cyan-500/30 text-cyan-400'
                      : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.label)}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>

            <div className="h-px bg-slate-800 my-2"></div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => changeLang(lang === 'es' ? 'en' : 'es')}
                className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-900 text-gray-300 rounded-lg border border-slate-700 hover:border-cyan-500/50"
              >
                <span className="text-xl">{lang === 'es' ? '🇺🇸' : '🇪🇸'}</span>
                <span className="font-medium">{lang === 'es' ? 'English' : 'Español'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-3 bg-red-900/20 text-red-400 rounded-lg border border-red-900/30 hover:bg-red-900/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">{t('sign_out')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
