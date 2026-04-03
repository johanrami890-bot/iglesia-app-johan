import { useState, useEffect } from 'react';
import Alert from '../components/ui/Alert';
import { useLang } from '../context/LangContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Solicitudes() {
  const { t } = useLang();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/solicitudes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Manejo silencioso de errores - simplemente mostramos lista vacía
        setSolicitudes([]);
        setError(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSolicitudes(data);
      setError(null);
    } catch (err) {
      // Error silencioso
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobation = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/solicitudes/${id}/procesar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accion: action }),
      });

      if (!response.ok) {
        throw new Error(t('error_processing_request'));
      }

      setSuccess(
        action === 'aprobar'
          ? t('request_approved')
          : t('request_rejected')
      );

      // Actualizar lista
      setSolicitudes(solicitudes.filter(s => s.id !== id));

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-cyan-400">{t('loading')}</p>
      </div>
    );
  }

  // Helper para generar descripción localizada
  const getRequestDescription = (tipo, datos) => {
    switch (tipo) {
      case 'create_assignment':
      case 'update_assignment':
      case 'delete_assignment':
        return `${t('req_' + tipo)} ${datos.usuario_nombre || 'Usuario'} - ${datos.tarea_titulo || 'Tarea'} (${new Date(datos.fecha_asignacion).toLocaleDateString()})`;

      case 'create_user':
      case 'update_user':
      case 'delete_user':
        return `${t('req_' + tipo)} ${datos.nombre || datos.user_name || ''}`;

      case 'create_task':
      case 'update_task':
      case 'delete_task':
        return `${t('req_' + tipo)} ${datos.titulo || ''}`;

      case 'generate_month':
        return t('req_generate_month');

      default:
        return 'Solicitud desconocida';
    }
  };

  return (
    <div className="p-4 md:p-8">
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">
          {t('pending_requests')}
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          {solicitudes.length > 0
            ? `${solicitudes.length} ${t(solicitudes.length === 1 ? 'request_singular' : 'requests_plural')}`
            : t('no_pending_requests')}
        </p>
      </div>

      {solicitudes.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">{t('no_pending_requests')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 hover:border-cyan-400/50 transition-all shadow-lg hover:shadow-cyan-900/20"
            >
              <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-3">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('supervisor_name')}</p>
                  <p className="text-cyan-400 font-semibold text-lg">
                    {solicitud.supervisor_nombre}
                  </p>
                </div>
              </div>

              <div className="mb-4 bg-slate-800/30 p-4 rounded border border-slate-700/30">
                <p className="text-gray-200 text-base leading-relaxed">
                  {getRequestDescription(solicitud.tipo, solicitud.datos)}
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleAprobation(solicitud.id, 'aprobar')}
                  className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2.5 rounded-lg font-bold text-sm transition-colors border border-green-600/20 hover:border-green-600/50"
                >
                  {t('approve')}
                </button>
                <button
                  onClick={() => handleAprobation(solicitud.id, 'rechazar')}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2.5 rounded-lg font-bold text-sm transition-colors border border-red-600/20 hover:border-red-600/50"
                >
                  {t('reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
