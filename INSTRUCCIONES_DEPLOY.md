# Instrucciones para Desplegar la Edge Function

## Implementación Completada

Se han creado los siguientes archivos:

1. **Edge Function**: `supabase/functions/crear-chofer/index.ts`
2. **Servicio**: `src/services/ChoferesService.js`
3. **Componente**: `src/components/GestionChoferes.jsx`
4. **Rutas actualizadas**: `src/App.jsx`

## Pasos para Desplegar

### 1. Instalar Supabase CLI

**Para Linux (método recomendado):**

```bash
# Descargar e instalar el binario directamente
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o supabase.tar.gz
tar -xzf supabase.tar.gz
sudo mv supabase /usr/local/bin/
rm supabase.tar.gz

# Verificar instalación
supabase --version
```

**Alternativa usando NPM local (sin instalación global):**

```bash
# Instalar en el proyecto
npm install supabase --save-dev

# Usar con npx
npx supabase --version

# Todos los comandos se usan con npx:
npx supabase login
npx supabase link --project-ref TU_REF
npx supabase functions deploy crear-chofer
```

### 2. Autenticarse en Supabase

```bash
# Iniciar sesión (abrirá el navegador)
supabase login
```

### 3. Vincular tu Proyecto

```bash
# En el directorio del proyecto
cd /home/darius/Documentos/Respaldo/Proyecto-Seminario-de-Actualizacion

# Vincular con tu proyecto (necesitarás el project-ref)
supabase link --project-ref TU_PROJECT_REF
```

**¿Cómo obtener el project-ref?**

- Ve a: https://supabase.com/dashboard/project/_/settings/general
- Copia el "Reference ID"

### 4. Desplegar la Edge Function

```bash
# Desplegar la función crear-chofer
supabase functions deploy crear-chofer

# O desplegar todas las funciones
supabase functions deploy
```

### 5. Verificar el Despliegue

```bash
# Ver funciones desplegadas
supabase functions list
```

## Configuración Necesaria en Supabase

### Variables de Entorno

La Edge Function ya usa automáticamente estas variables que Supabase provee:

- `SUPABASE_URL` - URL de tu proyecto (automática)
- `SUPABASE_SERVICE_ROLE_KEY` - Key con permisos de admin (automática)

### Configurar URL de Redirección

1. Ve a: https://supabase.com/dashboard/project/_/auth/url-configuration
2. En "Redirect URLs", agrega:
   ```
   http://localhost:5173/establecer-password
   https://tu-dominio.com/establecer-password
   ```

## Probar la Funcionalidad

### Desde el Frontend

1. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

2. Accede a: http://localhost:5173/gestion-choferes

3. Haz clic en "Nuevo Chofer"

4. Completa el formulario:

   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan.perez@ejemplo.com

5. Haz clic en "Crear Chofer"

### Verificar el Flujo

1. **Backend (Supabase)**:

   - Ve a: https://supabase.com/dashboard/project/_/auth/users
   - Deberías ver el nuevo usuario creado
   - Estado: "Waiting for verification"

2. **Email**:

   - El chofer recibirá un email con asunto: "Confirm your signup"
   - El email contiene un link para establecer su contraseña

3. **Base de Datos**:
   - Ve a: https://supabase.com/dashboard/project/_/editor
   - Tabla "Chofer" debe tener el nuevo registro
   - Campo `user_id` debe estar vinculado al usuario de auth

### Probar desde la Terminal (opcional)

```bash
# Invocar la función directamente
supabase functions invoke crear-chofer \
  --body '{"nombre":"Test","apellido":"Usuario","email":"test@ejemplo.com","creado_por":1}'
```

## Ver Logs en Tiempo Real

```bash
# Ver logs de la función mientras se ejecuta
supabase functions serve crear-chofer

# En otra terminal, invocar la función
curl -i --location --request POST 'http://localhost:54321/functions/v1/crear-chofer' \
  --header 'Authorization: Bearer TU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"nombre":"Local","apellido":"Test","email":"local@test.com","creado_por":1}'
```

## Troubleshooting

### Error: "Function not found"

**Solución**: Asegúrate de que la función esté desplegada:

```bash
supabase functions deploy crear-chofer
```

### Error: "Invalid JWT"

**Solución**: Verifica que estés autenticado como admin:

```javascript
// En el navegador, consola de desarrollo:
const {
  data: { user },
} = await supabase.auth.getUser();
console.log(user);
```

### Error: "Email not sent"

**Soluciones**:

1. Verifica la configuración de email en Supabase:

   - https://supabase.com/dashboard/project/_/settings/auth

2. En desarrollo, usa el Inbucket (email local):

   - http://localhost:54324

3. Verifica las Redirect URLs configuradas

### Error: "User already exists"

**Solución**: El email ya está registrado. Usa otro email o elimina el usuario existente.

## Próximos Pasos

Una vez que confirmes que la Edge Function funciona correctamente:

1. Implementar funciones adicionales:

   - Editar chofer
   - Desactivar chofer
   - Reenviar invitación
   - Cambiar estado

2. Crear página de establecer contraseña

3. Agregar más validaciones y filtros en GestionChoferes

4. Implementar búsqueda y paginación

## Notas Importantes

- La Edge Function tiene rollback automático: si falla la creación en la tabla Chofer, se elimina el usuario de auth
- El email de invitación tiene un link que expira en 24 horas por defecto
- Los choferes pueden ver solo su propio registro gracias a RLS
- Los admins pueden ver y gestionar todos los choferes
