import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  Clock,
  ChevronRight,
  Globe,
} from 'lucide-react';

const menuItems = [
  { label: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'users', icon: Users, path: '/usuarios', adminOnly: true },
  { label: 'tasks', icon: CheckSquare, path: '/tareas', adminOnly: true },
  { label: 'assignments', icon: Calendar, path: '/asignaciones' },
  { label: 'pending_requests', icon: Clock, path: '/solicitudes', pastorOnly: true },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { t, lang, changeLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredItems = menuItems.filter(item =>
    (!item.adminOnly || user?.rol === 'pastor' || user?.rol === 'supervisor') &&
    (!item.pastorOnly || user?.rol === 'pastor')
  );

  return (
    <aside className="w-64 bg-slate-950 border-r border-blue-400/20 h-screen sticky top-16 hidden md:flex flex-col">
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive
                ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-400'
                : 'text-gray-300 hover:bg-slate-900/50 border border-blue-400/10 hover:border-blue-400/30'
                }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.label)}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-400/20 text-center">
        <p className="text-xs text-gray-600">Iglesia App v1.2</p>
      </div>
    </aside>
  );
}
