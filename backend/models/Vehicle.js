// backend/models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{6,8}$/, 'Placa inválida (6-8 caracteres alfanuméricos)'],
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1980,
    max: new Date().getFullYear() + 1,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo User
    required: true,
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia a un chofer
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Índice para búsquedas por dueño
vehicleSchema.index({ owner: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);