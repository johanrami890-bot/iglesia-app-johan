import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Toast from '../components/Toast';
import { validateEmail, getErrorMessage } from '../utils/validation';
import logo from '../assets/logo.jpg';
import fondo from '../assets/fondo.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!email || !password) {
      const msg = t('all_fields_required');
      setError(msg);
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      const msg = 'Email inválido';
      setError(msg);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      const msg = lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters';
      setError(msg);
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
        setToast({
          message: t('welcome'),
          type: 'success',
        });
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        const errorMsg = getErrorMessage(data, lang === 'es' ? 'ES' : 'EN');
        setError(errorMsg);
        setToast({
          message: errorMsg,
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = t('connection_error');
      setError(msg);
      setToast({
        message: msg,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url(${fondo})`,
      }}
    >
      {/* Overlay azul marino oscuro */}
      <div className="absolute inset-0 bg-primary-950/80"></div>

      {/* Contenedor Login */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Card con Glassmorphism - Transparente */}
        <div className="bg-primary-900/20 backdrop-blur-lg border border-blue-400/20 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Logo" className="h-16 object-contain" />
          </div>

          {/* Headers */}
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            {t('login')}
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            {lang === 'es' ? 'Bienvenido al Sistema de Gestión' : 'Welcome to Management System'}
          </p>

          {/* Error Message */}
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showEmail ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading
                ? t('signing_in')
                : t('sign_in')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-blue-400/10">
            {/* Language Selector */}
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => changeLang('es')}
                className={`px-3 py-1 text-sm font-semibold transition ${lang === 'es' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Español
              </button>
              <span className="text-gray-500">•</span>
              <button
                onClick={() => changeLang('en')}
                className={`px-3 py-1 text-sm font-semibold transition ${lang === 'en' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                  }`}
              >
                English
              </button>
            </div>

            {/* Back to Home */}
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
