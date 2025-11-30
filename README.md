# AlaSegura 🚖

**AlaSegura** es una plataforma web de movilidad local diseñada para municipios, que conecta a **usuarios**, **choferes** y **dueños de vehículos** en un solo sistema. El objetivo es mejorar la conectividad, generar empleo local y profesionalizar el transporte urbano, sin depender de aplicaciones externas.

La plataforma es **100% web** (PWA), por lo que funciona en cualquier dispositivo sin necesidad de instalar una app.

---

## 🌐 Roles del Sistema

| Rol         | Funcionalidades                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Usuario** | Solicita viajes, ve estado en tiempo real, consulta historial.                                  |
| **Chofer**  | Recibe notificaciones de viajes, acepta/rechaza, actualiza estado (llegó, en camino, finalizó). |
| **Dueño**   | Registra vehículos, asigna choferes, ve actividad de su flota.                                  |

---

## 🛠️ Tecnologías Utilizadas

### Backend

* **Node.js** + **Express**
* **MongoDB** (con Mongoose)
* **JWT** para autenticación
* **Bcrypt** para seguridad (futuro)
* RESTful API

### Frontend

* **React** + **Vite**
* **Tailwind CSS** para diseño responsive
* **React Router** para enrutamiento por roles
* Axios para comunicación con la API

### Herramientas

* **ESLint** + **Prettier** (formato y calidad de código)
* **Git** + **GitHub**

---

## 📁 Estructura del Proyecto

```
alasegura/
├── backend/ # API REST (Node.js + Express)
│   ├── models/ # Modelos de MongoDB (User, Vehicle, Ride)
│   ├── routes/ # Endpoints por dominio
│   ├── middleware/ # Auth, autorización por roles
│   ├── utils/ # Generación de tokens, OTP simulado
│   └── server.js # Punto de entrada
│
└── frontend/ # Aplicación React
    ├── src/
    │   ├── pages/ # UserPage, DriverPage, OwnerPage
    │   ├── components/ # Componentes reutilizables
    │   ├── services/ # Configuración de Axios
    │   └── App.jsx # Enrutamiento y autenticación
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos

* Node.js v18+
* npm o pnpm
* MongoDB (local o Atlas)

### 1. Clonar el repositorio

```bash
git clone https://github.com/WPA-PROGRAMMING/AlaSegura.git
cd AlaSegura
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crear un archivo `.env` en `backend/`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/alasegura-dev
JWT_SECRET=tu_clave_secreta_muy_segura_2025
```

⚠️ Si usas MongoDB Atlas, reemplaza `MONGO_URI` con tu cadena de conexión.

Iniciar el backend:

```bash
npm run dev
```

### 3. Configurar el frontend

```bash
cd frontend
npm install
npm run dev
```

La app estará disponible en:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🔑 Flujo de Autenticación

1. El usuario ingresa su número de teléfono.
2. El sistema envía un OTP de 6 dígitos (simulado en consola del backend).
3. El usuario ingresa el código, su nombre y selecciona su rol:

   * usuario
   * chofer
   * dueño
4. Se genera un token JWT y se redirige al panel correspondiente.
   ✅ Solo puedes registrarte una vez por número y rol.

---

## 🧪 Funcionalidades Implementadas

### Backend

* Autenticación por OTP (simulado)
* Modelo de User con roles
* Gestión de Vehicle (CRUD + asignación a dueño)
* Asignación de choferes a vehículos
* Modelo de Ride (viaje)
* Solicitud de viajes (usuario → chofer disponible)
* Endpoints de historial para usuario y chofer

### Frontend

* Login por teléfono con OTP
* Redirección automática por rol
* Panel de dueño: registrar vehículos, asignar choferes (con selector legible)
* Panel de usuario: solicitar viaje, ver historial
* Panel de chofer: ver viajes asignados

---

## 📅 Próximos Pasos (Roadmap)

* Permitir que el chofer acepte/rechace un viaje.
* Actualizar estados del viaje: "llegó", "en camino", "finalizado".
* Integración con mapas (Google Maps o Mapbox).
* Notificaciones en tiempo real (WebSockets o FCM).
* Soporte para documentos (licencias, SOAT, etc.).
* Panel de estadísticas para dueños.
* Implementar OTP real (Twilio, MessageBird, etc.).
* Despliegue en producción (Render + Vercel).


