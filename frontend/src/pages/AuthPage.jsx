// src/pages/AuthPage.jsx
import { useState } from 'react';
import PhoneLogin from '../components/auth/PhoneLogin';
import OtpVerification from '../components/auth/OtpVerification';

export default function AuthPage({ onLogin }) {
  const [phone, setPhone] = useState(null);

  if (phone) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
        <OtpVerification
          phone={phone}
          onLoginSuccess={onLogin}
          onBack={() => setPhone(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <PhoneLogin onOtpRequested={setPhone} />
    </div>
  );
}