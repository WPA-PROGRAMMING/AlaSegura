// src/components/auth/OtpForExistingUser.jsx
import { useState } from 'react';
import api from '../../services/api';

export default function OtpForExistingUser({ phone, onLoginSuccess, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Solo enviamos phone y otp
      const res = await api.post('/auth/verify-otp', { phone, otp });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Código incorrecto');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button type="button" onClick={onBack} className="text-blue-600 mb-4">← Cambiar número</button>
      <h2 className="text-2xl font-bold text-gray-800">Iniciar sesión</h2>
      <p className="text-gray-600">Ingresa el código enviado a +57 {phone}</p>
      {error && <p className="text-red-600">{error}</p>}
      
      <input
        type="text"
        placeholder="Código (6 dígitos)"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        className="w-full p-3 border border-gray-300 rounded"
        maxLength={6}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
      >
        {loading ? 'Iniciando...' : 'Ingresar'}
      </button>
    </form>
  );
}