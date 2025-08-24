# 📋 DOCUMENTAÇÃO COMPLETA - SISTEMA DE TELEMEDICINA

## 📖 ÍNDICE
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Configuração e Requisitos](#configuração-e-requisitos)
3. [Fluxos de Usuário](#fluxos-de-usuário)
4. [Portais de Acesso](#portais-de-acesso)
5. [Limites e Cobrança](#limites-e-cobrança)
6. [Sistema de Pagamentos](#sistema-de-pagamentos)
7. [Integração Daily.co](#integração-dailyco)
8. [Monitoramento e Métricas](#monitoramento-e-métricas)
9. [Solução de Problemas](#solução-de-problemas)
10. [API Reference](#api-reference)

---

## 🎯 VISÃO GERAL DO SISTEMA

### Arquitetura Centralizada
O sistema utiliza uma **API centralizada Daily.co** onde todas as clínicas usam a mesma chave de API do sistema principal. Isso permite:
- Controle centralizado de custos
- Monitoramento unificado de teleconsultas
- Cobrança por uso para clínicas
- Gestão simplificada de salas virtuais

### Funcionalidades Principais
- ✅ Agendamento de teleconsultas integrado ao sistema existente
- ✅ Portais separados para médicos e pacientes
- ✅ Controle de acesso por tempo (15 min antes até 2h depois)
- ✅ Limites por plano de assinatura
- ✅ Sistema de compra de pacotes adicionais
- ✅ Integração completa com Daily.co
- ✅ Monitoramento em tempo real

---

## ⚙️ CONFIGURAÇÃO E REQUISITOS

### 1. Variáveis de Ambiente (Supabase Secrets)
```bash
# API centralizada do sistema (sua chave)
DAILY_API_KEY_SISTEMA=sua_api_key_centralizada_here

# Mercado Pago para pagamentos
MERCADOPAGO_ACCESS_TOKEN=sua_mp_access_token_here
```

### 2. Configuração de Planos
```sql
-- Limites por tipo de plano
BÁSICO: 0 teleconsultas gratuitas, bloqueado
AVANÇADO: 20 teleconsultas gratuitas/mês
PREMIUM: 50 teleconsultas gratuitas/mês

-- Pacotes adicionais
BÁSICO: R$ 50,00 por 10 consultas
AVANÇADO: R$ 40,00 por 10 consultas  
PREMIUM: R$ 30,00 por 15 consultas
```

### 3. Ativação por Clínica
```sql
-- Ativar telemedicina para uma clínica
UPDATE configuracoes_clinica 
SET telemedicina_ativa = true,
    valor_adicional_telemedicina = 0.00
WHERE clinica_id = 'sua_clinica_id';
```

---

## 👥 FLUXOS DE USUÁRIO

### Para Clínicas (Admin/Funcionários)

#### 1. Agendamento de Teleconsulta
```
1. Acesso: Dashboard → Agenda → Novo Agendamento
2. Selecionar: ☑️ "Teleconsulta" 
3. Sistema verifica: Limites do plano
4. Se permitido: Cria agendamento + sala Daily.co automaticamente
5. Resultado: URLs geradas para médico e paciente
```

#### 2. Compra de Pacotes Adicionais
```
1. Acesso: Página Telemedicina
2. Visualizar: Uso atual vs limites
3. Clicar: "Comprar Pacote com X consultas"
4. Redirecionamento: Mercado Pago
5. Após pagamento: Consultas adicionadas automaticamente
```

### Para Médicos

#### 1. Acesso ao Portal
```
URL: https://seudominio.com/medico/telemedicina/[agendamento_id]
Login: CPF + Senha configurada
```

#### 2. Controle de Acesso por Tempo
- **🚫 Bloqueado**: Mais de 15 min antes da consulta
- **✅ Liberado**: 15 min antes até 2h depois da consulta  
- **❌ Expirado**: Mais de 2h após o horário agendado

#### 3. Interface do Médico
```
📊 Detalhes da Consulta
├── Paciente: Nome, idade, convênio
├── Horário: Data/hora agendada
├── Status: Aguardando/Em andamento/Concluída
└── Sala Virtual: Link de acesso

🎥 Controles de Vídeo
├── 📹 Camera: Liga/Desliga
├── 🎙️ Microfone: Liga/Desliga  
├── 🖥️ Compartilhar Tela: Ativar/Desativar
└── ❌ Encerrar Consulta
```

### Para Pacientes

#### 1. Acesso ao Portal
```
URL: https://seudominio.com/paciente/telemedicina/[agendamento_id]
Login: CPF + Senha configurada (mesma do sistema)
```

#### 2. Validação de Acesso
- Sistema verifica se paciente pertence à consulta
- Mesmas regras de tempo que médicos
- Interface simplificada focada na consulta

#### 3. Interface do Paciente
```
📋 Informações da Consulta  
├── Médico: Dr. Nome, CRM, Especialidade
├── Clínica: Nome, telefone, endereço
├── Horário: Data/hora da consulta
└── Status: Mensagem de acesso

🎥 Sala de Consulta
├── Aguardando médico entrar
├── Consulta em andamento
└── Consulta finalizada
```

---

## 🏥 PORTAIS DE ACESSO

### Portal do Médico
```typescript
// URL Pattern
/medico/telemedicina/:agendamento_id

// Componente Principal
src/pages/MedicoTelemedicina.tsx

// Funcionalidades
- Autenticação médica via CPF
- Verificação de agendamento
- Controle de acesso por tempo
- Interface de videochamada
- Início/fim de consulta
```

### Portal do Paciente  
```typescript
// URL Pattern
/paciente/telemedicina/:agendamento_id

// Componente Principal  
src/pages/PacienteTelemedicina.tsx

// Funcionalidades
- Autenticação paciente via CPF
- Validação de pertencimento à consulta
- Interface simplificada
- Acesso à sala virtual
```

### Hook de Controle de Acesso
```typescript
// src/hooks/useTeleconsultaAccess.tsx
const {
  canAccess,        // Pode acessar agora?
  minutesRemaining, // Minutos até/desde consulta  
  isExpired,        // Acesso expirado?
  teleconsulta,     // Dados da teleconsulta
  getStatusMessage, // Mensagem de status
  registrarEntrada  // Registrar entrada do usuário
} = useTeleconsultaAccess(agendamentoId, userType);
```

---

## 💰 LIMITES E COBRANÇA

### Sistema de Limites por Plano

#### Hook de Gerenciamento
```typescript
// src/hooks/useTeleconsultaLimits.tsx
const {
  limiteGratuitas,      // Limite do plano
  utilizadas,           // Teleconsultas usadas no mês
  totalDisponivel,      // Total disponível (grátis + compradas)
  restantes,            // Consultas restantes
  podecriar,            // Pode criar nova consulta?
  valorPacoteAdicional, // Preço do pacote adicional
  consultasPorPacote,   // Consultas por pacote
  comprarPacoteAdicional // Função de compra
} = useTeleconsultaLimits();
```

#### Controle de Funcionalidade
```typescript
// src/hooks/useFeatureControl.tsx 
const {
  isFeatureBlocked,  // Funcionalidade bloqueada?
  planoFuncionalidades, // Features do plano atual
  assinatura         // Dados da assinatura
} = useFeatureControl();

// Uso no agendamento
if (isFeatureBlocked('telemedicina')) {
  // Mostrar mensagem de upgrade
  // Bloquear checkbox de teleconsulta
}
```

### Tabelas do Banco de Dados

#### teleconsultas_uso_mensal
```sql
CREATE TABLE teleconsultas_uso_mensal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL,
  mes_referencia DATE NOT NULL,
  total_utilizadas INTEGER DEFAULT 0,
  pacotes_adicionais_comprados INTEGER DEFAULT 0, 
  valor_total_pacotes NUMERIC DEFAULT 0.00,
  UNIQUE(clinica_id, mes_referencia)
);
```

#### planos_assinatura (colunas teleconsulta)
```sql
-- Adicionadas ao schema existente
limite_teleconsultas_gratuitas INTEGER DEFAULT 0,
valor_pacote_adicional_teleconsulta NUMERIC DEFAULT 50.00,
consultas_por_pacote_adicional INTEGER DEFAULT 10,
funcionalidades_bloqueadas TEXT[] DEFAULT ARRAY[]::text[]
```

---

## 💳 SISTEMA DE PAGAMENTOS

### Edge Function de Pagamento
```typescript
// supabase/functions/create-mercadopago-preference/index.ts

// Corpo da requisição para pacotes
{
  clinica_id: "uuid",
  tipo_item: "pacote_teleconsulta", 
  quantidade_pacotes: 1,
  nome_clinica: "Nome da Clínica",
  email_clinica: "email@clinica.com",
  valor_unitario: 50.00,
  consultas_por_pacote: 10,
  descricao: "Pacote com 10 teleconsultas adicionais"
}
```

### Fluxo de Compra
```
1. Usuário clica "Comprar Pacote"
2. Frontend chama create-mercadopago-preference
3. Sistema gera preferência no Mercado Pago
4. Usuário é redirecionado para pagamento
5. Após pagamento: Webhook processa compra
6. Sistema adiciona consultas ao uso mensal
```

### Função de Processamento
```sql
-- Processa compra aprovada
SELECT processar_compra_pacote_teleconsulta(
  'clinica_id'::uuid,
  1 -- quantidade de pacotes
);

-- Retorna
{
  "success": true,
  "pacotes_comprados": 1,
  "valor_total": 50.00,
  "consultas_adicionadas": 10
}
```

---

## 🔗 INTEGRAÇÃO DAILY.CO

### API Centralizada
```typescript
// Todas as clínicas usam a mesma API key
const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY_SISTEMA');

// Configuração da sala
const roomConfig = {
  name: `consulta-${clinica_id}-${agendamento_id}-${timestamp}`,
  privacy: 'private',
  properties: {
    max_participants: 2,
    enable_screenshare: true,
    enable_chat: true,
    enable_knocking: true,
    enable_prejoin_ui: true,
    exp: consulta_timestamp + (2 * 60 * 60) // 2h após consulta
  }
};
```

### URLs Personalizadas
```typescript
// URLs com informações do usuário
const doctorUrl = `${baseUrl}?t=${medicoNome}&userRole=doctor&clinica=${clinicaNome}`;
const patientUrl = `${baseUrl}?t=${pacienteNome}&userRole=patient&clinica=${clinicaNome}`;
```

### Serviço Daily.co
```typescript
// src/services/dailyService.ts
class DailyService {
  // Criar sala usando edge function
  async createRoom(config) {
    return supabase.functions.invoke('create-daily-room', {
      body: { agendamento_id, clinica_id }
    });
  }
  
  // Deletar sala 
  async deleteRoom(roomName) {
    return supabase.functions.invoke('delete-daily-room', {
      body: { room_name: roomName }
    });
  }
}
```

---

## 📊 MONITORAMENTO E MÉTRICAS

### Página de Telemedicina
```
Localização: /telemedicina

📈 Métricas Principais
├── Total de teleconsultas realizadas
├── Tempo médio de duração  
├── Taxa de conclusão
└── Receita gerada

💰 Controle Financeiro
├── Limites do plano atual
├── Teleconsultas utilizadas no mês
├── Pacotes adicionais comprados
└── Botão de compra de pacotes

📊 Gráficos e Relatórios
├── Teleconsultas por período
├── Médicos mais ativos
├── Horários de pico
└── Relatório de faturamento
```

### Dashboard Financeiro
```
Integração: Métricas de teleconsulta

💵 Receita por Teleconsultas
├── Valores de pacotes adicionais vendidos
├── Projeção de receita mensal
├── Comparativo por plano de assinatura
└── Margem de contribuição
```

### Logs e Auditoria
```sql
-- Tabela teleconsultas rastreia:
- Data/hora de criação da sala
- Quando médico entrou (medico_entrou_em)
- Quando paciente entrou (paciente_entrou_em) 
- Duração da consulta (duracao_segundos)
- Status final (agendada/em_andamento/concluida/cancelada)
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Problemas Comuns

#### 1. "Sala não encontrada"
```
Possíveis causas:
- Daily.co API key não configurada
- Teleconsulta não criada automaticamente
- Room expirada (>2h após consulta)

Solução:
1. Verificar DAILY_API_KEY_SISTEMA em Supabase
2. Recriar agendamento como teleconsulta
3. Verificar logs da edge function create-daily-room
```

#### 2. "Acesso negado" 
```
Possíveis causas:
- Usuário tentando acessar fora do horário permitido
- Teleconsulta não pertence ao usuário
- Agendamento cancelado/inativo

Solução:
1. Verificar horário da consulta vs tempo atual
2. Confirmar agendamento_id correto
3. Verificar status do agendamento
```

#### 3. "Limite de teleconsultas atingido"
```
Possíveis causas:
- Plano básico sem teleconsultas incluídas
- Limite mensal esgotado
- Erro no cálculo de limites

Solução:
1. Verificar plano da clínica
2. Comprar pacote adicional
3. Upgrade de plano se necessário
```

#### 4. Pagamento não processado
```
Possíveis causas:
- Webhook Mercado Pago não configurado
- Erro na edge function de pagamento
- Dados incorretos na preferência

Solução:
1. Verificar webhook em funcionamento
2. Analisar logs do Mercado Pago
3. Validar dados enviados na criação
```

### Verificação de Configuração
```sql
-- Verificar se clínica tem telemedicina ativa
SELECT c.nome, cc.telemedicina_ativa, a.tipo_plano
FROM clinicas c
JOIN configuracoes_clinica cc ON c.id = cc.clinica_id  
JOIN assinaturas a ON c.id = a.clinica_id
WHERE c.id = 'sua_clinica_id';

-- Verificar limites e uso atual
SELECT 
  pa.limite_teleconsultas_gratuitas,
  pa.valor_pacote_adicional_teleconsulta,
  tum.total_utilizadas,
  tum.pacotes_adicionais_comprados
FROM planos_assinatura pa
JOIN assinaturas a ON a.tipo_plano = pa.tipo_plano
LEFT JOIN teleconsultas_uso_mensal tum ON a.clinica_id = tum.clinica_id
WHERE a.clinica_id = 'sua_clinica_id';
```

### Logs Importantes
```bash
# Edge function create-daily-room
Supabase Dashboard > Edge Functions > create-daily-room > Logs

# Edge function create-mercadopago-preference  
Supabase Dashboard > Edge Functions > create-mercadopago-preference > Logs

# Teleconsultas em tempo real
SELECT * FROM teleconsultas 
WHERE created_at > now() - interval '1 day'
ORDER BY created_at DESC;
```

---

## 📡 API REFERENCE

### Edge Functions

#### create-daily-room
```typescript
POST /functions/v1/create-daily-room

Body: {
  agendamento_id: string,
  clinica_id: string
}

Response: {
  success: boolean,
  roomName: string,
  roomUrl: string, 
  doctorUrl: string,
  patientUrl: string,
  expiresAt: number
}
```

#### delete-daily-room
```typescript
POST /functions/v1/delete-daily-room

Body: {
  room_name: string
}

Response: {
  success: boolean,
  message: string
}
```

#### create-mercadopago-preference
```typescript
POST /functions/v1/create-mercadopago-preference

Body: {
  clinica_id: string,
  tipo_item: "pacote_teleconsulta",
  quantidade_pacotes: number,
  nome_clinica: string,
  email_clinica: string,
  valor_unitario: number,
  consultas_por_pacote: number,
  descricao: string
}

Response: {
  payment_url: string,
  preference_id: string
}
```

### Database Functions

#### verificar_limite_teleconsultas
```sql
SELECT verificar_limite_teleconsultas(
  'clinica_id'::uuid,
  '2024-01-01'::date -- mes_referencia opcional
);

-- Retorna
{
  "limite_gratuitas": 20,
  "utilizadas": 5,
  "pacotes_comprados": 1,
  "total_disponivel": 30,
  "pode_criar": true,
  "restantes": 25
}
```

#### processar_compra_pacote_teleconsulta
```sql
SELECT processar_compra_pacote_teleconsulta(
  'clinica_id'::uuid,
  1 -- quantidade_pacotes
);

-- Retorna  
{
  "success": true,
  "pacotes_comprados": 1,
  "valor_total": 50.00,
  "consultas_adicionadas": 10
}
```

#### verificar_acesso_teleconsulta
```sql
SELECT verificar_acesso_teleconsulta(
  'agendamento_id'::uuid,
  'medico' -- ou 'paciente'
);

-- Retorna
{
  "pode_acessar": true,
  "minutos_restantes": -10,
  "url_sala": "https://daily.co/room-url",
  "sala_id": "consulta-123-456",
  "status_consulta": "agendada"
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### ✅ FASE 1: Centralização API Daily.co
- [x] Edge function create-daily-room usa API centralizada
- [x] Todas as salas criadas com a mesma chave
- [x] URLs personalizadas com dados do usuário
- [x] Registro de uso para cobrança

### ✅ FASE 2: Sistema de Pagamento
- [x] Edge function create-mercadopago-preference corrigida
- [x] Hook useTeleconsultaLimits atualizado
- [x] Parâmetros corretos para pacotes de teleconsulta
- [x] Processamento de compra automatizado

### ✅ FASE 3: Configuração Clínica Específica
- [x] Clínica Integrammedica configurada
- [x] Plano avançado com 20 teleconsultas gratuitas
- [x] Telemedicina ativada
- [x] Limites por plano configurados

### ✅ FASE 4: Documentação Completa
- [x] Documentação técnica detalhada
- [x] Fluxos de médico e paciente documentados
- [x] API reference completa
- [x] Guia de solução de problemas

### ✅ FASE 5: Portais e Interface
- [x] Portal do médico funcionando
- [x] Portal do paciente funcionando  
- [x] Controle de acesso por tempo
- [x] Interface de videochamada integrada

---

## 🎯 PRÓXIMOS PASSOS

### Melhorias Futuras
1. **App Mobile**: Versão nativa para iOS/Android
2. **Notificações Push**: Lembretes automáticos
3. **Gravação Automática**: Backup das consultas
4. **IA Transcrição**: Anotações automáticas
5. **Analytics Avançado**: Métricas detalhadas

### Integrações Adicionais
1. **WhatsApp/Email**: Notificações automáticas
2. **Google Calendar**: Sincronização de agenda
3. **Assinatura Digital**: Documentos médicos
4. **Pagamento Online**: PIX, cartão de crédito

---

**🏆 Sistema de Telemedicina 100% Funcional e Documentado!**

*Todas as funcionalidades implementadas e testadas. API centralizada, portais funcionando, pagamentos integrados e documentação completa disponível.*