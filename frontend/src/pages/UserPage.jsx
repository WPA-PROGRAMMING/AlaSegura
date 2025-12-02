// src/pages/UserPage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';

export default function UserPage({ user, onLogout }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rideRequest, setRideRequest] = useState({
    pickupLocation: '',
    destination: '',
  });

  // Cargar viajes
  const fetchRides = async () => {
    try {
      const res = await api.get('/rides/user');
      setRides(res.data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudieron cargar tus viajes');
    }
  };

  // Manejo de notificaciones desde el chofer
  const handleStatusUpdate = (updatedRide) => {
    setRides(prev => 
      prev.map(ride => 
        ride._id === updatedRide._id ? updatedRide : ride
      )
    );
  };

  const handleCancel = (cancelledRide) => {
    setRides(prev =>
      prev.map(ride =>
        ride._id === cancelledRide._id ? cancelledRide : ride
      )
    );
  };

  // Conectar WebSockets
  useSocket(user, null, handleStatusUpdate, handleCancel);

  // Cargar historial al inicio
  useEffect(() => {
    fetchRides();
  }, []);

  // Solicitar nuevo viaje
  const handleRequestRide = async (e) => {
    e.preventDefault();
    if (!rideRequest.pickupLocation.trim() || !rideRequest.destination.trim()) {
      setError('Ambos campos son obligatorios');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/rides', rideRequest);
      setSuccess('¡Viaje solicitado! Espera la confirmación del chofer.');
      setRideRequest({ pickupLocation: '', destination: '' });
      fetchRides(); // Actualizar historial inmediatamente
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al solicitar el viaje';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Formatear estado para mostrar
  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      accepted: 'Aceptado',
      'en-route': 'En camino',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      'en-route': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">AlaSegura - Usuario</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
        >
          Salir
        </button>
      </nav>

      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Solicitar un viaje</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        <form onSubmit={handleRequestRide} className="space-y-4">
          <input
            type="text"
            placeholder="Punto de partida"
            value={rideRequest.pickupLocation}
            onChange={(e) => setRideRequest({ ...rideRequest, pickupLocation: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            placeholder="Destino"
            value={rideRequest.destination}
            onChange={(e) => setRideRequest({ ...rideRequest, destination: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Solicitando...' : 'Pedir viaje'}
          </button>
        </form>

        {/* Historial y viajes actuales */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Tus viajes</h3>
          {rides.length === 0 ? (
            <p className="text-gray-600">Aún no has solicitado ningún viaje.</p>
          ) : (
            <div className="space-y-5">
              {rides.map((ride) => (
                <div key={ride._id} className="bg-white p-5 rounded shadow">
                  <p><strong>Origen:</strong> {ride.pickupLocation}</p>
                  <p><strong>Destino:</strong> {ride.destination}</p>

                  {/* Mostrar info del chofer y vehículo SOLO si el viaje fue aceptado */}
                  {ride.status !== 'pending' && ride.driver && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p><strong>Chofer:</strong> {ride.driver.name} ({ride.driver.phone})</p>
                      {ride.vehicle && (
                        <p><strong>Vehículo:</strong> {ride.vehicle.plate} – {ride.vehicle.brand} {ride.vehicle.model}</p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ride.status)}`}>
                      {getStatusLabel(ride.status)}
                    </span>

                    <span className="text-xs text-gray-500">
                      {new Date(ride.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Botón de cancelar (solo si es posible) */}
                  {['pending', 'accepted', 'en-route'].includes(ride.status) && (
                    <button
                      onClick={async () => {
                        if (window.confirm('¿Cancelar este viaje?')) {
                          try {
                            await api.patch(`/rides/${ride._id}/cancel`);
                            fetchRides(); // Actualizar localmente (aunque WebSockets ya lo haga)
                          } catch (err) {
                            alert('No se pudo cancelar el viaje');
                          }
                        }
                      }}
                      className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancelar viaje
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}