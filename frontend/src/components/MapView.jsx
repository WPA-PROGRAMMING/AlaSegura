// src/components/MapView.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix crítico para Vite + Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ driverLocation, pickup = { lat: 4.6097, lng: -74.0817 }, destination = { lat: 4.62, lng: -74.1 } }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});

  useEffect(() => {
    if (!mapRef.current) return;

    // Verificar que las coordenadas sean válidas
    const isValidCoord = (coord) => coord && typeof coord.lat === 'number' && typeof coord.lng === 'number';
    
    if (!isValidCoord(pickup) || !isValidCoord(destination)) {
      console.error('Coordenadas inválidas para el mapa');
      return;
    }

    // Crear mapa
    mapInstance.current = L.map(mapRef.current).setView([pickup.lat, pickup.lng], 13);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    // Añadir marcadores iniciales
    if (isValidCoord(pickup)) {
      markers.current.pickup = L.marker([pickup.lat, pickup.lng], {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      })
      .addTo(mapInstance.current)
      .bindPopup('Punto de partida')
      .openPopup();
    }

    if (isValidCoord(destination)) {
      markers.current.destination = L.marker([destination.lat, destination.lng], {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      })
      .addTo(mapInstance.current)
      .bindPopup('Destino');
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, [pickup, destination]);

  // Actualizar ubicación del chofer
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !driverLocation) return;

    // Eliminar marcador anterior del chofer
    if (markers.current.driver) {
      map.removeLayer(markers.current.driver);
    }

    // Añadir nuevo marcador
    markers.current.driver = L.marker([driverLocation.lat, driverLocation.lng], {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        className: 'driver-marker'
      }),
      title: 'Tu chofer'
    })
    .addTo(map)
    .bindPopup('Tu chofer está aquí')
    .openPopup();

    // Centrar el mapa en el chofer
    map.setView([driverLocation.lat, driverLocation.lng], 14);

    console.log('Mapa actualizado con nueva posición del chofer');
  }, [driverLocation]);

  return (
    <div className="border rounded-lg overflow-hidden shadow-md">
      <div 
        ref={mapRef} 
        className="w-full h-80 bg-gray-200 flex items-center justify-center"
        style={{ minHeight: '320px' }}
      >
        <p className="text-gray-500 text-sm">Cargando mapa...</p>
      </div>
      <div className="p-2 bg-gray-50 text-xs text-gray-600 border-t">
        Mapa proporcionado por <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenStreetMap</a>
      </div>
    </div>
  );
}