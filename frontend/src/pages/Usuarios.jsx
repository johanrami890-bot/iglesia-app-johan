import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Mail, Users as UsersIcon, X } from 'lucide-react';
import Toast from '../components/Toast';
import { validateEmail, validatePassword } from '../utils/validation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Usuarios() {
  const { token, user } = useAuth();
  const { t } = useLang();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    newPassword: '',
    telefono: '',
    rol: 'servidor',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, [token]);

  const fetchUsuarios = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
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
    if (!formData.nombre.trim()) {
      setToast({ message: t('all_fields_required'), type: 'error' });
      return;
    }

    if (!validateEmail(formData.correo)) {
      setToast({ message: t('invalid_email'), type: 'error' });
      return;
    }

    if (!editingId && !validatePassword(formData.password)) {
      setToast({ message: t('password_min_6'), type: 'error' });
      return;
    }

    // --- LÓGICA DE SOLICITUD (SUPERVISOR) ---
    if (user?.rol === 'supervisor') {
      let descripcion = '';

      if (editingId) {
        // Para edición, construir descripción detallada
        const usuarioActual = usuarios.find(u => u.id === editingId);
        const cambios = [];

        if (usuarioActual?.nombre !== formData.nombre) {
          cambios.push(`nombre de "${usuarioActual?.nombre}" a "${formData.nombre}"`);
        }
        if (usuarioActual?.correo !== formData.correo) {
          cambios.push(`correo de "${usuarioActual?.correo}" a "${formData.correo}"`);
        }
        if (usuarioActual?.rol !== formData.rol) {
          cambios.push(`rol de "${usuarioActual?.rol}" a "${formData.rol}"`);
        }
        if (usuarioActual?.telefono !== formData.telefono) {
          cambios.push(`teléfono`);
        }
        if (formData.newPassword && formData.newPassword.trim()) {
          cambios.push('contraseña');
        }

        if (cambios.length > 0) {
          descripcion = `Actualizar usuario "${formData.nombre}": cambiar ${cambios.join(', ')}`;
        } else {
          descripcion = `Actualizar usuario "${formData.nombre}"`;
        }
      } else {
        // Para creación
        descripcion = `Crear usuario "${formData.nombre}" con rol ${formData.rol} y correo ${formData.correo}`;
      }

      try {
        const datos = { ...formData };
        if (editingId) datos.id = editingId;
        const type = editingId ? 'update_user' : 'create_user';

        const response = await fetch(`${API_URL}/solicitudes`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: type, datos, descripcion })
        });

        if (response.ok) {
          setToast({ message: 'Solicitud enviada al Pastor', type: 'success' });
          setShowModal(false);
          setEditingId(null);
          setFormData({ nombre: '', correo: '', password: '', newPassword: '', telefono: '', rol: 'servidor', estado: 'activo' });
        } else {
          setToast({ message: 'Error al enviar solicitud', type: 'error' });
        }
      } catch (err) {
        console.error(err);
        setToast({ message: 'Error de conexión', type: 'error' });
      }
      return;
    }

    try {
      if (editingId) {
        // Actualizar usuario (Pastor)
        const payload = {
          nombre: formData.nombre,
          correo: formData.correo,
          telefono: formData.telefono || null,
          rol: formData.rol,
          estado: formData.estado || 'activo'
        };

        // Solo incluir newPassword si no está vacío
        if (formData.newPassword && formData.newPassword.trim()) {
          payload.newPassword = formData.newPassword;
        }

        const response = await fetch(`${API_URL}/usuarios/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
          fetchUsuarios();
          setShowModal(false);
          setEditingId(null);
          setFormData({ nombre: '', correo: '', password: '', newPassword: '', telefono: '', rol: 'servidor', estado: 'activo' });
          setToast({ message: t('user_updated'), type: 'success' });
        } else {
          setToast({ message: data.error || t('error_update'), type: 'error' });
        }
      } else {
        // Crear nuevo usuario
        const response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
          fetchUsuarios();
          setShowModal(false);
          setFormData({ nombre: '', correo: '', password: '', telefono: '', rol: 'servidor', estado: 'activo' });
          setToast({ message: t('user_created'), type: 'success' });
        } else {
          setToast({ message: data.error || t('error_create_user'), type: 'error' });
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setToast({ message: t('connection_error'), type: 'error' });
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      newPassword: '',
      telefono: usuario.telefono || '',
      rol: usuario.rol,
      estado: usuario.estado || 'activo'
    });
    setEditingId(usuario.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('delete_confirm_user'))) return;

    if (user?.rol === 'supervisor') {
      const usuario = usuarios.find(u => u.id === id);
      const descripcion = `Eliminar usuario "${usuario?.nombre}" (${usuario?.rol}) con correo ${usuario?.correo}`;
      try {
        await fetch(`${API_URL}/solicitudes`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'delete_user', datos: { id }, descripcion })
        });
        setToast({ message: 'Solicitud de eliminación enviada', type: 'success' });
      } catch (e) { console.error(e); }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        fetchUsuarios();
        setToast({ message: t('user_deleted'), type: 'success' });
      } else {
        setToast({ message: data.error || t('error_delete'), type: 'error' });
      }
    } catch (err) {
      console.error('Error:', err);
      setToast({ message: t('connection_error'), type: 'error' });
    }
  }

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nombre: '', correo: '', password: '', telefono: '', rol: 'servidor', estado: 'activo' });
  }

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
              <UsersIcon className="w-10 h-10 text-accent-gold" />
              {t('users')}
            </h1>
            <p className="text-gray-400 mt-2">{t('manage_users')}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setFormData({ nombre: '', correo: '', password: '', newPassword: '', telefono: '', rol: 'servidor', estado: 'activo' });
              setEditingId(null);
              setShowModal(true);
            }}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            {t('new_user')}
          </motion.button>
        </motion.div>

        <motion.div
          className="rounded-xl backdrop-blur-lg bg-primary-900/40 border border-primary-400/30 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="p-8 text-center text-gray-400">{t('loading')}</div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center text-gray-400">{t('no_data')}</div>
          ) : (
            <>
              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-400/20">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('user_name')}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('email')}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('role')}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        className="border-b border-blue-400/10 hover:bg-slate-800/40 transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <td className="px-6 py-4 text-white font-semibold">{user.nombre}</td>
                        <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-cyan-400" />
                          {user.correo}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.rol === 'pastor' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                            user.rol === 'supervisor' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                              'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg hover:bg-slate-800 transition text-blue-400 hover:text-cyan-400"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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
                {usuarios.map((user, idx) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">{user.nombre}</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                          <Mail className="w-3 h-3 text-cyan-400" />
                          {user.correo}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${user.rol === 'pastor' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                        user.rol === 'supervisor' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' :
                          'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        }`}>
                        {user.rol}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-semibold">{t('edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
                  {editingId ? t('edit_user') : t('new_user')}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('user_name')}</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    placeholder={t('full_name')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('email')}</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    placeholder={t('email_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('phone')}</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    placeholder={t('phone_placeholder') || 'Teléfono (opcional)'}
                  />
                </div>

                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                )}

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('password')}</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      placeholder={t('password_placeholder')}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('role')}</label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="servidor">{t('user')}</option>
                    <option value="pastor">{t('pastor')}</option>
                    <option value="supervisor">{t('supervisor')}</option>
                  </select>
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
