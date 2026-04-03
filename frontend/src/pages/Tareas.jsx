import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, FileText } from 'lucide-react';
import Toast from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Tareas() {
  const { token, user } = useAuth();
  const { t } = useLang();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (token) {
      fetchTareas();
    }
  }, [token]);

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
      console.error('Error fetching tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.titulo.trim()) {
      setToast({ message: t('all_fields_required'), type: 'error' });
      return;
    }

    // --- LÓGICA SUPERVISOR ---
    if (user?.rol === 'supervisor') {
      let descripcion = '';

      if (editingId) {
        // Para edición, construir descripción detallada
        const tareaActual = tareas.find(t => t.id === editingId);
        const cambios = [];

        if (tareaActual?.titulo !== formData.titulo) {
          cambios.push(`título de "${tareaActual?.titulo}" a "${formData.titulo}"`);
        }
        if (tareaActual?.descripcion !== formData.descripcion) {
          cambios.push('descripción');
        }

        if (cambios.length > 0) {
          descripcion = `Actualizar tarea "${formData.titulo}": cambiar ${cambios.join(', ')}`;
        } else {
          descripcion = `Actualizar tarea "${formData.titulo}"`;
        }
      } else {
        // Para creación
        const descCorta = formData.descripcion?.substring(0, 50) || '';
        descripcion = `Crear tarea "${formData.titulo}"${descCorta ? ` - ${descCorta}...` : ''}`;
      }

      try {
        const datos = { ...formData };
        if (editingId) datos.id = editingId;
        const type = editingId ? 'update_task' : 'create_task';

        await fetch(`${API_URL}/solicitudes`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: type, datos, descripcion })
        });
        setToast({ message: 'Solicitud enviada al Pastor', type: 'success' });
        setShowModal(false);
        setEditingId(null);
        setFormData({ titulo: '', descripcion: '', cupo_maximo: 1, requires_specialty: false });
      } catch (e) {
        console.error(e);
        setToast({ message: 'Error enviando solicitud', type: 'error' });
      }
      return;
    }

    try {
      if (editingId) {
        // Actualizar tarea
        const response = await fetch(`${API_URL}/tareas/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
          fetchTareas();
          setShowModal(false);
          setEditingId(null);
          setFormData({ titulo: '', descripcion: '', prioridad: 'media' });
          setToast({ message: t('error_update'), type: 'success' });
        } else {
          setToast({ message: data.error || 'Error al actualizar', type: 'error' });
        }
      } else {
        // Crear nueva tarea
        const response = await fetch(`${API_URL}/tareas`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
          fetchTareas();
          setShowModal(false);
          setFormData({ titulo: '', descripcion: '', prioridad: 'media' });
          setToast({ message: 'Tarea creada correctamente', type: 'success' });
        } else {
          setToast({ message: data.error || 'Error al crear tarea', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setToast({ message: 'Error de conexión', type: 'error' });
    }
  };

  const handleEdit = (tarea) => {
    setFormData({
      titulo: tarea.titulo || '',
      descripcion: tarea.descripcion || ''
    });
    setEditingId(tarea.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('delete_confirm'))) return;

    if (user?.rol === 'supervisor') {
      const tarea = tareas.find(t => t.id === id);
      const descripcion = `Eliminar tarea "${tarea?.titulo}"${tarea?.descripcion ? ` (${tarea.descripcion.substring(0, 40)}...)` : ''}`;
      try {
        await fetch(`${API_URL}/solicitudes`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'delete_task', datos: { id }, descripcion })
        });
        setToast({ message: 'Solicitud de eliminación enviada', type: 'success' });
      } catch (e) { console.error(e); }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tareas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        fetchTareas();
        setToast({ message: t('error_delete'), type: 'success' });
      } else {
        setToast({ message: data.error || 'Error al eliminar', type: 'error' });
      }
    } catch (err) {
      console.error('Error:', err);
      setToast({ message: 'Error de conexión', type: 'error' });
    }
  }

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
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
            <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
              <FileText className="w-10 h-10 text-accent-gold" />
              {t('tasks')}
            </h1>
            <p className="text-gray-400 mt-2">{t('loading_data')}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setFormData({ titulo: '', descripcion: '', estado: 'activa' });
              setEditingId(null);
              setShowModal(true);
            }}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            {t('add_task')}
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg p-4 bg-blue-500/10 border border-blue-400/30"
          >
            <p className="text-blue-400 text-sm font-semibold">{t('total_tasks')}</p>
            <p className="text-white text-3xl font-bold mt-2">{tareas.length}</p>
          </motion.div>
        </div>

        {/* Tareas List */}
        <motion.div
          className="rounded-xl backdrop-blur-lg bg-primary-900/40 border border-primary-400/30 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="p-8 text-center text-gray-400">{t('loading')}</div>
          ) : tareas.length === 0 ? (
            <div className="p-8 text-center text-gray-400">{t('no_data')}</div>
          ) : (
            <>
              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-400/20 bg-slate-800/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('title')}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('description')}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tareas.map((tarea, idx) => (
                      <motion.tr
                        key={tarea.id}
                        className="border-b border-blue-400/10 hover:bg-slate-800/40 transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold">{tarea.titulo}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{tarea.descripcion || '-'}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(tarea)}
                            className="p-2 rounded-lg hover:bg-slate-800 transition text-blue-400 hover:text-cyan-400"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tarea.id)}
                            className="p-2 rounded-lg hover:bg-slate-800 transition text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: Cards */}
              <div className="md:hidden space-y-4 p-4">
                {tareas.map((tarea, idx) => (
                  <motion.div
                    key={tarea.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-bold text-lg">{tarea.titulo}</h3>
                    </div>

                    {tarea.descripcion && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tarea.descripcion}</p>
                    )}

                    <div className="flex gap-2 mt-2 pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => handleEdit(tarea)}
                        className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-semibold">{t('edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(tarea.id)}
                        className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">{t('delete')}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
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
                  {editingId ? t('edit_task') : t('create_task')}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('title')}</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    placeholder={t('task_title')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('description')}</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    placeholder={t('task_description')}
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
