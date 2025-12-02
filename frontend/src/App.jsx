// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import DriverPage from './pages/DriverPage';
import OwnerPage from './pages/OwnerPage';

// Componente para manejar la redirección basada en rol
function RoleBasedRedirect({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const rolePath = user.role === 'usuario' ? '/user' : 
                       user.role === 'chofer' ? '/driver' : 
                       '/owner';
      navigate(rolePath, { replace: true });
    }
  }, [user, navigate]);

  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role && ['usuario', 'chofer', 'dueño'].includes(parsedUser.role)) {
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
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
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
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <RoleBasedRedirect user={user} /> : <AuthPage onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/user/*" 
          element={user?.role === 'usuario' ? <UserPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/driver/*" 
          element={user?.role === 'chofer' ? <DriverPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/owner/*" 
          element={user?.role === 'dueño' ? <OwnerPage user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />} 
        />
        
        <Route path="*" element={<Navigate to={user ? `/${user.role === 'usuario' ? 'user' : user.role === 'chofer' ? 'driver' : 'owner'}` : '/'} replace />} />
      </Routes>
    </Router>
  );
}