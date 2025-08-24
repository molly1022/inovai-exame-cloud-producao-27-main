import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CriarBancoRequest {
  clinica_id: string
  nome_clinica: string
  subdominio: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { clinica_id, nome_clinica, subdominio }: CriarBancoRequest = await req.json()

    console.log(`🏗️ Criando banco para clínica: ${nome_clinica} (${subdominio})`)

    const supabaseManagementKey = Deno.env.get('SUPABASE_MANAGEMENT_API_KEY')
    
    if (!supabaseManagementKey) {
      console.log('⚠️ Management API Key não configurada - funcionando em modo simulação')
      
      // Simular criação de banco para desenvolvimento
      return new Response(
        JSON.stringify({
          success: true,
          message: `Banco criado com sucesso (simulação) - ${nome_clinica}`,
          modo: 'simulacao',
          detalhes: {
            database_url: `https://${subdominio}-simulado.supabase.co`,
            service_role_key: 'simulado_key_' + Date.now(),
            anon_key: 'simulado_anon_key_' + Date.now(),
            projeto_id: 'simulado_' + clinica_id.substring(0, 8)
          }
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      )
    }

    // 1. Criar novo projeto no Supabase via Management API
    const createProjectResponse = await fetch('https://api.supabase.com/v1/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseManagementKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization_id: Deno.env.get('SUPABASE_ORG_ID'),
        name: `clinica-${subdominio}`,
        database_password: `${subdominio}_${Date.now()}`,
        region: 'sa-east-1', // São Paulo
        plan: 'pro'
      })
    })

    if (!createProjectResponse.ok) {
      throw new Error(`Erro ao criar projeto: ${createProjectResponse.statusText}`)
    }

    const projectData = await createProjectResponse.json()
    console.log('✅ Projeto criado:', projectData.id)

    // 2. Aguardar a inicialização do banco (pode levar alguns minutos)
    let attempts = 0
    const maxAttempts = 30
    let projectReady = false

    while (attempts < maxAttempts && !projectReady) {
      await new Promise(resolve => setTimeout(resolve, 10000)) // Aguardar 10 segundos
      
      const statusResponse = await fetch(`https://api.supabase.com/v1/projects/${projectData.id}`, {
        headers: {
          'Authorization': `Bearer ${supabaseManagementKey}`,
        }
      })

      if (statusResponse.ok) {
        const status = await statusResponse.json()
        if (status.status === 'ACTIVE_HEALTHY') {
          projectReady = true
          console.log('✅ Projeto ativo e saudável')
        }
      }
      
      attempts++
      console.log(`⏳ Aguardando projeto ficar ativo... tentativa ${attempts}/${maxAttempts}`)
    }

    if (!projectReady) {
      throw new Error('Timeout: projeto não ficou ativo em tempo hábil')
    }

    // 3. Obter as chaves de API do projeto
    const keysResponse = await fetch(`https://api.supabase.com/v1/projects/${projectData.id}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${supabaseManagementKey}`,
      }
    })

    if (!keysResponse.ok) {
      throw new Error('Erro ao obter chaves da API')
    }

    const keysData = await keysResponse.json()
    const serviceRoleKey = keysData.find((key: any) => key.name === 'service_role')?.api_key
    const anonKey = keysData.find((key: any) => key.name === 'anon')?.api_key

    // 4. Clonar schema do banco modelo
    const cloneResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/clonar-schema-banco-modelo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_database_url: `https://${projectData.ref}.supabase.co`,
        target_service_role_key: serviceRoleKey
      })
    })

    if (!cloneResponse.ok) {
      console.warn('⚠️ Erro ao clonar schema, mas banco foi criado')
    }

    // 5. Configurar DNS via Hostinger
    const dnsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/configurar-dns-hostinger`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subdominio,
        acao: 'criar'
      })
    })

    console.log('🎉 Banco criado com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        message: `Banco criado com sucesso para ${nome_clinica}`,
        detalhes: {
          projeto_id: projectData.id,
          database_url: `https://${projectData.ref}.supabase.co`,
          service_role_key: serviceRoleKey,
          anon_key: anonKey,
          ref: projectData.ref
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro ao criar banco:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Erro ao criar banco da clínica',
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400 
      }
    )
  }
})