# Guía de Migración a Otro Computador

Esta guía te ayudará a mover tu proyecto `iglesia-app` a otro computador donde ya tienes PostgreSQL y Node.js instalados.

## 1. Preparación en el Computador Actual (Origen)

### 1.1. Base de Datos
Ya he generado un archivo con todos tus datos actuales. 
- El archivo está en: `backend/backup_data.sql`
- El script de estructura está en: `backend/init-db.js`

### 1.2. Comprimir el Proyecto
Debes comprimir la carpeta `iglesia-app`, pero **IMPORTANTE: NO incluyas las carpetas `node_modules`**.

1. Selecciona la carpeta `iglesia-app`.
2. Al comprimir, **excluye** estas carpetas para que el archivo pese poco:
   - `backend/node_modules`
   - `frontend/node_modules`
   - `frontend/dist` (opcional)

---

## 2. Instalación en el Nuevo Computador (Destino)

### 2.1. Preparar la Base de Datos
1. Abre **pgAdmin** o tu terminal de PostgreSQL.
2. Crea una nueva base de datos llamada `iglesia_db` (o el nombre que prefieras).
   ```sql
   CREATE DATABASE iglesia_db;
   ```

### 2.2. Configurar Archivos
1. Descomprime tu proyecto.
2. **Backend**:
   - Ve a `backend/.env` y asegúrate de que la contraseña `DB_PASSWORD` sea la correcta para el PostgreSQL de **ese nuevo computador**.
3. **Frontend**:
   - Ve a `frontend/.env` y verifica que la URL sea correcta (usualmente `http://localhost:5000/api`).

### 2.3. Instalar Dependencias
Debes abrir una terminal y ejecutar estos comandos en cada carpeta para descargar las librerías de nuevo:

**Terminal 1 (Backend):**
```bash
cd iglesia-app/backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd iglesia-app/frontend
npm install
```

### 2.4. Restaurar Datos
En la terminal del **backend**, ejecuta estos scripts para crear las tablas y recuperar tus datos:

1. Crear tablas:
   ```bash
   node init-db.js
   ```
2. Importar tus datos guardados:
   Espera... el script `backup_data.sql` es un archivo SQL. Puedes ejecutarlo con tu herramienta de base de datos favorita (DBeaver, pgAdmin) o por comando si tienes `psql` instalado:
   ```bash
   psql -U postgres -d iglesia_db -f backup_data.sql
   ```
   *(Si no tienes psql configurado en el PATH windows, simplemente abre el archivo `backup_data.sql`, copia todo el texto y pégalo en la consola de SQL Query de pgAdmin y ejecútalo).*

### 2.5. Iniciar
¡Listo! Ahora arranca el proyecto igual que siempre:

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run dev
```
