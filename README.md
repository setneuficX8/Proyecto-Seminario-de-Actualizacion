# **GESTIÓN DE RUTAS DE RECOLECCIÓN DE DESECHOS**

## Integrantes del proyecto

- Keyla Dayana Arboleda Mina
- Carlos Andres Cifuentes Montaño
- Darío Restrepo Landázury
- Jose Fernando Sinisterra Ibargüen

---

## **DESCRIPCIÓN DEL PROYECTO**

Sistema web integral para la gestión de rutas de recolección de desechos sólidos, desarrollado con **React** y **Supabase**. El proyecto implementa un sistema completo de administración de flotas, asignaciones de personal, visualización de rutas en tiempo real y control de vehículos.

### **Características Principales**

- Sistema de autenticación con roles diferenciados (Administrador/Chofer)
- Visualización interactiva de rutas mediante Mapbox
- Gestión completa de vehículos y control de disponibilidad
- Administración de personal y asignaciones
- Dashboard con métricas en tiempo real
- Sincronización con API externa para datos de vehículos y rutas

---

## **TECNOLOGÍAS UTILIZADAS**

### **Frontend**

- **React 18** - Biblioteca principal de UI
- **Vite** - Build tool y servidor de desarrollo
- **TailwindCSS** - Framework de estilos
- **React Router DOM** - Sistema de navegación

### **Backend y Servicios**

- **Supabase** - Backend as a Service
  - Authentication (gestión de usuarios)
  - PostgreSQL Database
  - Realtime subscriptions
  - Edge Functions (Deno)
- **Mapbox GL JS** - Visualización de mapas
- **Mapbox Directions API** - Cálculo de rutas optimizadas

### **Otras Librerías**

- **SweetAlert2** - Sistema de alertas y notificaciones
- **@mapbox/polyline** - Codificación y decodificación de geometrías

---

## **ARQUITECTURA DEL SISTEMA**

### **1. Sistema de Autenticación y Roles**

El sistema implementa un modelo de autenticación mediante Supabase Auth con dos roles principales:

#### **Hook Personalizado: useAuth**

Archivo: [`src/hooks/useAuth.js`](src/hooks/useAuth.js)

Maneja la autenticación y detección automática de roles:

- Detección de rol (Administrador/Chofer)
- Carga de datos de usuario desde tablas específicas
- Gestión de estados de autenticación
- Integración con Supabase Auth

#### **Componentes de Autenticación**

**RegisterSupabase.jsx**: [`src/Supabase/RegisterSupabase.jsx`](src/Supabase/RegisterSupabase.jsx)

- Registro exclusivo para administradores
- Trigger automático crea registro en tabla `administrador`
- Verificación de correo electrónico

**LoginSupabase.jsx**: [`src/Supabase/LoginSupabase.jsx`](src/Supabase/LoginSupabase.jsx)

- Autenticación con email y contraseña
- Redirección automática según rol
- Manejo de sesiones persistentes

### **2. Control de Acceso por Roles**

#### **Componente RoleRoute**

Archivo: [`src/components/RoleRoute.jsx`](src/components/RoleRoute.jsx)

Controla el acceso a rutas según el rol del usuario.

**Roles y Permisos:**

| Rol | Permisos |
|-----|----------|
| **Administrador** | Gestión completa de choferes, Gestión de vehículos, Creación y edición de rutas, Gestión de asignaciones, Acceso total al sistema |
| **Chofer** | Consulta de perfil personal, Visualización de asignación activa, Consulta de vehículo y ruta asignados, Sin permisos de edición |

---

## **MÓDULOS PRINCIPALES**

### **1. Dashboard - Home**

Archivo: [`src/components/Home.jsx`](src/components/Home.jsx)

Panel principal con métricas en tiempo real:

- **Rutas activas**: Contador de rutas operativas
- **Camiones en operación**: Vehículos con asignación activa
- **Choferes activos**: Personal disponible para asignaciones

### **2. Mapa Interactivo**

