// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

// Rutas
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const userRoutes = require('./routes/user.routes');
const rideRoutes = require('./routes/ride.routes');

const app = express();

// Crear servidor HTTP para Socket.IO
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL del frontend en desarrollo
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Mapa para asociar número de teléfono con socketId
const userSockets = new Map();

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  console.log('Nuevo cliente WebSocket conectado:', socket.id);

  // Registrar usuario por número de teléfono
  socket.on('register', (phone) => {
    if (phone) {
      userSockets.set(phone, socket.id);
      console.log(`Teléfono ${phone} registrado con socket ${socket.id}`);
    }
  });

  // Limpiar al desconectar
  socket.on('disconnect', () => {
    for (const [phone, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(phone);
        console.log(`Teléfono ${phone} desconectado`);
        break;
      }
    }
  });
});

// Función global para emitir notificaciones a un usuario por su teléfono
const emitNotification = (phone, event, data) => {
  const socketId = userSockets.get(phone);
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`Notificación enviada a ${phone}: ${event}`, data);
  } else {
    console.log(`Usuario con teléfono ${phone} no está conectado vía WebSocket`);
  }
};

// Hacer disponible globalmente para usar en rutas
global.emitNotification = emitNotification;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Rutas de la API
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores globales (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor Express + WebSocket corriendo en http://localhost:${PORT}`);
});