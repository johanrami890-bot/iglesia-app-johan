import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronLeft, X, Shield, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Toast from '../components/Toast';
import { validateEmail, getErrorMessage } from '../utils/validation';
import logo from '../assets/logo.jpg';
import fondo from '../assets/fondo.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Modal reutilizable ───────────────────────────────────────────────────────
function PolicyModal({ isOpen, onClose, title, icon: Icon, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col bg-slate-900 border border-blue-400/20 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-400/10 bg-slate-800/60">
              <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
              <h2 className="text-white font-bold text-lg flex-1">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition rounded-lg p-1 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto px-6 py-5 text-gray-300 text-sm leading-relaxed space-y-4">
              {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-blue-400/10 bg-slate-800/40">
              <button
                onClick={onClose}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2.5 rounded-lg transition"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { lang, changeLang, t } = useLang();

  const [showPassword, setShowPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // ── Nuevos estados ──
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError(
        lang === 'es'
          ? 'Debes aceptar los Términos y la Política de Privacidad para continuar.'
          : 'You must accept the Terms and Privacy Policy to continue.'
      );
      return;
    }

    setLoading(true);

    if (!email || !password) {
      setError(t('all_fields_required'));
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        lang === 'es'
          ? 'La contraseña debe tener al menos 6 caracteres'
          : 'Password must be at least 6 characters'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        setToast({ message: t('welcome'), type: 'success' });
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        const errorMsg = getErrorMessage(data, lang === 'es' ? 'ES' : 'EN');
        setError(errorMsg);
        setToast({ message: errorMsg, type: 'error' });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = t('connection_error');
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
        style={{ backgroundImage: `url(${fondo})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary-950/80" />

        {/* Card */}
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-primary-900/20 backdrop-blur-lg border border-blue-400/20 rounded-2xl p-8 shadow-2xl">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img src={logo} alt="Logo" className="h-16 object-contain" />
            </div>

            {/* Títulos */}
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              {t('login')}
            </h1>
            <p className="text-gray-400 text-center text-sm mb-8">
              {lang === 'es' ? 'Bienvenido al Sistema de Gestión' : 'Welcome to Management System'}
            </p>

            {/* Error */}
            {error && (
              <motion.div
                className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-3">
                  {t('email')}
                </label>
                <div className="relative">
                  <input
                    type={showEmail ? 'text' : 'password'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('email_placeholder')}
                    className="w-full bg-slate-800/50 border border-blue-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/60 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmail(!showEmail)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showEmail ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition"
                >
                  {lang === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
                </button>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-3">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password_placeholder')}
                    className="w-full bg-slate-800/50 border border-blue-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/60 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ── CASILLA DE TÉRMINOS Y CONDICIONES ── */}
              <div className="flex items-start gap-3 pt-1">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                    className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all duration-200 ${
                      acceptedTerms
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'bg-transparent border-blue-400/40 hover:border-cyan-400'
                    }`}
                  >
                    {acceptedTerms && (
                      <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <label
                  htmlFor="accept-terms"
                  className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none"
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                >
                  {lang === 'es' ? 'Acepto los ' : 'I accept the '}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition"
                  >
                    {lang === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions'}
                  </button>
                  {lang === 'es' ? ' y la ' : ' and the '}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowPrivacyModal(true); }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition"
                  >
                    {lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
                  </button>
                </label>
              </div>

              {/* Botón submit */}
              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? t('signing_in') : t('sign_in')}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-blue-400/10">
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={() => changeLang('es')}
                  className={`px-3 py-1 text-sm font-semibold transition ${lang === 'es' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Español
                </button>
                <span className="text-gray-500">•</span>
                <button
                  onClick={() => changeLang('en')}
                  className={`px-3 py-1 text-sm font-semibold transition ${lang === 'en' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                  English
                </button>
              </div>

              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 w-full text-gray-400 hover:text-white text-sm transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('back_home')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── MODAL TÉRMINOS Y CONDICIONES ── */}
      <PolicyModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title={lang === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions'}
        icon={FileText}
      >
        <p className="text-gray-200 font-semibold">1. Aceptación de los términos</p>
        <p>Al acceder y utilizar este sistema, usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo, por favor no utilice el sistema.</p>

        <p className="text-gray-200 font-semibold">2. Uso del sistema</p>
        <p>Este sistema es de uso exclusivo para miembros autorizados de la organización. Queda prohibido compartir credenciales de acceso con terceros o utilizarlo para fines no autorizados.</p>

        <p className="text-gray-200 font-semibold">3. Responsabilidades del usuario</p>
        <p>El usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. Debe notificar de inmediato cualquier uso no autorizado.</p>

        <p className="text-gray-200 font-semibold">4. Propiedad intelectual</p>
        <p>Todo el contenido, funcionalidades y datos del sistema son propiedad de la organización y están protegidos por las leyes de propiedad intelectual aplicables.</p>

        <p className="text-gray-200 font-semibold">5. Modificaciones</p>
        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor al ser publicados en el sistema.</p>

        <p className="text-gray-200 font-semibold">6. Contacto</p>
        <p>Para cualquier consulta sobre estos términos, comuníquese con el administrador del sistema.</p>
      </PolicyModal>

      {/* ── MODAL POLÍTICA DE PRIVACIDAD ── */}
      <PolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title={lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
        icon={Shield}
      >
        <p className="text-gray-200 font-semibold">1. Información que recopilamos</p>
        <p>Recopilamos información personal como nombre, correo electrónico y datos de actividad dentro del sistema, necesarios para el funcionamiento de la plataforma.</p>

        <p className="text-gray-200 font-semibold">2. Uso de la información</p>
        <p>La información recopilada se utiliza exclusivamente para gestionar su acceso al sistema, mejorar la experiencia del usuario y cumplir con las obligaciones de la organización.</p>

        <p className="text-gray-200 font-semibold">3. Protección de datos</p>
        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra accesos no autorizados, pérdidas o alteraciones.</p>

        <p className="text-gray-200 font-semibold">4. Compartir información</p>
        <p>No vendemos, comercializamos ni transferimos su información personal a terceros, salvo requerimiento legal o con su consentimiento explícito.</p>

        <p className="text-gray-200 font-semibold">5. Sus derechos</p>
        <p>Usted tiene derecho a acceder, corregir o solicitar la eliminación de sus datos personales. Para ejercer estos derechos, contacte al administrador del sistema.</p>

        <p className="text-gray-200 font-semibold">6. Retención de datos</p>
        <p>Conservamos sus datos mientras sea miembro activo de la organización o según lo requiera la ley aplicable.</p>

        <p className="text-gray-200 font-semibold">7. Cambios a esta política</p>
        <p>Podemos actualizar esta política periódicamente. Le notificaremos sobre cambios significativos a través del sistema.</p>
      </PolicyModal>
    </>
  );
}