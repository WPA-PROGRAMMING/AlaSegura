// src/components/auth/OtpVerification.jsx
import { useState } from 'react';
import api from '../../services/api';

export default function OtpVerification({ phone, onLoginSuccess, onBack }) {
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('usuario');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp, name, role });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err) {
      setError('Código inválido o datos incorrectos');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-blue-600 mb-4"
      >
        ← Cambiar número
      </button>
      <h2 className="text-2xl font-bold text-gray-800">Verificar código</h2>
      <p className="text-gray-600">Código enviado a +57 {phone}</p>
      {error && <p className="text-red-600">{error}</p>}
      
      <input
        type="text"
        placeholder="Código (6 dígitos)"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={6}
      />
      
      <input
        type="text"
        placeholder="Tu nombre completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="usuario">Soy pasajero</option>
        <option value="chofer">Soy chofer</option>
        <option value="dueño">Soy dueño de vehículo</option>
      </select>

      <button
        type="submit"
        disabled={loading || !name}
        className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Verificando...' : 'Ingresar'}
      </button>
    </form>
  );
}