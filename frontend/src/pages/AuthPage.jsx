// src/pages/AuthPage.jsx
import { useState } from 'react';
import PhoneLogin from '../components/auth/PhoneLogin';
import OtpForNewUser from '../components/auth/OtpForNewUser';
import OtpForExistingUser from '../components/auth/OtpForExistingUser';

export default function AuthPage({ onLogin }) {
  const [phone, setPhone] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  if (phone) {
    if (isNewUser) {
      return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
          <OtpForNewUser phone={phone} onLoginSuccess={onLogin} onBack={() => setPhone(null)} />
        </div>
      );
    } else {
      return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
          <OtpForExistingUser phone={phone} onLoginSuccess={onLogin} onBack={() => setPhone(null)} />
        </div>
      );
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <PhoneLogin
        onOtpRequested={(p) => {
          setPhone(p);
          setIsNewUser(true);
        }}
        onExistingUser={(p) => {
          setPhone(p);
          setIsNewUser(false);
        }}
      />
    </div>
  );
}