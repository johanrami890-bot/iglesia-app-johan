import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { motion } from 'framer-motion';
import { MapPin, LogIn } from 'lucide-react';
import logo from '../assets/logo.jpg';
import fondo from '../assets/fondo.webp';

export default function Home() {
  const navigate = useNavigate();
  const { lang, changeLang, t } = useLang();

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white relative overflow-hidden"
      style={{
        backgroundImage: `url(${fondo})`,
      }}
    >
      {/* Overlay azul marino oscuro */}
      <div className="absolute inset-0 bg-primary-950/80"></div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-12 object-contain" />
          </div>

          {/* Derecha: Selector idioma + Botón */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => changeLang(lang === 'es' ? 'en' : 'es')}
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-cyan-400 transition rounded-full border border-cyan-400/30 hover:border-cyan-400/60"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-slate-900 transition"
            >
              {t('servers_portal')}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen pt-32 pb-20 px-6 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Location Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400/30 bg-slate-900/60 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-gray-300">{t('campus_moreno')}</span>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-6xl md:text-7xl font-bold mb-4 leading-tight text-white">
              {t('united_spirit')}
            </h2>
            <h3 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-8">
              {t('spirit_purpose')}
            </h3>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t('platform_pentecostal')}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <LogIn className="w-5 h-5" />
            <span>{t('sign_in')}</span>
          </motion.button>
        </div>
      </motion.section>
      {/* Footer */}
      <footer className="absolute bottom-4 w-full text-center z-20">
        <p className="text-xs text-gray-400 opacity-60">
          © 2025 {t('app_name')}. {t('rights_reserved')}
        </p>
      </footer>
    </div>
  );
}
