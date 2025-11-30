// backend/routes/vehicle.routes.js
const express = require('express');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// POST /api/vehicles → Registrar un vehículo (solo dueños)
router.post('/', protect, authorizeRoles('dueño'), async (req, res) => {
  try {
    const { plate, brand, model, color, year } = req.body;

    // Validaciones básicas
    if (!plate || !brand || !model || !color || !year) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar que el usuario es dueño (ya lo hace authorizeRoles, pero doble check)
    const owner = await User.findById(req.user.id);
    if (!owner || owner.role !== 'dueño') {
      return res.status(403).json({ error: 'Solo los dueños pueden registrar vehículos' });
    }

    // Crear vehículo
    const vehicle = await Vehicle.create({
      plate,
      brand,
      model,
      color,
      year,
      owner: owner._id,
    });

    res.status(201).json({
      message: 'Vehículo registrado con éxito',
      vehicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'La placa ya está registrada' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el vehículo' });
  }
});

// GET /api/vehicles → Listar vehículos del dueño autenticado
router.get('/', protect, authorizeRoles('dueño'), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).populate(
      'assignedDriver',
      'name phone'
    );
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los vehículos' });
  }
});

// GET /api/vehicles/:id → Obtener un vehículo específico (solo si es del dueño)
router.get('/:id', protect, authorizeRoles('dueño'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }).populate('assignedDriver', 'name phone');

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado o no autorizado' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el vehículo' });
  }
});

// PUT /api/vehicles/:id → Actualizar vehículo
router.put('/:id', protect, authorizeRoles('dueño'), async (req, res) => {
  try {
    const { plate, brand, model, color, year } = req.body;

    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Actualizar campos
    vehicle.plate = plate || vehicle.plate;
    vehicle.brand = brand || vehicle.brand;
    vehicle.model = model || vehicle.model;
    vehicle.color = color || vehicle.color;
    vehicle.year = year || vehicle.year;

    await vehicle.save();

    res.json({ message: 'Vehículo actualizado', vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'La placa ya está en uso' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el vehículo' });
  }
});

// DELETE /api/vehicles/:id → Eliminar vehículo
router.delete('/:id', protect, authorizeRoles('dueño'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json({ message: 'Vehículo eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el vehículo' });
  }
});

// PATCH /api/vehicles/:id/assign-driver → Asignar chofer a vehículo
router.patch('/:id/assign-driver', protect, authorizeRoles('dueño'), async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: 'ID del chofer es requerido' });
    }

    // Verificar que el vehículo exista y pertenezca al dueño
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado o no autorizado' });
    }

    // Verificar que el chofer exista y sea de rol "chofer"
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Chofer no encontrado' });
    }

    if (driver.role !== 'chofer') {
      return res.status(400).json({ error: 'El usuario seleccionado no es un chofer' });
    }

    // Asignar chofer
    vehicle.assignedDriver = driver._id;
    await vehicle.save();

    // Devolver vehículo con datos del chofer
    const vehiclePopulated = await Vehicle.findById(vehicle._id)
      .populate('owner', 'name phone')
      .populate('assignedDriver', 'name phone');

    res.json({
      message: 'Chofer asignado exitosamente',
      vehicle: vehiclePopulated,
    });
  } catch (error) {
    console.error('Error al asignar chofer:', error);
    res.status(500).json({ error: 'Error al asignar el chofer' });
  }
});

module.exports = router;