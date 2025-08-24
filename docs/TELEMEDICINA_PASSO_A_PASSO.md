# Telemedicina: Implementação Passo a Passo

## Visão Geral
Este guia explica como implementar o sistema de telemedicina no Unovai Exame Cloud, permitindo consultas por vídeo entre médicos e pacientes.

## Opções de Implementação

### 1. Plataforma Própria (Complexa)
- **Prós**: Controle total, customização completa
- **Contras**: Muito complexo, alto custo de desenvolvimento
- **Tempo**: 3-6 meses
- **Custo**: R$ 50.000 - R$ 200.000

### 2. Daily.co (RECOMENDADO)
- **Prós**: Fácil implementação, alta qualidade, suporte
- **Contras**: Custo por minuto
- **Tempo**: 2-4 semanas
- **Custo**: $0.015/minuto (~R$ 0,075/minuto)

### 3. Jitsi Meet (Gratuito)
- **Prós**: Gratuito, open source
- **Contras**: Qualidade variável, menos recursos
- **Tempo**: 3-6 semanas
- **Custo**: Apenas hospedagem

## Implementação Recomendada: Daily.co

### Passo 1: Configuração da Conta Daily.co

1. **Criar conta no Daily.co**
   - Acesse https://www.daily.co/
   - Crie uma conta gratuita (1000 minutos/mês)
   - Obtenha sua API Key no dashboard

2. **Configurar preços**
   - Plano gratuito: 1000 minutos/mês
   - Plano pago: $0.015/minuto participante
   - Para clínica média: ~R$ 300-500/mês

### Passo 2: Configuração do Banco de Dados

```sql
-- Criar tabela de teleconsultas
CREATE TABLE teleconsultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL,
  agendamento_id UUID NOT NULL,
  medico_id UUID NOT NULL,
  paciente_id UUID NOT NULL,
  daily_room_url TEXT NOT NULL,
  daily_room_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada',
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  duracao_segundos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para isolamento por clínica
ALTER TABLE teleconsultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teleconsultas isoladas por clinica" 
ON teleconsultas FOR ALL 
USING (clinica_id IN (SELECT id FROM clinicas WHERE id = teleconsultas.clinica_id));
```

### Passo 3: Integração com Daily.co API

```typescript
// utils/daily.ts
export class DailyService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = 'YOUR_DAILY_API_KEY';
  }
  
  async criarSala(agendamentoId: string) {
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `consulta-${agendamentoId}`,
        properties: {
          max_participants: 2,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.round(Date.now() / 1000) + (2 * 60 * 60) // 2 horas
        }
      })
    });
    
    return response.json();
  }
}
```

### Passo 4: Modificar Sistema de Agendamento

```typescript
// components/AgendamentoModal.tsx - Adicionar campo de telemedicina
const [isTelemedicina, setIsTelemedicina] = useState(false);

// Na função de salvar agendamento:
if (isTelemedicina) {
  const dailyService = new DailyService();
  const sala = await dailyService.criarSala(agendamentoId);
  
  await supabase.from('teleconsultas').insert({
    clinica_id: clinica.id,
    agendamento_id: agendamentoId,
    medico_id: formData.medico_id,
    paciente_id: formData.paciente_id,
    daily_room_url: sala.url,
    daily_room_name: sala.name,
    status: 'agendada'
  });
}
```

### Passo 5: Portal do Médico

```typescript
// components/MedicoTelemedicina.tsx
import DailyIframe from '@daily-co/daily-js';

export const MedicoTelemedicina = ({ teleconsulta }: { teleconsulta: any }) => {
  const [callFrame, setCallFrame] = useState<any>(null);
  
  const iniciarConsulta = async () => {
    const frame = DailyIframe.createFrame({
      iframeStyle: {
        width: '100%',
        height: '500px',
        border: '0'
      }
    });
    
    await frame.join({
      url: teleconsulta.daily_room_url,
      userName: `Dr. ${medico.nome_completo}`
    });
    
    setCallFrame(frame);
    
    // Atualizar status para "em_andamento"
    await supabase
      .from('teleconsultas')
      .update({ 
        status: 'em_andamento',
        data_inicio: new Date().toISOString()
      })
      .eq('id', teleconsulta.id);
  };
  
  const encerrarConsulta = async () => {
    if (callFrame) {
      await callFrame.leave();
      await callFrame.destroy();
    }
    
    // Atualizar status para "finalizada"
    await supabase
      .from('teleconsultas')
      .update({ 
        status: 'finalizada',
        data_fim: new Date().toISOString()
      })
      .eq('id', teleconsulta.id);
  };
  
  return (
    <div className="telemedicina-container">
      <div className="controls mb-4">
        <Button onClick={iniciarConsulta}>Iniciar Consulta</Button>
        <Button onClick={encerrarConsulta} variant="destructive">
          Encerrar Consulta
        </Button>
      </div>
      <div id="daily-iframe-container" />
    </div>
  );
};
```

