import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MedicalQuery {
  query: string;
  category: string;
  context: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { query, category, context }: MedicalQuery = await req.json();

    console.log('Consulta médica recebida:', { category, query_length: query.length });

    // Definir prompts específicos por categoria
    const systemPrompts = {
      medicamentos: `Você é um assistente médico especializado em farmacologia. Forneça informações precisas sobre medicamentos, incluindo:
      - Indicações terapêuticas
      - Posologia padrão
      - Contraindicações principais
      - Efeitos adversos mais comuns
      - Interações medicamentosas importantes
      
      IMPORTANTE: Sempre inclua a recomendação de consultar um médico ou farmacêutico. Não forneça dosagens específicas para casos individuais.`,
      
      diagnosticos: `Você é um assistente médico especializado em diagnósticos. Ajude com:
      - Interpretação de sintomas e sinais clínicos
      - Diagnósticos diferenciais
      - Exames complementares relevantes
      - Critérios diagnósticos estabelecidos
      
      IMPORTANTE: Nunca forneça diagnósticos definitivos. Sempre recomende avaliação médica presencial.`,
      
      procedimentos: `Você é um assistente médico especializado em procedimentos. Forneça informações sobre:
      - Técnicas e protocolos estabelecidos
      - Indicações e contraindicações
      - Preparação e cuidados pós-procedimento
      - Complicações possíveis
      
      IMPORTANTE: Informações apenas para profissionais de saúde qualificados.`,
      
      geral: `Você é um assistente médico geral. Forneça informações médicas precisas e atualizadas, sempre:
      - Baseando-se em evidências científicas
      - Recomendando consulta médica quando apropriado
      - Sendo claro sobre limitações das informações
      - Priorizando a segurança do paciente`
    };

    const systemPrompt = systemPrompts[category as keyof typeof systemPrompts] || systemPrompts.geral;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `${systemPrompt}
            
            Responda em português brasileiro, de forma clara e profissional. 
            Limite sua resposta a 300 palavras. 
            Use formatação markdown quando apropriado para melhor legibilidade.
            
            Sempre inclua um aviso final sobre a importância da consulta médica presencial.` 
          },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API OpenAI:', errorData);
      throw new Error(`Erro da API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Resposta gerada com sucesso');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      category,
      timestamp: new Date().toISOString(),
      disclaimer: "Esta informação é apenas para fins educacionais. Sempre consulte um profissional de saúde qualificado."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro no assistente médico:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Erro interno do assistente',
      message: 'Não foi possível processar sua consulta médica no momento.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});