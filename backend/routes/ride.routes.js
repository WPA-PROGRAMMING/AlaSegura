// backend/routes/ride.routes.js
const express = require('express');
const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/rides → Solicitar viaje
router.post('/', protect, async (req, res) => {
  try {
    const { pickupLocation, destination } = req.body;

    if (!pickupLocation || !destination) {
      return res.status(400).json({ error: 'Origen y destino son requeridos' });
    }

    if (req.user.role !== 'usuario') {
      return res.status(403).json({ error: 'Solo los usuarios pueden solicitar viajes' });
    }

    // Buscar vehículo con chofer asignado y activo
    const vehicle = await Vehicle.findOne({
      assignedDriver: { $ne: null },
      isActive: true,
    }).populate('assignedDriver', '_id phone');

    if (!vehicle) {
      return res.status(404).json({ error: 'No hay vehículos con chofer disponible' });
    }

    if (!vehicle.assignedDriver || !vehicle.assignedDriver._id) {
      return res.status(500).json({ error: 'El vehículo seleccionado no tiene un chofer válido asignado' });
    }

    const driverId = vehicle.assignedDriver._id;

    // Crear el viaje
    const ride = new Ride({
      user: req.user.id,
      driver: driverId,
      vehicle: vehicle._id,
      pickupLocation,
      destination,
      status: 'pending',
    });

    await ride.save();

    // Poblar datos para la respuesta
    const populatedRide = await Ride.findById(ride._id)
      .populate('user', 'name phone')
      .populate('driver', 'name phone')
      .populate('vehicle', 'plate brand model color');

    // Notificar al chofer (si Socket.IO está configurado)
    if (typeof global.emitNotification === 'function' && vehicle.assignedDriver.phone) {
      global.emitNotification(vehicle.assignedDriver.phone, 'new_ride', {
        ride: populatedRide,
        message: '¡Nuevo viaje solicitado!',
      });
    }

    res.status(201).json({
      message: 'Viaje solicitado. Esperando confirmación del chofer.',
      ride: populatedRide,
    });
  } catch (error) {
    console.error('Error al crear viaje:', error);
    res.status(500).json({ error: 'Error al solicitar el viaje' });
  }
});

// PATCH /api/rides/:id/status → Actualizar estado (solo chofer asignado)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const rideId = req.params.id;

    const allowedTransitions = {
      pending: ['accepted'],
      accepted: ['en-route'],
      'en-route': ['completed'],
      completed: [],
      cancelled: [],
    };

    const ride = await Ride.findById(rideId)
      .populate('user', 'name phone')
      .populate('driver', 'name phone')
      .populate('vehicle', 'plate brand');

    if (!ride) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    // 🔑 Comparación segura de ObjectId
    if (!ride.driver || ride.driver._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para actualizar este viaje' });
    }

    if (!allowedTransitions[ride.status]?.includes(status)) {
      return res.status(400).json({ error: `No se puede cambiar de "${ride.status}" a "${status}"` });
    }

    const updateData = { status };
    const now = new Date();
    if (status === 'accepted') updateData.acceptedAt = now;
    if (status === 'en-route') updateData.startedAt = now;
    if (status === 'completed') updateData.completedAt = now;

    ride.set(updateData);
    await ride.save();

    const updatedRide = await Ride.findById(ride._id)
      .populate('user', 'name phone')
      .populate('driver', 'name phone')
      .populate('vehicle', 'plate brand model color');

    // Notificar al usuario
    if (typeof global.emitNotification === 'function' && ride.user?.phone) {
      global.emitNotification(ride.user.phone, 'ride_status_updated', {
        ride: updatedRide,
        message: `Tu viaje ahora está: ${status}`,
      });
    }

    res.json({
      message: 'Estado del viaje actualizado',
      ride: updatedRide,
    });
  } catch (error) {
    console.error('Error al actualizar estado del viaje:', error);
    res.status(500).json({ error: 'Error al actualizar el viaje' });
  }
});

// PATCH /api/rides/:id/cancel → Cancelar viaje
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('driver', 'name phone')
      .populate('vehicle', 'plate brand model color');

    if (!ride) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    const isUser = ride.user && ride.user._id.toString() === req.user.id;
    const isDriver = ride.driver && ride.driver._id.toString() === req.user.id;

    if (!isUser && !isDriver) {
      return res.status(403).json({ error: 'No autorizado para cancelar este viaje' });
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({ error: 'El viaje ya ha finalizado o fue cancelado' });
    }

    ride.status = 'cancelled';
    await ride.save();

    // Notificar a la otra parte
    if (typeof global.emitNotification === 'function') {
      const otherPhone = isUser && ride.driver?.phone ? ride.driver.phone :
                        isDriver && ride.user?.phone ? ride.user.phone : null;
      
      if (otherPhone) {
        global.emitNotification(otherPhone, 'ride_cancelled', {
          ride: ride,
          message: 'El viaje ha sido cancelado.',
        });
      }
    }

    res.json({
      message: 'Viaje cancelado exitosamente',
      ride: ride,
    });
  } catch (error) {
    console.error('Error al cancelar el viaje:', error);
    res.status(500).json({ error: 'Error al cancelar el viaje' });
  }
});

// GET /api/rides/user → Historial del usuario
router.get('/user', protect, async (req, res) => {
  try {
    if (req.user.role !== 'usuario') {
      return res.status(403).json({ error: 'Acceso denegado: solo los usuarios pueden ver su historial' });
    }

    const rides = await Ride.find({ user: req.user.id })
      .populate('driver', 'name phone')
      .populate('vehicle', 'plate brand model color')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error('Error al cargar historial del usuario:', error);
    res.status(500).json({ error: 'Error al cargar los viajes' });
  }
});

// GET /api/rides/driver → Viajes del chofer
router.get('/driver', protect, async (req, res) => {
  try {
    if (req.user.role !== 'chofer') {
      return res.status(403).json({ error: 'Acceso denegado: solo los choferes pueden ver sus viajes' });
    }

    const rides = await Ride.find({ driver: req.user.id })
      .populate('user', 'name phone')
      .populate('vehicle', 'plate brand model color')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error('Error al cargar viajes del chofer:', error);
    res.status(500).json({ error: 'Error al cargar los viajes asignados' });
  }
});

module.exports = router;