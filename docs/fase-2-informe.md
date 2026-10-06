# Informe Fase 2 — Bugs de ciclo de vida (actualizado post-incidente)

> Registro de la Fase 2 del plan de auditoría/refactorización: corrección de bugs de
> ciclo de vida (BUG-01 a BUG-06), la incidencia posterior de `Mapa.jsx` y su solución.

## 1. Cambios por BUG (aplicados y verificados)

| ID | Archivo(s) | Cambio aplicado |
|---|---|---|
| **BUG-01** | `src/Mapbox/Mapa.jsx` | Manejadores extraídos a referencias estables y cleanup con liberación de recursos. **Requirió una corrección posterior** (ver §2): la primera versión llamaba `.off()` a `MapboxDirections`, que no lo soporta, y provocaba una caída. |
| **BUG-02** | `GestionAsignaciones`, `GestionChoferes`, `GestionRutas`, `GestionVehiculos`, `PerfilChofer` | Flag de montaje (`isMountedRef` + efecto de montaje/desmontaje) con guardas `if (!isMountedRef.current) return;` antes de cada `setState` tras `await`, y validación en los `finally`. |
| **BUG-03** | `GestionAsignaciones.jsx`, `PerfilChofer.jsx` | `cargarDatos` y `cargarPerfil` envueltos en `useCallback` con deps primitivas (`[filtro, isAdmin]`, `[userData]`); los efectos dependen de esos callbacks. |
| **BUG-04** | `GestionAsignaciones`, `GestionVehiculos`, `GestionChoferes` | Setters de formulario al formato funcional `setFormData(prev => ({ ...prev, ... }))`. |
| **BUG-05** | `LoginSupabase.jsx`, `GestionChoferes.jsx` | `type="button"` en botones de cierre de alerta. |
| **BUG-06** | `src/components/PerfilChofer.jsx` | Consulta a la tabla `Chofer` en lugar de `vista_choferes_disponibles`. |

## 2. Incidencia posterior y solución

**Síntoma reportado:** al abrir *Mapa de rutas* la pantalla quedaba negra y, al recargar,
aparecía `The server is configured with a public base URL of /Proyecto-Seminario-de-Actualizacion/ - did you mean to visit /Proyecto-Seminario-de-Actualizacion/mapa instead?`

**Causa raíz (2 problemas distintos):**

1. **Regresión de BUG-01 (la pantalla negra).** El cleanup llamaba
   `directionsRef.current.off(...)`, pero `MapboxDirections` **no expone `.off()`**:

   ```
   Uncaught TypeError: directionsRef.current.off is not a function
       at Mapa.jsx:98
   ```

   Al lanzarse dentro del `return () => {...}` del `useEffect` y no existir error
   boundary, React desmontaba el árbol completo → pantalla negra. La prueba en runtime lo
   confirma: `MapboxDirections.prototype.off === undefined` (mientras `on`, `removeRoutes`
   y `onRemove` sí existen).

2. **Desalineación de `base` (el mensaje del servidor).** `vite.config.ts` fijaba `base`
   al subdirectorio de GitHub Pages mientras `BrowserRouter` navega en la raíz; en
   `pnpm dev`, cargar/recargar `/mapa` devolvía el 404 con ese mensaje.

**Solución aplicada:**

- `src/Mapbox/Mapa.jsx` — cleanup defensivo: `map.off()` solo sobre el mapa (que sí lo
  soporta); `directions.off()` **bajo `typeof === 'function'`**; limpieza vía
  `directions.removeRoutes()` + `map.removeControl(directions)` (dispara su `onRemove`);
  y `map.removeControl` dentro de `try/catch` para que **el cleanup nunca pueda tumbar la app**.

  ```js
  if (directions) {
    if (typeof directions.off === 'function') {
      directions.off('route', handleRoute)
      directions.off('error', handleDirectionsError)
    }
    if (typeof directions.removeRoutes === 'function') { directions.removeRoutes() }
    if (map && typeof map.removeControl === 'function') {
      try { map.removeControl(directions) } catch (err) { console.warn(...) }
    }
  }
  ```

- `vite.config.ts` — `base` dependiente del comando: `"/"` en `serve` (`pnpm dev`) y la
  URL de GitHub Pages en `build`. El build de Docker sobreescribe con `--base=/`.

**Estado:** confirmado por el usuario — el mapa renderiza correctamente.

## 3. Verificación

```
pnpm lint      → exit 0
pnpm test:run  → Test Files 3 passed · Tests 13 passed   (exit 0)
pnpm build     → exit 0
```

| Comprobación | Resultado |
|---|---|
| API de `MapboxDirections` (runtime) | `off: undefined`, `on: function`, `removeRoutes: function`, `onRemove: function` |
| `GET /mapa` en dev (tras fix de base) | 200 (antes 404 + "did you mean…") |
| `dist/index.html` de producción | URL de GitHub Pages (despliegue sin cambios) |

**Lección relevante:** esta regresión **no fue detectada por las herramientas automáticas**
— `tsc`, ESLint (solo `.ts/.tsx`), Vitest (solo servicios) y `vite build` pasaron en verde
con el bug presente. Es un fallo exclusivamente de runtime en un `useEffect` de un `.jsx`
que ninguna de esas capas cubre. Recomendación: un test de componente con entorno DOM o un
error boundary para que un fallo de este tipo no deje la app en blanco.

## 4. Residuales (al cierre de la Fase 2)

- `no-set-state-after-await-in-effect` bajó de 5 a 3 casos (`GestionChoferes:34`,
  `GestionRutas:25`, `GestionVehiculos:35`), mitigados por `isMountedRef`; el escáner no
  modela el guard del ref.
- Avisos de Fase 1 en `src/context/AuthContext.jsx`: `only-export-components` y
  `context-provider-value-from-unmemoized-local-literal` (atendidos en la Fase 3).
- **SEC-01** (autorización inferida en cliente) — planificado para servicios/servidor.
- GitHub Pages: `BrowserRouter` sin `basename` y sin fallback SPA (atendido en la Fase 3).
