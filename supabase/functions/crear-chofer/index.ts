import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar solicitudes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener datos del request
    const { nombre, apellido, email, password, creado_por } = await req.json()

    // Validar datos requeridos
    if (!nombre || !apellido || !email || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nombre, apellido, email y contraseña son requeridos' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validar longitud de password
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Crear cliente Supabase con permisos de admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar que el email no exista ya en auth.users
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some(u => u.email === email)
    
    if (emailExists) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ya existe un usuario con este email' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar que el email no exista en la tabla Chofer
    const { data: existingChofer } = await supabaseAdmin
      .from('Chofer')
      .select('email')
      .eq('email', email)
      .single()

    if (existingChofer) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ya existe un chofer con este email' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 1. Crear usuario en auth.users con contraseña establecida por admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email confirmado automáticamente
      user_metadata: {
        nombre,
        apellido,
        rol: 'chofer'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error al crear usuario en auth: ${authError.message}`
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!authData || !authData.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No se pudo crear el usuario en auth'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Insertar en tabla Chofer
    const { data: choferData, error: choferError } = await supabaseAdmin
      .from('Chofer')
      .insert({
        nombre,
        apellido,
        email,
        user_id: authData.user.id,
        creado_por: creado_por || null,
        activo: true
      })
      .select()
      .single()

    if (choferError) {
      console.error('Error creating chofer:', choferError)
      // Rollback: eliminar usuario de auth si falla la inserción
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Error al crear chofer: ${choferError.message}`)
    }

    // 3. Respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true, 
        chofer: choferData,
        message: 'Chofer creado exitosamente. Puede iniciar sesión con su email y contraseña.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    )

  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
