import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, CheckSquare, Clipboard, Activity, Clock, MapPin, Calendar as CalendarIcon, AlertCircle, Check, X } from 'lucide-react';
import { useLang } from '../context/LangContext';
import fondo from '../assets/fondo.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { user, token } = useAuth();
  const { t } = useLang();
  const [stats, setStats] = useState({
    usuarios: 0,
    tareas: 0,
    asignaciones: 0,
  });
  const [userAssignments, setUserAssignments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };



        if (user?.rol === 'pastor') {
          // Solo el pastor ve stats y solicitudes
          const promises = [
            fetch(`${API_URL}/usuarios`, { headers }),
            fetch(`${API_URL}/tareas`, { headers }),
            fetch(`${API_URL}/asignaciones`, { headers }),
            fetch(`${API_URL}/solicitudes`, { headers })
          ];

          const results = await Promise.all(promises.map(p => p.catch(e => e)));

          const dataU = results[0].ok ? await results[0].json() : [];
          const dataT = results[1].ok ? await results[1].json() : [];
          const dataA = results[2].ok ? await results[2].json() : [];
          const dataS = results[3].ok ? await results[3].json() : [];

          setStats({
            usuarios: Array.isArray(dataU) ? dataU.length : 0,
            tareas: Array.isArray(dataT) ? dataT.length : 0,
            asignaciones: Array.isArray(dataA) ? dataA.length : 0,
          });
          setPendingRequests(Array.isArray(dataS) ? dataS : []);

        } else {
          // Usuario Normal (servidor o supervisor)
          const res = await fetch(`${API_URL}/asignaciones/usuario/${user.id}`, { headers });
          const data = await res.json();
          setUserAssignments(Array.isArray(data) ? data.filter(a => new Date(a.fecha_asignacion) >= new Date().setHours(0, 0, 0, 0)).slice(0, 5) : []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, user]);

  // Handle request approval/rejection
  const handleRequest = async (id, accion) => {
    try {
      const response = await fetch(`${API_URL}/solicitudes/${id}/procesar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion })
      });
      if (response.ok) {
        alert(accion === 'aprobar' ? t('request_approved') : t('request_rejected'));
        setPendingRequests(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const dashboardItems = [
    {
      icon: Users,
      title: t('users'),
      value: stats.usuarios,
    },
    {
      icon: CheckSquare,
      title: t('tasks'),
      value: stats.tareas,
    },
    {
      icon: Clipboard,
      title: t('assignments'),
      value: stats.asignaciones,
    },
  ];

  return (
    <div className="p-8 bg-primary-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {user?.rol === 'pastor' ? t('dashboard') : `${t('welcome')}, ${user?.nombre}`}
            </h1>
            <p className="text-gray-400">
              {user?.rol === 'pastor' ? t('general_summary') : t('your_upcoming_tasks')}
            </p>
          </div>
        </motion.div>

        {user?.rol === 'pastor' ? (
          <>
            {/* Stats Grid for Pastor */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {dashboardItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    className="rounded-xl p-6 backdrop-blur-lg bg-primary-900/40 border border-primary-400/30 hover:border-accent-light/60 transition hover:scale-105"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase text-accent-light mb-2">{item.title}</p>
                        <p className="text-4xl font-bold text-white">{loading ? '-' : item.value}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary-800/50">
                        <Icon className="w-8 h-8 text-accent-gold" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pending Requests Section */}
            <motion.div
              className="rounded-xl backdrop-blur-lg bg-primary-900/40 border border-yellow-500/30 p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-white">{t('pending_requests')}</h2>
              </div>

              {pendingRequests.length === 0 ? (
                <p className="text-gray-400">{t('no_pending_requests')}</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="bg-slate-900/50 p-4 rounded-lg border border-primary-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        {/* Usamos descripcion, fallback a tipo si no existe */}
                        <p className="text-white font-bold">{req.descripcion || req.tipo}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          <span className="font-semibold text-cyan-400">{req.supervisor_nombre}</span> • {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleRequest(req.id, 'aprobar')}
                          className="flex-1 md:flex-none p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 flex justify-center items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span className="md:hidden text-xs font-bold">{t('approve')}</span>
                        </button>
                        <button
                          onClick={() => handleRequest(req.id, 'rechazar')}
                          className="flex-1 md:flex-none p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 flex justify-center items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span className="md:hidden text-xs font-bold">{t('reject')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Next Task Highlight for User */}
            <div className="col-md-12">
              <motion.div
                className="rounded-xl p-8 bg-gradient-to-br from-primary-600 to-primary-900 text-white shadow-xl relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="relative z-1">
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                    {t('next_assignment')}
                  </span>
                  {userAssignments.length > 0 ? (
                    <>
                      <h2 className="text-4xl font-bold mb-4">{userAssignments[0].tarea_titulo || 'Mesa de Bienvenida'}</h2>
                      <div className="flex flex-wrap gap-6 text-primary-100">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5" />
                          <span>{new Date(userAssignments[0].fecha_asignacion).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          <span>08:00 AM</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <h2 className="text-2xl font-bold">{t('no_pending_tasks')}</h2>
                  )}
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Clipboard className="w-32 h-32" />
                </div>
              </motion.div>
            </div>

            {/* Upcoming List */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-gold" />
                {t('upcoming_dates')}
              </h3>
              <div className="space-y-3">
                {userAssignments.length <= 1 ? (
                  <p className="text-gray-500 italic">{t('no_more_tasks')}</p>
                ) : (
                  userAssignments.slice(1).map((asign, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-primary-900/40 border border-primary-400/20 p-4 rounded-lg flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary-800 p-2 rounded text-center min-w-[50px]">
                          <div className="text-xs text-accent-light font-bold uppercase">
                            {new Date(asign.fecha_asignacion).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                          </div>
                          <div className="text-xl font-bold text-white">
                            {new Date(asign.fecha_asignacion).getDate()}
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{asign.tarea_titulo || t('default_task')}</p>
                          <p className="text-gray-400 text-xs">{t('location')}: Templo Principal</p>
                        </div>
                      </div>
                      <span className="text-primary-400 text-xs font-bold uppercase">{t('confirmed')}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