Archivo: [`src/Mapbox/Mapa.jsx`](src/Mapbox/Mapa.jsx)

Sistema de visualización y creación de rutas:

**Funcionalidades:**

- Dibujo interactivo de rutas sobre el mapa
- Cálculo automático de distancia y duración estimada
- Guardado simultáneo en Supabase y API externa
- Visualización de geometrías en formato LineString (GeoJSON)
- Integración con Mapbox Directions API para optimización de rutas

### **3. Gestión de Vehículos**

Archivo: [`src/components/GestionVehiculos.jsx`](src/components/GestionVehiculos.jsx)

Control completo de la flota vehicular:

**Características:**

- Crear vehículos (sincroniza automáticamente con API externa)
- Editar información (placa, marca, modelo)
- Control de estado activo/inactivo
- Visualización de disponibilidad
- Sistema de filtros avanzados (estado, disponibilidad, chofer asignado)

### **4. Gestión de Choferes**

Archivo: [`src/components/GestionChoferes.jsx`](src/components/GestionChoferes.jsx)

Administración de personal:

**Funcionalidades:**

- Crear choferes mediante Edge Function
- Envío de invitación por correo electrónico
- Contraseña establecida por el administrador
- Edición de información personal
- Activar/desactivar choferes
- Eliminación con validaciones de seguridad

### **5. Gestión de Rutas**

Archivo: [`src/components/GestionRutas.jsx`](src/components/GestionRutas.jsx)

Control de rutas de recolección:

**Características:**

- Listado detallado de rutas
- Sincronización bidireccional con API externa
- Edición de nombre y estado
- Activar/desactivar rutas
- Eliminación (solo rutas sin asignaciones activas)
- Identificación de origen (API Externa o Local)

### **6. Gestión de Asignaciones**

Archivo: [`src/components/GestionAsignaciones.jsx`](src/components/GestionAsignaciones.jsx)

Sistema de asignación de recursos:

**Funcionalidades:**

- Relaciona chofer + vehículo + ruta en una asignación
- Control de fechas de inicio y fin
- Observaciones y notas del administrador
- Cambio de estado (activa/completada/cancelada)
- Filtros por estado de asignación
- Validación automática de disponibilidad de recursos

**Vista diferenciada:**

- **Admin**: Crear, editar, completar y cancelar asignaciones
- **Chofer**: Solo visualizar su asignación personal

### **7. Perfil de Chofer**

Archivo: [`src/components/PerfilChofer.jsx`](src/components/PerfilChofer.jsx)

Vista personalizada para choferes con información sobre su asignación actual, vehículo, ruta y observaciones del administrador.

---

## **SERVICIOS DE DATOS**

Todos los servicios están organizados en [`src/services`](src/services) y manejan la lógica de negocio:

### **AsignacionesService**

Archivo: [`src/services/AsignacionesService.js`](src/services/AsignacionesService.js)

Gestiona todas las operaciones relacionadas con asignaciones: crear, listar, actualizar estado, eliminar y obtener recursos disponibles.

### **ChoferesService**

Archivo: [`src/services/ChoferesService.js`](src/services/ChoferesService.js)

Maneja la gestión de choferes: crear (vía Edge Function), listar, actualizar y eliminar.

### **VehiculosService**

Archivo: [`src/services/VehiculosService.js`](src/services/VehiculosService.js)

Controla operaciones de vehículos con sincronización a API externa: crear, listar, actualizar y eliminar.

### **RutasService**

Archivo: [`src/services/RutasService.js`](src/services/RutasService.js)

Gestiona rutas con sincronización bidireccional: crear, listar, actualizar, eliminar y sincronizar desde API externa.

---

## **INTEGRACIÓN CON API EXTERNA**

El sistema se integra con una API REST externa para sincronización de datos:

**Endpoint Base**: `https://apirecoleccion.gonzaloandreslucio.com/api`

### **Endpoints Utilizados**

