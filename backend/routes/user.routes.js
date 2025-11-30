// backend/routes/user.routes.js
const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/drivers → Lista de choferes (solo para usuarios autenticados)
router.get('/drivers', protect, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'chofer' }, 'name phone'); // solo campos necesarios
    res.json(drivers);
  } catch (error) {
    console.error('Error al obtener choferes:', error);
    res.status(500).json({ error: 'Error al cargar los choferes' });
  }
});

module.exports = router;