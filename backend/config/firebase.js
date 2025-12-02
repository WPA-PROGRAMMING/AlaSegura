// backend/config/firebase.js
const admin = require('firebase-admin');

// Solo inicializa si no está ya inicializado
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // o usa un archivo de servicio
    projectId: 'alasegura-notifications', // ← tu project ID
  });
}

module.exports = admin;