```
Vehículos:
- POST /vehiculos
- GET  /vehiculos
- GET  /vehiculos/{id}

Rutas:
- POST /rutas
- GET  /rutas
- GET  /rutas/{id}
```

### **Flujo de Sincronización**

1. **Creación**: Se crea en API externa y luego se guarda en Supabase con el ID de la API
2. **Actualización**: Solo se actualiza en Supabase (la API no soporta PUT)
3. **Eliminación**: Solo se elimina de Supabase (la API no soporta DELETE)
4. **Sincronización**: Importa registros de la API que no existen localmente

---

## **EDGE FUNCTIONS**

### **Función: crear-chofer**

Archivo: [`supabase/functions/crear-chofer/index.ts`](supabase/functions/crear-chofer/index.ts)

Edge Function para creación segura de choferes:

**Proceso:**

1. Valida datos de entrada
2. Verifica que el email no exista en el sistema
3. Crea usuario en auth.users con contraseña
4. Inserta registro en tabla Chofer
5. Envía email de invitación
6. Maneja rollback automático en caso de error

**Ventajas:**

- Ejecución en servidor (mayor seguridad)
- Acceso a Service Role Key
- No expone credenciales sensibles al cliente
- Validación robusta de datos

---

## **FLUJOS DE TRABAJO PRINCIPALES**

### **1. Flujo de Asignación**

```
1. Admin crea chofer → Edge Function → Email de invitación
2. Admin registra vehículo → API externa + Supabase
3. Admin crea ruta en mapa → Mapbox + Supabase
4. Admin crea asignación:
   - Selecciona chofer disponible
   - Selecciona vehículo disponible
   - Selecciona ruta activa
   - Define fechas y observaciones
5. Sistema marca recursos como "no disponibles"
6. Chofer puede consultar asignación en su perfil
```

### **2. Flujo de Visualización para Chofer**

```
1. Chofer inicia sesión
2. Sistema redirige a Home
3. Chofer accede a "Mi Perfil"
4. Visualiza:
   - Datos personales
   - Vehículo asignado
   - Ruta asignada
   - Estado de asignación
   - Observaciones del administrador
```

### **3. Flujo de Gestión de Rutas**

```
1. Admin accede al módulo de Mapa
2. Dibuja ruta usando Mapbox Directions
3. Sistema calcula distancia y duración automáticamente
4. Admin asigna nombre a la ruta
5. Sistema guarda:
   - En API externa (geometría)
   - En Supabase (con ruta_id_api)
6. Ruta queda disponible para asignaciones
```

---

## **INSTALACIÓN Y CONFIGURACIÓN**

### **Requisitos Previos**

- Node.js >= 18.x
- npm
- Cuenta de Supabase
- Token de acceso de Mapbox

### **Variables de Entorno**

Crear archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_MAPBOX_TOKEN=tu_mapbox_token
```

### **Instalación**

```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd Proyecto-Seminario-de-Actualizacion

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### **Configuración de Supabase**

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar scripts SQL para crear tablas y vistas
3. Configurar políticas RLS (Row Level Security)
4. Desplegar Edge Functions:

```bash
supabase functions deploy crear-chofer
```

---

## **CARACTERÍSTICAS DESTACADAS**

### **Seguridad**

- Autenticación robusta con Supabase Auth
- Row Level Security (RLS) en PostgreSQL
- Service Role Key solo en Edge Functions
- Validación de roles en cliente y servidor
- Control de acceso granular por rutas

### **Performance**

- Lazy loading de componentes React
- Optimización de consultas a base de datos
- Code splitting automático con Vite
- Selectores específicos en Supabase para reducir datos transferidos
- Caché de sesión de usuario

### **Escalabilidad**

- Arquitectura modular basada en servicios
- Integración con API externa
- Base de datos PostgreSQL escalable (Supabase)
- Edge Functions para operaciones críticas
- API REST para sincronización de datos

---

> **Desarrollado por el estudiante de la Universidad del Pacífico - 2025**
