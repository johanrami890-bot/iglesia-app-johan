import { useLang } from '../context/LangContext';

export default function Footer() {
  const { t } = useLang();
  
  return (
    <footer className="bg-slate-950 border-t border-blue-400/20 py-4 px-6 text-center">
      <p className="text-gray-500 text-xs">
        {t('rights_reserved')} © {new Date().getFullYear()} Sistema de Gestión Eclesiástica
      </p>
    </footer>
  );
}
