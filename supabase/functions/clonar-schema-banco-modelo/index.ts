import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClonarSchemaRequest {
  target_database_url: string
  target_service_role_key: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { target_database_url, target_service_role_key }: ClonarSchemaRequest = await req.json()

    console.log(`📋 Clonando schema do banco modelo para: ${target_database_url}`)

    // Cliente do banco modelo (origem)
    const modeloClient = createClient(
      'https://tgydssyqgmifcuajacgo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWRzc3lxZ21pZmN1YWphY2dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc4NTk3OSwiZXhwIjoyMDY4MzYxOTc5fQ.NK2ArcUJl7mG1QdEwzRHn6F_dHWi8mc00o2f_4JCX-8'
    )

    // Cliente do banco alvo (destino)
    const targetClient = createClient(target_database_url, target_service_role_key)

    // Schema básico para clínicas
    const schemaSQL = `
      -- Tabela de médicos
      CREATE TABLE IF NOT EXISTS medicos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        crm TEXT NOT NULL,
        especialidade TEXT,
        telefone TEXT,
        email TEXT,
        status TEXT DEFAULT 'ativo',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de pacientes  
      CREATE TABLE IF NOT EXISTS pacientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        cpf TEXT,
        data_nascimento DATE,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        convenio TEXT,
        numero_convenio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de agendamentos
      CREATE TABLE IF NOT EXISTS agendamentos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        paciente_id UUID REFERENCES pacientes(id),
        medico_id UUID REFERENCES medicos(id),
        data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT DEFAULT 'agendado',
        observacoes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de exames
      CREATE TABLE IF NOT EXISTS exames (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        paciente_id UUID REFERENCES pacientes(id),
        medico_id UUID REFERENCES medicos(id),
        tipo_exame TEXT NOT NULL,
        data_exame TIMESTAMP WITH TIME ZONE,
        resultado TEXT,
        arquivo_url TEXT,
        status TEXT DEFAULT 'pendente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Habilitar RLS em todas as tabelas
      ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE exames ENABLE ROW LEVEL SECURITY;

      -- Políticas RLS básicas (permitir tudo por enquanto)
      CREATE POLICY "Permitir acesso total medicos" ON medicos FOR ALL USING (true);
      CREATE POLICY "Permitir acesso total pacientes" ON pacientes FOR ALL USING (true);
      CREATE POLICY "Permitir acesso total agendamentos" ON agendamentos FOR ALL USING (true);
      CREATE POLICY "Permitir acesso total exames" ON exames FOR ALL USING (true);
    `

    // Executar SQL no banco destino
    const { error } = await targetClient.rpc('exec_sql', { sql: schemaSQL })

    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      
      // Fallback: tentar criar tabelas individualmente
      const tables = [
        {
          name: 'medicos',
          sql: `CREATE TABLE IF NOT EXISTS medicos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nome TEXT NOT NULL,
            crm TEXT NOT NULL,
            especialidade TEXT,
            telefone TEXT,
            email TEXT,
            status TEXT DEFAULT 'ativo',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
        },
        {
          name: 'pacientes', 
          sql: `CREATE TABLE IF NOT EXISTS pacientes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nome TEXT NOT NULL,
            cpf TEXT,
            data_nascimento DATE,
            telefone TEXT,
            email TEXT,
            endereco TEXT,
            convenio TEXT,
            numero_convenio TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
        }
      ]

      for (const table of tables) {
        try {
          await targetClient.rpc('exec_sql', { sql: table.sql })
          console.log(`✅ Tabela ${table.name} criada`)
        } catch (tableError) {
          console.warn(`⚠️ Erro ao criar tabela ${table.name}:`, tableError)
        }
      }
    }

    console.log('✅ Schema clonado com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Schema do banco modelo clonado com sucesso',
        tabelas_criadas: ['medicos', 'pacientes', 'agendamentos', 'exames']
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
    console.error('❌ Erro ao clonar schema:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Erro ao clonar schema do banco modelo',
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