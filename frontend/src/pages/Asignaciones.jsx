import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar, User, Clipboard, X, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { useLang } from '../context/LangContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Enhanced Calendar Component with Assignments
function EnhancedCalendar({ asignaciones = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAssignmentsForDay = (day) => {
    return asignaciones.filter(asign => {
      const assignDate = new Date(asign.fecha_asignacion);
      return assignDate.getDate() === day &&
        assignDate.getMonth() === currentDate.getMonth() &&
        assignDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const days = [];
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="bg-primary-900/60 rounded-xl p-6 border border-primary-400/20 w-full">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="p-2 text-accent-light hover:bg-primary-800/50 rounded transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 text-accent-light hover:bg-primary-800/50 rounded transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((d) => (
          <div key={d} className="text-center text-accent-gold text-xs font-bold p-2">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const dayAssignments = day ? getAssignmentsForDay(day) : [];
          return (
            <motion.div
              key={idx}
              className={`min-h-20 p-2 rounded text-sm transition ${day
                ? 'bg-primary-800/50 hover:bg-accent-light/10 cursor-pointer border border-primary-400/10'
                : 'bg-primary-950/20 text-gray-600'
                }`}
              whileHover={day ? { scale: 1.05 } : {}}
            >
              {day && (
                <>
                  <div className="font-bold text-white mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayAssignments.map((asign, i) => (
                      <div
                        key={i}
                        className="bg-accent-gold/20 border-l-2 border-accent-gold px-1 py-0.5 text-xs text-accent-light truncate rounded"
                        title={asign.tarea_titulo || 'Tarea'}
                      >
                        • {asign.tarea_titulo ? asign.tarea_titulo.substring(0, 8) : 'Tarea'}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Asignaciones() {
  const { user, token } = useAuth();
  const { t } = useLang();
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [formData, setFormData] = useState({
    usuario_id: '',
    tarea_id: '',
    fecha_asignacion: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (token) {
      fetchAsignaciones();
      fetchUsuarios();
      fetchTareas();
    }
  }, [token]);

  const fetchAsignaciones = async () => {
    try {
      const response = await fetch(`${API_URL}/asignaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setAsignaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      // Filtrar para que el Pastor no aparezca en las opciones de asignación
      setUsuarios(Array.isArray(data) ? data.filter(u => u.rol !== 'pastor') : []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchTareas = async () => {
    try {
      const response = await fetch(`${API_URL}/tareas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setTareas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- MANEJO DE ENVÍO (CREATE/UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si es Supervisor, enviamos solicitud
    if (user?.rol === 'supervisor') {
      try {
        // Obtener nombres para descripción específica
        const nombreUsuario = getUserName(formData.usuario_id);
        const nombreTarea = getTaskTitle(formData.tarea_id);
        const fecha = new Date(formData.fecha_asignacion).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        let descripcion = '';

        if (editingId) {
          // Para edición, encontrar la asignación actual para comparar
          const asignacionActual = asignaciones.find(a => a.id === editingId);
          const nombreUsuarioAnterior = getUserName(asignacionActual?.usuario_id);
          const nombreTareaAnterior = getTaskTitle(asignacionActual?.tarea_id);
          const fechaAnterior = new Date(asignacionActual?.fecha_asignacion).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          // Construir descripción detallada de cambios
          const cambios = [];
          if (nombreUsuarioAnterior !== nombreUsuario) {
            cambios.push(`cambiar de ${nombreUsuarioAnterior} a ${nombreUsuario}`);
          }
          if (nombreTareaAnterior !== nombreTarea) {
            cambios.push(`cambiar tarea de "${nombreTareaAnterior}" a "${nombreTarea}"`);
          }
          if (fechaAnterior !== fecha) {
            cambios.push(`cambiar fecha del ${fechaAnterior} al ${fecha}`);
          }

          if (cambios.length > 0) {
            descripcion = `Modificar asignación: ${cambios.join(', ')}`;
          } else {
            descripcion = `Actualizar asignación de ${nombreUsuario} en "${nombreTarea}" el ${fecha}`;
          }
        } else {
          // Para creación
          descripcion = `Asignar a ${nombreUsuario} la tarea "${nombreTarea}" el ${fecha}`;
        }

        const payload = {
          tipo: editingId ? 'update_assignment' : 'create_assignment',
          datos: { ...formData, id: editingId },
          descripcion: descripcion
        };

        const response = await fetch(`${API_URL}/solicitudes`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          alert(t('request_sent'));
          closeModal();
          return;
        }
      } catch (err) {
        console.error(err);
        alert(t('error_create'));
      }
      return;
    }

    // Lógica normal para Pastor (Directo)
    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/asignaciones/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          fetchAsignaciones();
          closeModal();
        }
      } else {
        const response = await fetch(`${API_URL}/asignaciones`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          fetchAsignaciones();
          closeModal();
        }
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (asign) => {
    setFormData({
      usuario_id: asign.usuario_id,
      tarea_id: asign.tarea_id,
      fecha_asignacion: asign.fecha_asignacion?.split('T')[0] || ''
    });
    setEditingId(asign.id);
    setShowModal(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const payload = {
      month: parseInt(data.get('month')),
      year: parseInt(data.get('year')),
      active_days: Array.from(data.getAll('active_days[]')).map(Number),
      quotas: {}
    };

    tareas.forEach(t => {
      payload.quotas[t.id] = parseInt(data.get(`quota_${t.id}`) || 1);
    });

    try {
      const response = await fetch(`${API_URL}/asignaciones/generar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchAsignaciones();
        setShowGenModal(false);
        alert('Asignaciones generadas con éxito');
      } else {
        const err = await response.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };



  // --- ELIMINAR ---
  const handleDelete = async (id) => {
    if (!confirm(t('delete_confirm'))) return;

    // Si es Supervisor, solicitud de eliminar
    if (user?.rol === 'supervisor') {
      try {
        // Obtener información de la asignación para descripción específica
        const asignacion = asignaciones.find(a => a.id === id);
        const nombreUsuario = getUserName(asignacion?.usuario_id);
        const nombreTarea = getTaskTitle(asignacion?.tarea_id);
        const fecha = new Date(asignacion?.fecha_asignacion).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const descripcion = `Eliminar asignación de ${nombreUsuario} en "${nombreTarea}" del ${fecha}`;

        await fetch(`${API_URL}/solicitudes`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'delete_assignment', datos: { id }, descripcion })
        });
        alert(t('request_sent'));
      } catch (e) { console.error(e); }
      return;
    }

    // Lógica normal Pastor
    try {
      const response = await fetch(`${API_URL}/asignaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        fetchAsignaciones();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openModal = () => {
    setFormData({ usuario_id: '', tarea_id: '', fecha_asignacion: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ usuario_id: '', tarea_id: '', fecha_asignacion: '' });
  };

  const getUserName = (id) => {
    const user = usuarios.find(u => u.id == id); // Use == for type coercion
    return user?.nombre || 'Usuario';
  };

  const getTaskTitle = (id) => {
    const task = tareas.find(t => t.id == id); // Use == for type coercion
    return task?.titulo || 'Tarea';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // --- ELIMINAR RANGO ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteRange = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const start = data.get('start_date');
    const end = data.get('end_date');

    if (!confirm(t('delete_confirm_range') || '¿Estás seguro de ELIMINAR TODAS las asignaciones en este rango?')) return;

    try {
      const response = await fetch(`${API_URL}/asignaciones/rango-custom`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ start, end })
      });

      if (response.ok) {
        const res = await response.json();
        alert(res.message);
        fetchAsignaciones();
        setShowDeleteModal(false);
      } else {
        alert('Error al eliminar');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 bg-primary-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
                <Clipboard className="w-10 h-10 text-accent-gold" />
                {t('calendar_title')}
              </h1>
              <p className="text-gray-400 mt-2">
                {t('calendar_subtitle')}
              </p>
            </div>
            {(user?.rol === 'pastor' || user?.rol === 'supervisor') && (
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal()}
                  className="bg-accent-gold text-primary-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-accent-gold/20"
                >
                  <Plus className="w-5 h-5" />
                  {t('new_assignment')}
                </motion.button>
                {user?.rol === 'pastor' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowGenModal(true)}
                      className="bg-primary-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-600 transition shadow-lg"
                    >
                      <Calendar className="w-5 h-5" />
                      {t('generate_month')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-900/50 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-900/80 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                      {t('delete_month') || 'Borrar Mes'}
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Tabla de asignaciones */}
          <div className="md:col-span-2">
            <motion.div
              className="rounded-xl backdrop-blur-lg bg-primary-900/40 border border-primary-400/30 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {loading ? (
                <div className="p-8 text-center text-gray-400">{t('loading')}</div>
              ) : asignaciones.length === 0 ? (
                <div className="p-8 text-center text-gray-400">{t('no_assignments')}</div>
              ) : (
                <>
                  {/* Vista Tablet/Desktop: Tabla */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-400/20">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('user')}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('task')}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('date')}</th>
                          {(user?.rol === 'pastor' || user?.rol === 'supervisor') && <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('actions')}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {asignaciones.map((asign, idx) => (
                          <motion.tr
                            key={asign.id}
                            className="border-b border-blue-400/10 hover:bg-slate-800/40 transition"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">
                              <User className="w-4 h-4 text-cyan-400" />
                              {getUserName(asign.usuario_id)}
                            </td>
                            <td className="px-6 py-4 text-gray-300">{getTaskTitle(asign.tarea_id)}</td>
                            <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              {formatDate(asign.fecha_asignacion)}
                            </td>
                            {(user?.rol === 'pastor' || user?.rol === 'supervisor') && (
                              <td className="px-6 py-4 flex gap-2">
                                <button
                                  onClick={() => handleEdit(asign)}
                                  className="p-2 rounded-lg hover:bg-slate-800 transition text-blue-400 hover:text-cyan-400"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {user?.rol === 'pastor' && (
                                  <button
                                    onClick={() => handleDelete(asign.id)}
                                    className="p-2 rounded-lg hover:bg-slate-800 transition text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            )}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista Móvil: Tarjetas */}
                  <div className="md:hidden space-y-4 p-4">
                    {asignaciones.map((asign, idx) => (
                      <motion.div
                        key={asign.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-cyan-400" />
                            <span className="font-semibold text-white">{getUserName(asign.usuario_id)}</span>
                          </div>
                          {(user?.rol === 'pastor' || user?.rol === 'supervisor') && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(asign)}
                                className="p-1.5 rounded-lg bg-slate-700/50 text-blue-400"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {user?.rol === 'pastor' && (
                                <button
                                  onClick={() => handleDelete(asign.id)}
                                  className="p-1.5 rounded-lg bg-slate-700/50 text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 pl-6">
                          <div className="text-gray-300 text-sm font-medium">{getTaskTitle(asign.tarea_id)}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(asign.fecha_asignacion)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Calendar Widget */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <EnhancedCalendar asignaciones={asignaciones} />
            </motion.div>
          </div>
        </div>

        {/* Modal Formulario */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-cyan-400/30 rounded-xl p-8 max-w-md w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingId ? t('edit_assignment') : t('new_assignment')}
                  </h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('server')}</label>
                    <select
                      name="usuario_id"
                      value={formData.usuario_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">{t('select_user')}</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('task')}</label>
                    <select
                      name="tarea_id"
                      value={formData.tarea_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">{t('select_task')}</option>
                      {tareas.map(t => (
                        <option key={t.id} value={t.id}>{t.titulo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('assignment_date')}</label>
                    <input
                      type="date"
                      name="fecha_asignacion"
                      value={formData.fecha_asignacion}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg transition"
                    >
                      {editingId ? t('update') : t('create')}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Generación Automática */}
        <AnimatePresence>
          {showGenModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={() => setShowGenModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-cyan-400/30 rounded-xl p-8 max-w-2xl w-full my-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{t('automatic_generator')}</h2>
                  <button onClick={() => setShowGenModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase">{t('month')}</label>
                      <select name="month" className="w-full bg-slate-800 border border-cyan-400/20 rounded-lg p-2 text-white outline-none focus:border-cyan-400" defaultValue={new Date().getMonth() + 1}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase">{t('year')}</label>
                      <input type="number" name="year" className="w-full bg-slate-800 border border-cyan-400/20 rounded-lg p-2 text-white outline-none focus:border-cyan-400" defaultValue={new Date().getFullYear()} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-3 uppercase border-b border-cyan-400/20 pb-1">{t('service_days')}</label>
                    <div className="flex flex-wrap gap-3">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => (
                        <label key={i} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded border border-cyan-400/10 hover:border-cyan-400/40 cursor-pointer transition">
                          <input type="checkbox" name="active_days[]" value={i} defaultChecked={[0, 2, 4, 6].includes(i)} className="accent-cyan-400" />
                          <span className="text-sm text-gray-300">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cyan-400 mb-3 uppercase border-b border-cyan-400/20 pb-1">{t('quotas_per_task')}</label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {tareas.map(t => (
                        <div key={t.id} className="flex items-center justify-between bg-slate-800/30 p-2 rounded border border-white/5">
                          <span className="text-xs text-gray-400 truncate mr-2">{t.titulo}</span>
                          <input type="number" name={`quota_${t.id}`} defaultValue="1" min="1" className="w-12 bg-slate-900 border border-cyan-400/20 rounded text-center text-xs p-1 text-white" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-900/20">
                      {t('generate_calendar')}
                    </button>
                    <button type="button" onClick={() => setShowGenModal(false)} className="flex-1 bg-slate-800 text-gray-400 font-bold py-3 rounded-lg hover:bg-slate-700 hover:text-white transition">
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Borrar Rango */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteModal(false)}
            >
              <div
                className="bg-red-950/90 border border-red-500/50 p-6 rounded-xl max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-500" />
                  Eliminar Asignaciones
                </h3>
                <p className="text-gray-300 text-sm mb-4">Selecciona el rango de fechas para eliminar TODAS las asignaciones. Esta acción no se puede deshacer.</p>

                <form onSubmit={handleDeleteRange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-red-400 mb-1">Fecha Inicio</label>
                    <input type="date" name="start_date" required className="w-full bg-black/30 border border-red-500/30 rounded p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-400 mb-1">Fecha Fin</label>
                    <input type="date" name="end_date" required className="w-full bg-black/30 border border-red-500/30 rounded p-2 text-white" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded">
                      ELIMINAR TODO
                    </button>
                    <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold py-2 rounded">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
