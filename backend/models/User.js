// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10,}$/, 'Número de teléfono inválido (10 dígitos)'],
  },
  role: {
    type: String,
    enum: ['usuario', 'chofer', 'dueño'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Índice para búsquedas rápidas
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);