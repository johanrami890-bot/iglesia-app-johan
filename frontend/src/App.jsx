import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider, useLang } from './context/LangContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './styles/globals.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Tareas from './pages/Tareas';
import Asignaciones from './pages/Asignaciones';
import Solicitudes from './pages/Solicitudes';

// Layout Routes with Header and Sidebar
const LayoutRoutes = () => (
  <>
    <Header />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-primary-950 min-h-screen">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/asignaciones" element={<Asignaciones />} />
          <Route path="/solicitudes" element={<Solicitudes />} />
        </Routes>
      </main>
    </div>
  </>
);

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLang();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
          <p className="text-cyan-400 font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/*" element={isAuthenticated ? <LayoutRoutes /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <AppContent />
      </LangProvider>
    </AuthProvider>
  );
}

export default App;
