# Semanas 8 y 9: ESTILOS UX/UI + OPTIMIZACIÓN

## Integrantes del proyecto

- Keyla Dayana Arboleda Mina
- Carlos Andres Cifuentes Montaño
- Darío Restrepo Landázury
- Jose Fernando Sinisterra Ibargüen

---

Tanto la **UX** (*Experiencia de Usuario*) y la **UI** (*Interfaz de Usuario*) son lo que conforma la parte visual de una aplicación web, móvil, de escritorio, etc. La UI se encarga de la apariencia y la interactividad. Por su parte, el UX abarca lo que tiene que ver con la interacción del usuario con el software. Juntos aseguran tanto la funcionalidad como la satisfacción del usuario.

---

## Implementaciones UX/UI en el Proyecto

### 1. Estructura de Componentes

Hemos organizado los componentes para facilitan la reutilización y el mantenimiento del código:

- **Home.jsx**: Componente principal que actúa como punto de entrada de la aplicación.
- **GestionVehiculos.jsx**: Interfaz para la gestión de los vehículos.
- **Mapa.jsx**: Componente el mapa interactivo que provee Mapbox.
- **PrivateRoute.jsx**: Componente que protege las rutas y las mantiene privadas de usarios no autorizados.

---
### 2. Estilos y Diseño Visual

- #### Estilos Globales
El archivo `index.css` define los estilos base de la página.

- #### Estilos de Componentes
     - **Mapa.css**: Estilos dedicados para la visualización del mapa, incluyendo controles, marcadores y elementos de interfaz geográfica que provee Mapbox.

### 3. Integración con Mapbox

El componente `Mapa.jsx` implementa la visualización interactiva de datos geoespaciales:

```javascript
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
```

### 4. Optimización

#### 4.1 Gestión de Estados de Carga

La aplicación implementa estados de carga para mejorar la experiencia del usuario durante operaciones asíncronas:

- **Estados de Loading**: Se utilizan variables de estado como `loading` o `isLoading` para indicar cuando se están realizando operaciones que requieren tiempo de procesamiento.
- **Feedback Visual**: Durante las operaciones de carga, se muestran indicadores visuales (spinners, mensajes de "Cargando...") para informar al usuario que la aplicación está trabajando.
- **Prevención de Acciones Duplicadas**: Los botones y formularios se deshabilitan durante las operaciones de carga para evitar envíos duplicados o acciones concurrentes.

```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    // Operación asíncrona
    await operacionAPI();
  } finally {
    setLoading(false);
  }
};