// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import DriverPage from './pages/DriverPage';
import OwnerPage from './pages/OwnerPage';

// Componente para redirigir según rol
function RoleRedirect({ user }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  let targetPath = '/';
  if (user.role === 'usuario') targetPath = '/user';
  else if (user.role === 'chofer') targetPath = '/driver';
  else if (user.role === 'dueño') targetPath = '/owner';

  // Solo redirige si no estamos ya en el destino
  if (location.pathname !== targetPath) {
    return <Navigate to={targetPath} replace />;
  }

  return null; // ya estamos en la ruta correcta
}

// Componente interno con enrutamiento
function AppRoutes({ user, onLogin, onLogout }) {
  return (
    <Routes>
      <Route path="/" element={<AuthPage onLogin={onLogin} />} />
      
      <Route 
        path="/user/*" 
        element={user?.role === 'usuario' ? <UserPage user={user} onLogout={onLogout} /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/driver/*" 
        element={user?.role === 'chofer' ? <DriverPage user={user} onLogout={onLogout} /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/owner/*" 
        element={user?.role === 'dueño' ? <OwnerPage user={user} onLogout={onLogout} /> : <Navigate to="/" replace />} 
      />
      
      {/* Redirección post-login */}
      <Route path="*" element={<RoleRedirect user={user} />} />
    </Routes>
  );
}

// Componente raíz
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Error parsing user data', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  );
}