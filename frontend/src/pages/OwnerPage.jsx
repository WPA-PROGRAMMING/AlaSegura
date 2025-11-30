// src/pages/OwnerPage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function OwnerPage({ user, onLogout }) {
  // Protección básica
  if (!user) {
    return <div className="p-6 text-red-600">Error: usuario no disponible.</div>;
  }

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    brand: '',
    model: '',
    color: '',
    year: '',
  });

  // Cargar vehículos y choferes al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/users/drivers'),
        ]);
        setVehicles(vehiclesRes.data);
        setDrivers(driversRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos. Verifica tu conexión.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Registrar nuevo vehículo
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setError('');

    // Validación simple del año
    const currentYear = new Date().getFullYear();
    if (newVehicle.year < 1980 || newVehicle.year > currentYear + 1) {
      setError('El año del vehículo no es válido.');
      return;
    }

    try {
      await api.post('/vehicles', newVehicle);
      setNewVehicle({ plate: '', brand: '', model: '', color: '', year: '' });
      // Recargar vehículos
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Error al crear vehículo:', err);
      setError('Error al registrar el vehículo. ¿La placa ya existe?');
    }
  };

  // Asignar chofer a un vehículo
  const handleAssignDriver = async (vehicleId, driverId) => {
    if (!driverId) return;

    try {
      await api.patch(`/vehicles/${vehicleId}/assign-driver`, { driverId });
      // Recargar vehículos para ver la asignación inmediata
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Error al asignar chofer:', err);
      alert('No se pudo asignar el chofer. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegación */}
      <nav className="bg-blue-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">AlaSegura - Dueño</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-medium"
        >
          Salir
        </button>
      </nav>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis vehículos</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {/* Formulario: Registrar nuevo vehículo */}
        <div className="bg-white p-5 rounded shadow mb-8">
          <h3 className="font-semibold text-lg text-gray-700 mb-3">Registrar nuevo vehículo</h3>
          <form onSubmit={handleCreateVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Placa (ej. ABC123)"
              value={newVehicle.plate}
              onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Marca (ej. Toyota)"
              value={newVehicle.brand}
              onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Modelo (ej. Corolla)"
              value={newVehicle.model}
              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Color (ej. Rojo)"
              value={newVehicle.color}
              onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Año"
              min="1980"
              max={new Date().getFullYear() + 1}
              value={newVehicle.year}
              onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition"
            >
              Registrar vehículo
            </button>
          </form>
        </div>

        {/* Lista de vehículos */}
        <div className="space-y-5">
          {loading ? (
            <p className="text-gray-600">Cargando tus vehículos y choferes...</p>
          ) : vehicles.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center">
              <p className="text-gray-600">No tienes vehículos registrados todavía.</p>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white p-5 rounded shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">
                      {vehicle.plate} – {vehicle.brand} {vehicle.model}
                    </h4>
                    <p className="text-gray-600">{vehicle.color}, {vehicle.year}</p>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <p className="text-sm text-gray-700">
                      Chofer asignado:
                      <span className="ml-2 font-medium">
                        {vehicle.assignedDriver
                          ? `${vehicle.assignedDriver.name} (${vehicle.assignedDriver.phone})`
                          : 'Ninguno'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Selector de choferes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asignar chofer:
                  </label>
                  <select
                    onChange={(e) => handleAssignDriver(vehicle._id, e.target.value)}
                    className="w-full md:w-80 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    defaultValue={vehicle.assignedDriver?._id || ''}
                  >
                    <option value="">Seleccionar chofer...</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} ({driver.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}