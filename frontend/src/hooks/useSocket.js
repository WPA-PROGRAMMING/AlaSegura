// src/hooks/useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (user, onNewRide, onStatusUpdate, onCancel) => {
  useEffect(() => {
    if (!user?.phone) return;

    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.emit('register', user.phone);

    socket.on('new_ride', (data) => {
      if (onNewRide) onNewRide(data.ride);
    });

    socket.on('ride_status_updated', (data) => {
      if (onStatusUpdate) onStatusUpdate(data.ride);
    });

    socket.on('ride_cancelled', (data) => {
      if (onCancel) onCancel(data.ride);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.phone, onNewRide, onStatusUpdate, onCancel]);
};