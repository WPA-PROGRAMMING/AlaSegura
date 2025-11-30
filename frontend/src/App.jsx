// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import DriverPage from './pages/DriverPage';
import OwnerPage from './pages/OwnerPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
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
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <AuthPage onLogin={handleLogin} />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/user/*" element={user.role === 'usuario' ? <UserPage onLogout={handleLogout} user={user} /> : <Navigate to="/user" />} />
        <Route path="/driver/*" element={user.role === 'chofer' ? <DriverPage onLogout={handleLogout} user={user} /> : <Navigate to="/driver" />} />
        <Route path="/owner/*" element={user.role === 'dueño' ? <OwnerPage onLogout={handleLogout} user={user} /> : <Navigate to="/owner" />} />
        <Route path="*" element={<Navigate to={`/${user.role === 'usuario' ? 'user' : user.role === 'chofer' ? 'driver' : 'owner'}`} />} />
      </Routes>
    </Router>
  );
}

export default App;