### Passo 6: Portal do Paciente

```typescript
// components/PacienteTelemedicina.tsx
export const PacienteTelemedicina = ({ teleconsulta, paciente }: any) => {
  const podeEntrar = () => {
    const agora = new Date();
    const consulta = new Date(teleconsulta.agendamento.data_agendamento);
    const diferencaMinutos = (consulta.getTime() - agora.getTime()) / (1000 * 60);
    
    // Permitir entrada 15 minutos antes
    return diferencaMinutos <= 15 && diferencaMinutos >= -60;
  };
  
  const entrarNaConsulta = async () => {
    if (!podeEntrar()) {
      toast({
        title: "Acesso Restrito",
        description: "A sala estará disponível 15 minutos antes da consulta.",
        variant: "destructive"
      });
      return;
    }
    
    const frame = DailyIframe.createFrame({
      iframeStyle: {
        width: '100%',
        height: '500px',
        border: '0'
      }
    });
    
    await frame.join({
      url: teleconsulta.daily_room_url,
      userName: paciente.nome
    });
  };
  
  return (
    <div className="p-6">
      <h2>Teleconsulta Agendada</h2>
      <p>Médico: {teleconsulta.medico.nome_completo}</p>
      <p>Data: {new Date(teleconsulta.agendamento.data_agendamento).toLocaleString()}</p>
      
      {podeEntrar() ? (
        <Button onClick={entrarNaConsulta} className="mt-4">
          Entrar na Consulta
        </Button>
      ) : (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded">
          <p>A sala de consulta estará disponível 15 minutos antes do horário agendado.</p>
        </div>
      )}
    </div>
  );
};
```

### Passo 7: Implementação no Menu

```typescript
// Adicionar no AppSidebar.tsx
{
  title: "Telemedicina",
  icon: Video,
  url: "/telemedicina",
  feature: "telemedicina"
}
```

### Passo 8: Configurar Secrets no Supabase

1. Acessar Supabase Dashboard
2. Ir em Settings > Edge Functions
3. Adicionar secret: `DAILY_API_KEY`

### Passo 9: Custos e Limites

**Cálculo de Custos:**
- Consulta de 30 min = 60 minutos participante (2 pessoas × 30 min)
- Custo: 60 × $0.015 = $0.90 (~R$ 4,50 por consulta)
- 100 consultas/mês = R$ 450/mês

**Limites por Plano:**
- Básico: Sem telemedicina
- Intermediário: 50 consultas/mês
- Avançado: Ilimitado

### Passo 10: Testes

1. **Teste de Criação de Sala**
   - Agendar consulta de telemedicina
   - Verificar se sala foi criada no Daily.co

2. **Teste de Acesso Médico**
   - Entrar no portal médico
   - Iniciar teleconsulta

3. **Teste de Acesso Paciente**
   - Tentar entrar antes dos 15 minutos (deve bloquear)
   - Entrar após liberação

4. **Teste de Finalização**
   - Encerrar consulta
   - Verificar se dados foram salvos

### Considerações Importantes

1. **Qualidade de Internet**
   - Recomendar mínimo 1 Mbps upload/download
   - Implementar teste de velocidade

2. **Compatibilidade**
   - Chrome, Firefox, Safari mais recentes
   - iOS Safari 11+, Android Chrome 80+

3. **Privacidade**
   - Consultas não são gravadas por padrão
   - Dados ficam apenas no Daily.co durante a chamada
   - Implementar LGPD compliance

4. **Backup**
   - Sempre ter plano B (telefone, reagendamento)
   - Monitorar qualidade da chamada

### Próximos Passos

1. Implementar notificações por email/SMS
2. Adicionar gravação (opcional, com consentimento)
3. Integrar com receituário digital
4. Criar relatórios de teleconsultas
5. Implementar chat durante a consulta

Este sistema fornecerá uma solução robusta de telemedicina integrada ao seu sistema de gestão clínica.