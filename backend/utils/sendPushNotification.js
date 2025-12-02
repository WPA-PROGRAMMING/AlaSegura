// backend/utils/sendPushNotification.js
const admin = require('../config/firebase');

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return;

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      click_action: 'http://localhost:5173', // o tu dominio
    },
    webpush: {
      fcmOptions: {
        link: 'http://localhost:5173', // abre la app al hacer clic
      },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log('Notificación push enviada a:', fcmToken);
  } catch (error) {
    console.error('Error en notificación push:', error);
  }
};

module.exports = sendPushNotification;