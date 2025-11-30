export default function UserPage({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1>Bienvenido, {user.name} (Usuario)</h1>
      <button onClick={onLogout} className="text-blue-600 underline">Salir</button>
    </div>
  );
}