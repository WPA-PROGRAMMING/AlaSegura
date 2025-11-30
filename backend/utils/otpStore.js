// backend/utils/otpStore.js
// Almacena OTPs en memoria (¡solo para desarrollo!)
const otpStore = new Map();

const storeOtp = (phone, otp) => {
  otpStore.set(phone, {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutos
  });
};

const getOtp = (phone) => {
  const record = otpStore.get(phone);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return null;
  }
  return record.code;
};

module.exports = { storeOtp, getOtp };