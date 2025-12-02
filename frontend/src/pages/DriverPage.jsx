// src/pages/DriverPage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';

export default function DriverPage({ user, onLogout }) {
  const [rides, setRides] = useState([]);
  const [updating, setUpdating] = useState({});

  const fetchRides = async () => {
    try {
      const res = await api.get('/rides/driver');
      setRides(res.data);
    } catch (err) {
      console.error('Error al cargar viajes:', err);
    }
  };

  const handleNewRide = () => fetchRides();
  const handleStatusChange = () => fetchRides();
  const handleCancel = () => fetchRides();

  useSocket(user, handleNewRide, handleStatusChange, handleCancel);

  useEffect(() => {
    fetchRides(); // carga inicial

    // Actualizar cada 2 segundos
    const interval = setInterval(() => {
      fetchRides();
    }, 2000); // 2,000 ms = 2 segundos

    // Limpiar intervalo al salir
    return () => clearInterval(interval);
  }, []);

  const updateRideStatus = async (rideId, newStatus) => {
    setUpdating(prev => ({ ...prev, [rideId]: true }));
    try {
      await api.patch(`/rides/${rideId}/status`, { status: newStatus });
      fetchRides();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el viaje');
    } finally {
      setUpdating(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const getStatusText = (status) => {
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
      <nav className="bg-orange-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">AlaSegura - Chofer</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
        >
          Salir
        </button>
      </nav>

      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tus viajes</h2>

        {rides.length === 0 ? (
          <p className="text-gray-600">No tienes viajes asignados.</p>
        ) : (
          <div className="space-y-5">
            {rides.map((ride) => (
              <div key={ride._id} className="bg-white p-5 rounded shadow">
                <div>
                  <p><strong>Usuario:</strong> {ride.user?.name} ({ride.user?.phone})</p>
                  <p><strong>Origen:</strong> {ride.pickupLocation}</p>
                  <p><strong>Destino:</strong> {ride.destination}</p>
                  <p>
                    <strong>Estado:</strong>{' '}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 inline-block ${getStatusColor(ride.status)}`}>
                      {getStatusText(ride.status)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(ride.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ride.status === 'pending' && (
                    <button
                      onClick={() => updateRideStatus(ride._id, 'accepted')}
                      disabled={updating[ride._id]}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                      {updating[ride._id] ? 'Aceptando...' : 'Aceptar viaje'}
                    </button>
                  )}

                  {ride.status === 'accepted' && (
                    <button
                      onClick={() => updateRideStatus(ride._id, 'en-route')}
                      disabled={updating[ride._id]}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                      {updating[ride._id] ? 'Actualizando...' : 'Llegué al origen'}
                    </button>
                  )}

                  {ride.status === 'en-route' && (
                    <button
                      onClick={() => updateRideStatus(ride._id, 'completed')}
                      disabled={updating[ride._id]}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                      {updating[ride._id] ? 'Finalizando...' : 'Finalizar viaje'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}