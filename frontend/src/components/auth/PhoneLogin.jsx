// src/components/auth/PhoneLogin.jsx
import { useState } from 'react';
import api from '../../services/api';

export default function PhoneLogin({ onOtpRequested }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10,15}$/.test(phone)) {
      setError('Número de teléfono inválido (10-15 dígitos)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/request-otp', { phone });
      onOtpRequested(phone);
    } catch (err) {
      setError('Error al enviar OTP. Intenta de nuevo.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Iniciar sesión</h2>
      {error && <p className="text-red-600">{error}</p>}
      <input
        type="text"
        placeholder="Número de teléfono (ej. 3001234567)"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={15}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar código'}
      </button>
    </form>
  );
}