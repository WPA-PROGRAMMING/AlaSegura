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

  // Validar OTP primero
  const storedOtp = getOtp(phone);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ error: 'OTP inválido o expirado' });
  }

  // Buscar si el usuario ya existe
  let user = await User.findOne({ phone });

  if (user) {
    // Usuario existente: no se necesita name ni role
    const token = generateToken(user._id, user.role);
    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });
  }

  // Usuario nuevo: se requieren name y role
  if (!name || !role) {
    return res.status(400).json({ error: 'Nombre y rol son requeridos para nuevos usuarios' });
  }

  if (!['usuario', 'chofer', 'dueño'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  // Crear nuevo usuario
  user = await User.create({ phone, name, role });
  const token = generateToken(user._id, user.role);

  res.json({
    message: 'Registro y autenticación exitosos',
    token,
    user: {
      id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  });
});

// Verificar si un número ya está registrado
router.get('/check-phone/:phone', async (req, res) => {
  const { phone } = req.params;
  if (!/^\d{10,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Número inválido' });
  }
  const exists = await User.exists({ phone });
  res.json({ exists });
});

module.exports = router;