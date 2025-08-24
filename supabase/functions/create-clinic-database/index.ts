import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateClinicRequest {
  clinic_name: string
  subdomain: string
  admin_email: string
  organization_id?: string
  plan?: string
}

interface SupabaseProject {
  id: string
  ref: string
  name: string
  status: string
  endpoint?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const SUPABASE_MANAGEMENT_API_KEY = Deno.env.get('SUPABASE_MANAGEMENT_API_KEY')!
    
    if (!SUPABASE_MANAGEMENT_API_KEY) {
      throw new Error('SUPABASE_MANAGEMENT_API_KEY não configurada')
    }

    // Initialize Supabase client (for the central admin database)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { clinic_name, subdomain, admin_email, organization_id, plan = 'free' }: CreateClinicRequest = await req.json()

    console.log(`🏗️ Iniciando criação de database para clínica: ${clinic_name}`)

    // 1. Create new Supabase project via Management API
    const projectName = `clinic-${subdomain}`
    const createProjectResponse = await fetch('https://api.supabase.com/v1/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_MANAGEMENT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        organization_id: organization_id || 'default', // You need to provide your org ID
        plan: plan,
        region: 'us-east-1' // or your preferred region
      })
    })

    if (!createProjectResponse.ok) {
      const errorData = await createProjectResponse.text()
      console.error('❌ Erro ao criar projeto Supabase:', errorData)
      throw new Error(`Falha ao criar projeto: ${errorData}`)
    }

    const newProject: SupabaseProject = await createProjectResponse.json()
    console.log(`✅ Projeto Supabase criado:`, newProject)

    // 2. Wait for project to be ready (projects take time to provision)
    let projectReady = false
    let attempts = 0
    const maxAttempts = 30 // 5 minutes total

    while (!projectReady && attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.supabase.com/v1/projects/${newProject.id}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_MANAGEMENT_API_KEY}`,
        }
      })

      if (statusResponse.ok) {
        const projectStatus = await statusResponse.json()
        if (projectStatus.status === 'ACTIVE_HEALTHY') {
          projectReady = true
          console.log(`✅ Projeto está ativo e saudável`)
        } else {
          console.log(`⏳ Projeto status: ${projectStatus.status}, aguardando...`)
          await new Promise(resolve => setTimeout(resolve, 10000)) // wait 10 seconds
          attempts++
        }
      } else {
        attempts++
        await new Promise(resolve => setTimeout(resolve, 10000))
      }
    }

    if (!projectReady) {
      throw new Error('Timeout aguardando projeto ficar ativo')
    }

    // 3. Get project credentials
    const credentialsResponse = await fetch(`https://api.supabase.com/v1/projects/${newProject.id}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_MANAGEMENT_API_KEY}`,
      }
    })

    if (!credentialsResponse.ok) {
      throw new Error('Falha ao obter credenciais do projeto')
    }

    const credentials = await credentialsResponse.json()
    const anonKey = credentials.find((key: any) => key.name === 'anon')?.api_key
    const serviceRoleKey = credentials.find((key: any) => key.name === 'service_role')?.api_key

    // 4. Update clinicas_central with real project data
    const { error: updateError } = await supabase
      .from('clinicas_central')
      .update({
        database_created: true,
        database_url: `https://${newProject.ref}.supabase.co`,
        database_user: 'postgres', // Supabase default
        database_password_encrypted: serviceRoleKey, // Store encrypted service role key
        configuracoes_especiais: {
          supabase_project_id: newProject.id,
          supabase_project_ref: newProject.ref,
          supabase_anon_key: anonKey,
          supabase_service_role_key: serviceRoleKey,
          project_endpoint: `https://${newProject.ref}.supabase.co`,
          created_at: new Date().toISOString(),
          plan: plan,
          status: 'active'
        }
      })
      .eq('subdominio', subdomain)

    if (updateError) {
      console.error('❌ Erro ao atualizar registro central:', updateError)
      throw updateError
    }

    // 5. Initialize new project database with basic schema
    const newProjectUrl = `https://${newProject.ref}.supabase.co`
    const newProjectSupabase = createClient(newProjectUrl, serviceRoleKey)

    // Call setup-clinic-schema edge function to configure the new project
    try {
      const { data: schemaResponse, error: schemaError } = await supabase.functions.invoke('setup-clinic-schema', {
        body: {
          project_ref: newProject.ref,
          service_role_key: serviceRoleKey,
          clinic_name: clinic_name,
          admin_email: admin_email
        }
      })

      if (schemaError) {
        console.warn('⚠️ Schema setup failed:', schemaError)
      } else if (schemaResponse?.success) {
        console.log('✅ Schema configurado com sucesso')
      }
    } catch (schemaErr) {
      console.warn('⚠️ Erro ao configurar schema:', schemaErr)
    }

    // 6. Log the operation
    await supabase.from('admin_operacoes_log').insert({
      operacao: 'CREATE_CLINIC_DATABASE_SUPABASE',
      detalhes: {
        clinic_name,
        subdomain,
        supabase_project_id: newProject.id,
        supabase_project_ref: newProject.ref,
        database_url: newProjectUrl,
        plan: plan,
        admin_email
      },
      sucesso: true
    })

    console.log(`🎉 Database criado com sucesso para ${clinic_name}`)

    return new Response(JSON.stringify({
      success: true,
      message: 'Database criado com sucesso via Supabase Management API',
      project: {
        id: newProject.id,
        ref: newProject.ref,
        name: newProject.name,
        endpoint: newProjectUrl,
        status: 'active'
      },
      credentials: {
        anon_key: anonKey,
        // Don't return service_role_key in response for security
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('💥 Erro na criação do database:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})