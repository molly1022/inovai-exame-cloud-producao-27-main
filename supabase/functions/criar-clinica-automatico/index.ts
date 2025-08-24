import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NovaClinicaRequest {
  nome: string
  email: string
  telefone?: string
  cnpj?: string
  endereco?: string
  subdominio: string
  senha: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { nome, email, telefone, cnpj, endereco, subdominio, senha }: NovaClinicaRequest = await req.json()

    console.log('🏥 Iniciando criação automática da clínica:', nome)

    // 1. Validar dados obrigatórios
    if (!nome || !email || !subdominio || !senha) {
      throw new Error('Dados obrigatórios não fornecidos: nome, email, subdomínio e senha são obrigatórios')
    }

    // 2. Verificar se subdomínio já existe
    const { data: existingClinica } = await supabase
      .from('clinicas_central')
      .select('id')
      .eq('subdominio', subdominio)
      .single()

    if (existingClinica) {
      throw new Error(`Subdomínio "${subdominio}" já está sendo usado por outra clínica`)
    }

    // 3. Gerar database_name único
    const database_name = `clinica_${subdominio.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    
    console.log('💾 Database name gerado:', database_name)

    // 4. Inserir clínica no banco central
    const { data: novaClinica, error: insertError } = await supabase
      .from('clinicas_central')
      .insert({
        nome,
        email,
        telefone,
        cnpj,
        endereco,
        subdominio,
        database_name,
        status: 'ativa',
        // Configurações padrão
        configuracoes: {
          senha_primeira_configuracao: senha,
          criada_automaticamente: true,
          data_criacao: new Date().toISOString()
        },
        limites: {
          medicos: 10,
          funcionarios: 20,
          pacientes: 1000,
          agendamentos_mes: 500
        }
      })
      .select()
      .single()

    if (insertError) throw insertError

    console.log('✅ Clínica inserida no banco central com ID:', novaClinica.id)

    // 5. Registrar log da operação
    await supabase
      .from('logs_sistema')
      .insert({
        acao: 'criar_clinica_automatico',
        tabela: 'clinicas_central',
        registro_id: novaClinica.id,
        dados_novos: {
          nome,
          subdominio,
          database_name,
          created_automatically: true
        },
        usuario_id: 'sistema_automatico',
        nivel: 'info'
      })

    // 6. Registrar conexão de monitoramento
    await supabase
      .from('conexoes_clinicas')
      .insert({
        clinica_id: novaClinica.id,
        subdominio,
        status: 'ativa',
        ultimo_ping: new Date().toISOString()
      })

    console.log('🎯 Clínica criada com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Clínica criada com sucesso',
        clinica: {
          id: novaClinica.id,
          nome: novaClinica.nome,
          subdominio: novaClinica.subdominio,
          database_name: novaClinica.database_name,
          url_acesso: `https://${subdominio}.somosinovai.com`
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
    console.error('❌ Erro ao criar clínica:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Erro interno do servidor',
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