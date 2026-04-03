# Iglesia App - Sistema de Gestión

Aplicación web full-stack para gestionar actividades, usuarios y tareas de una iglesia.

## 📋 Requisitos Previos

- **Node.js** (v16 o superior)
- **PostgreSQL** (v12 o superior)
- **npm** (incluido con Node.js)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
cd iglesia-app
```

### 2. Configurar Variables de Entorno

#### Backend

Copia el archivo `.env.example` a `.env`:

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus datos:

```dotenv
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iglesia_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT - IMPORTANTE: Cambiar en producción
JWT_SECRET=tu_clave_secreta_super_larga_y_segura_minimo_32_caracteres

# CORS
CORS_ORIGIN=http://localhost:5173

# Puerto
PORT=5000
```

⚠️ **Importante**: 
- `JWT_SECRET` debe ser una cadena larga y aleatoria (mín. 32 caracteres)
- En producción, usar valores seguros y únicos

### 3. Instalar Dependencias

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 4. Crear y Inicializar Base de Datos

Asegúrate de que PostgreSQL está corriendo:

```bash
# En Windows
pg_ctl -D "C:\Program Files\PostgreSQL\data" start

# En Mac
brew services start postgresql

# En Linux
sudo systemctl start postgresql
```

Luego inicializa la BD:

```bash
cd backend
npm run init-db  # Si existe este script
# O manualmente: node init-db.js
```

O desde el frontend, visita: `http://localhost:5000/api/init-db`

## 📦 Dependencias Principales

### Backend
- **Express** - Framework web
- **PostgreSQL (pg)** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **CORS** - Manejo de CORS

### Frontend
- **React 19** - Librería UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Navegación
- **Framer Motion** - Animaciones

## 🏃 Ejecutar la Aplicación

### Terminal 1 - Backend

```bash
cd backend
npm start
```

✅ Backend en: `http://localhost:5000`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

✅ Frontend en: `http://localhost:5173`

## 🧪 Credenciales de Prueba

Después de inicializar la BD, puedes usar:

- **Email**: `pastor@iglesia.com`
- **Contraseña**: `iglesia123`

## 📁 Estructura del Proyecto

```
iglesia-app/
├── backend/
│   ├── config/          # Configuración de BD
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Autenticación, validaciones
│   ├── routes/          # Rutas de API
│   ├── index.js         # Punto de entrada
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas principales
│   │   ├── context/     # Estado global (Auth)
│   │   ├── services/    # Llamadas a API
│   │   └── utils/       # Funciones auxiliares
│   └── package.json
```

## 🔒 Seguridad

### Ya Implementado:
✅ Validación de emails y contraseñas  
✅ Hashing de contraseñas (bcryptjs)  
✅ JWT para autenticación  
✅ Middleware de autenticación  
✅ Control de permisos (admin)  
✅ Manejo de errores  

### Recomendaciones para Producción:
- ✋ Usar HTTPS (SSL/TLS)
- ✋ Configurar CORS específico
- ✋ Usar variables de entorno seguras
- ✋ Implementar rate limiting
- ✋ Agregar logs de seguridad
- ✋ Usar helmet.js en Express
- ✋ Sanitizar inputs

## 🛠️ Scripts Disponibles

### Backend

```bash
npm start           # Inicia el servidor
npm test            # Ejecuta tests (si existen)
```

### Frontend

```bash
npm run dev         # Inicia desarrollo con hot reload
npm run build       # Crea build para producción
npm run lint        # Ejecuta linter
npm run preview     # Pre-visualiza build de producción
```

## 🐛 Solución de Problemas

### Puerto 5000 o 5173 en uso

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Error de conexión a BD

- Verifica que PostgreSQL está corriendo
- Comprueba credenciales en `.env`
- Intenta crear la BD manualmente:

```sql
CREATE DATABASE iglesia_db;
```

### CORS Error

- Asegúrate que `CORS_ORIGIN` en `.env` coincide con la URL del frontend
- Por defecto: `http://localhost:5173`

## 📝 Variables de Entorno Importantes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de BD | localhost |
| `DB_PORT` | Puerto de BD | 5432 |
| `DB_NAME` | Nombre BD | iglesia_db |
| `DB_USER` | Usuario BD | postgres |
| `DB_PASSWORD` | Contraseña BD | password |
| `JWT_SECRET` | Clave para firmar JWT | abc123xyz789... |
| `CORS_ORIGIN` | URL del frontend | http://localhost:5173 |
| `PORT` | Puerto del backend | 5000 |
| `NODE_ENV` | Ambiente | development/production |

## 🚀 Despliegue

Para desplegar a producción:

1. **Build del Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Variables de Producción**
   - Actualizar `.env` con valores de producción
   - Usar JWT_SECRET seguro y único
   - Configurar CORS correctamente

3. **Servir Frontend desde Backend** (opcional)
   - Copiar dist/ de frontend a una carpeta public/ en backend
   - Servir archivos estáticos

## 📞 Soporte

Si encuentras problemas, verifica:
- Que todos los requisitos están instalados
- Que PostgreSQL está corriendo
- Que las variables de entorno son correctas
- Los logs de consola del backend

## 📄 Licencia

ISC

---

**Nota**: Esta es una aplicación de demostración. Para producción, implementar medidas de seguridad adicionales.
