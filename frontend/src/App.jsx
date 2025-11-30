// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/health');
        setBackendStatus(res.data);
      } catch (error) {
        console.error('Error al conectar con backend:', error);
        setBackendStatus({ error: 'No se pudo conectar al backend' });
      }
    };
    fetchBackend();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">AlaSegura</h1>
      {backendStatus ? (
        <div className="bg-white p-6 rounded shadow">
          <p className="text-green-600 font-semibold">Backend: {backendStatus.message}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}

export default App;