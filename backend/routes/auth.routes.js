// backend/routes/auth.routes.js
const express = require('express');
const User = require('../models/User');
const { storeOtp, getOtp } = require('../utils/otpStore');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// 1. Solicitar OTP (simulado)
router.post('/request-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\d{10,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Número de teléfono inválido' });
  }

  // Generar OTP aleatorio de 6 dígitos
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Guardar en "almacén temporal"
  storeOtp(phone, otp);

  console.log(`===> OTP para ${phone}: ${otp}`); // ← Solo en desarrollo

  res.json({ message: 'OTP enviado (simulado)', phone });
});

// 2. Verificar OTP y registrar/iniciar sesión
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, role } = req.body;

  if (!phone || !otp || !role || !name) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  if (!['usuario', 'chofer', 'dueño'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  const storedOtp = getOtp(phone);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ error: 'OTP inválido o expirado' });
  }

  // Buscar o crear usuario
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, name, role });
  } else if (user.role !== role) {
    return res.status(400).json({ error: 'Este número ya está registrado con otro rol' });
  }

  // Generar token
  const token = generateToken(user._id, user.role);

  res.json({
    message: 'Autenticación exitosa',
    token,
    user: {
      id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  });
});

module.exports = router;