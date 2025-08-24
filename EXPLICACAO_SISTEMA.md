# Sistema de Gestão de Clínicas

## Visão Geral
Sistema completo para gestão de clínicas médicas com módulos para administração, médicos, funcionários e pacientes.

## Arquitetura Técnica
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth + Sistema customizado
- **Pagamentos**: Mercado Pago
- **Storage**: Supabase Storage

## Estrutura do Banco de Dados

### 1. **usuarios** - Sistema de usuários principal
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  funcionario_id UUID REFERENCES funcionarios(id),
  ativo BOOLEAN DEFAULT true,
  primeiro_login BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  cpf TEXT NOT NULL,
  email TEXT,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL
);
```

### 2. **clinicas** - Dados das clínicas
```sql
CREATE TABLE clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  subdominio TEXT,
  foto_perfil_url TEXT
);
```

### 3. **pacientes** - Cadastro de pacientes
```sql
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  data_nascimento DATE,
  peso NUMERIC,
  altura NUMERIC,
  idade INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES usuarios(id),
  convenio_id UUID REFERENCES convenios(id),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  email TEXT,
  telefone TEXT,
  telefone_urgencia TEXT,
  cep TEXT,
  endereco_completo TEXT,
  cidade TEXT,
  bairro TEXT,
  numero TEXT,
  nome_pai TEXT,
  nome_mae TEXT,
  senha_acesso TEXT NOT NULL,
  foto_perfil_url TEXT,
  genero TEXT,
  estado TEXT,
  complemento TEXT,
  observacoes TEXT,
  numero_convenio TEXT
);
```

### 4. **medicos** - Cadastro de médicos
```sql
CREATE TABLE medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES usuarios(id),
  nome_completo TEXT NOT NULL,
  crm TEXT,
  cpf TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  especialidade TEXT,
  categoria_1 TEXT,
  categoria_2 TEXT,
  documento_url TEXT,
  coren TEXT,
  senha_acesso TEXT,
  setor VARCHAR,
  categoria_trabalho TEXT[] DEFAULT ARRAY[]::text[]
);
```

### 5. **funcionarios** - Cadastro de funcionários
```sql
CREATE TABLE funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  endereco TEXT,
  funcao TEXT NOT NULL,
  cep TEXT,
  telefone TEXT,
  email TEXT
);
```

### 6. **agendamentos** - Agendamentos e consultas
```sql
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID REFERENCES medicos(id),
  data_agendamento TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  categoria_id UUID REFERENCES categorias_exames(id),
  created_by UUID REFERENCES usuarios(id),
  convenio_id UUID REFERENCES convenios(id),
  data_conclusao TIMESTAMPTZ,
  check_in_time TIMESTAMPTZ,
  auto_confirmado BOOLEAN DEFAULT false,
  auto_iniciado BOOLEAN DEFAULT false,
  tempo_consulta_minutos INTEGER,
  valor_exame NUMERIC DEFAULT 0.00,
  valor_pago NUMERIC DEFAULT 0.00,
  status TEXT DEFAULT 'agendado',
  tipo_exame TEXT NOT NULL,
  observacoes TEXT,
  horario TEXT,
  status_pagamento TEXT DEFAULT 'pendente',
  metodo_pagamento TEXT
);
```

### 7. **exames** - Exames realizados
```sql
CREATE TABLE exames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  data_exame DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  medico_id UUID REFERENCES medicos(id),
  created_by UUID REFERENCES usuarios(id),
  convenio_id UUID REFERENCES convenios(id),
  tipo TEXT NOT NULL,
  comentarios TEXT,
  status TEXT DEFAULT 'disponivel',
  arquivo_url TEXT,
  arquivo_nome TEXT,
  imagens_urls TEXT[],
  imagens_nomes TEXT[],
  laudo_url TEXT,
  laudo_nome TEXT
);
```

### 8. **receitas_medicas** - Receitas médicas
```sql
CREATE TABLE receitas_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  data_emissao TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  medicamentos TEXT NOT NULL,
  observacoes TEXT,
  tipo_receita TEXT NOT NULL DEFAULT 'basica'
);
```

### 9. **convenios** - Convênios médicos
```sql
CREATE TABLE convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ativo BOOLEAN DEFAULT true,
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  percentual_desconto NUMERIC DEFAULT 0.00,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  descricao TEXT
);
```

### 10. **categorias_exames** - Categorias de exames
```sql
CREATE TABLE categorias_exames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  categoria_pai_id UUID REFERENCES categorias_exames(id),
  valor NUMERIC DEFAULT 0.00,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#3B82F6'
);
```

### 11. **exames_valores** - Tabela de preços
```sql
CREATE TABLE exames_valores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  valor NUMERIC NOT NULL DEFAULT 0.00,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  tipo_exame TEXT NOT NULL,
  descricao TEXT
);
```

### 12. **assinaturas** - Assinaturas e planos
```sql
CREATE TABLE assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  valor NUMERIC DEFAULT 150.00,
  proximo_pagamento DATE,
  dias_restantes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  periodo_meses INTEGER DEFAULT 1,
  valor_original NUMERIC,
  percentual_desconto NUMERIC DEFAULT 0.00,
  data_inicio DATE DEFAULT CURRENT_DATE,
  limite_funcionarios INTEGER DEFAULT 4,
  limite_medicos INTEGER DEFAULT 5,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'ativa',
  tipo_plano TEXT DEFAULT 'basico'
);
```

### 13. **planos_assinatura** - Planos disponíveis
```sql
CREATE TABLE planos_assinatura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_meses INTEGER NOT NULL,
  valor_base NUMERIC NOT NULL DEFAULT 150.00,
  percentual_desconto NUMERIC NOT NULL DEFAULT 0.00,
  valor_final NUMERIC,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  limite_funcionarios INTEGER NOT NULL DEFAULT 4,
  limite_medicos INTEGER NOT NULL DEFAULT 5,
  tipo_plano TEXT NOT NULL DEFAULT 'basico'
);
```

### 14. **configuracoes_clinica** - Configurações gerais
```sql
CREATE TABLE configuracoes_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email_login_clinica TEXT NOT NULL DEFAULT 'adminclinica@inovai.com',
  senha_acesso_clinica TEXT NOT NULL DEFAULT 'inovaiadmin@321',
  codigo_acesso_admin TEXT NOT NULL DEFAULT 'admin2024',
  codigo_acesso_clinica TEXT NOT NULL DEFAULT 'clinica2024',
  codigo_acesso_funcionario TEXT NOT NULL DEFAULT 'funcionario2024'
);
```

### 15. **configuracoes_email** - Config. de email
```sql
CREATE TABLE configuracoes_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  ativo BOOLEAN DEFAULT true,
  horas_antecedencia INTEGER DEFAULT 24,
  horario_envio TIME DEFAULT '18:00:00',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  template_personalizado TEXT,
  remetente_nome TEXT DEFAULT 'Clínica',
  remetente_email TEXT DEFAULT 'noreply@clinica.com',
  assunto_email TEXT DEFAULT 'Lembrete: Consulta agendada para amanhã'
);
```

### 16. **configuracoes_automacao** - Automações
```sql
CREATE TABLE configuracoes_automacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  auto_confirmacao_minutos INTEGER DEFAULT 30,
  tolerancia_atraso_minutos INTEGER DEFAULT 15,
  tempo_minimo_consulta_minutos INTEGER DEFAULT 10,
  horario_inicio TIME DEFAULT '08:00:00',
  horario_fim TIME DEFAULT '18:00:00',
  dias_funcionamento INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 17. **email_lembretes** - Log de emails
```sql
CREATE TABLE email_lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id),
  data_envio TIMESTAMPTZ,
  tentativas INTEGER DEFAULT 0,
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  email_paciente TEXT NOT NULL,
  status_envio TEXT DEFAULT 'pendente',
  erro_envio TEXT
);
```

### 18. **anotacoes_medicas** - Anotações médicas
```sql
CREATE TABLE anotacoes_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  agendamento_id UUID REFERENCES agendamentos(id),
  data_anotacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES usuarios(id),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo_anotacao TEXT NOT NULL DEFAULT 'consulta'
);
```

### 19. **medicos_login** - Login dos médicos
```sql
CREATE TABLE medicos_login (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cpf TEXT NOT NULL,
  senha TEXT NOT NULL
);
```

### 20. **funcionarios_login** - Login dos funcionários
```sql
CREATE TABLE funcionarios_login (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cpf TEXT NOT NULL,
  senha TEXT NOT NULL
);
```

### 21. **medicos_sessoes** - Sessões dos médicos
```sql
CREATE TABLE medicos_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logout_at TIMESTAMPTZ,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duracao_sessao TEXT,
  ip_address TEXT,
  user_agent TEXT
);
```

### 22. **funcionarios_sessoes** - Sessões dos funcionários
```sql
CREATE TABLE funcionarios_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logout_at TIMESTAMPTZ,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  duracao_sessao TEXT
);
```

### 23. **logs_acesso** - Logs de acesso
```sql
CREATE TABLE logs_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  registro_id UUID,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  acao TEXT NOT NULL,
  tabela_afetada TEXT,
  ip_address TEXT,
  user_agent TEXT
);
```

### 24. **medicos_logs** - Logs dos médicos
```sql
CREATE TABLE medicos_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  registro_id UUID,
  detalhes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acao TEXT NOT NULL,
  descricao TEXT,
  tabela_afetada TEXT,
  ip_address TEXT,
  user_agent TEXT
);
```

### 25. **funcionarios_logs** - Logs dos funcionários
```sql
CREATE TABLE funcionarios_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  registro_id UUID,
  detalhes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acao TEXT NOT NULL,
  descricao TEXT,
  ip_address TEXT,
  user_agent TEXT,
  tabela_afetada TEXT
);
```

### 26. **agendamentos_historico** - Histórico de agendamentos
```sql
CREATE TABLE agendamentos_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES agendamentos(id),
  usuario_id UUID REFERENCES usuarios(id),
  automatico BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  detalhes JSONB,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  motivo TEXT
);
```

### 27. **user_preferences** - Preferências do usuário
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_type TEXT NOT NULL DEFAULT 'admin',
  preference_key TEXT NOT NULL
);
```

## Sistema de Pagamentos (Mercado Pago)

### Estrutura de Planos
```
BÁSICO (R$ 250/mês):
- 4 funcionários + 4 médicos
- 1 mês: R$ 250 (0% desconto)
- 3 meses: R$ 712,50 (5% desconto)
- 6 meses: R$ 1.350 (10% desconto)
- 12 meses: R$ 2.550 (15% desconto)

INTERMEDIÁRIO (R$ 450/mês):
- 8 funcionários + 10 médicos
- 1 mês: R$ 450 (0% desconto)
- 3 meses: R$ 1.282,50 (5% desconto)
- 6 meses: R$ 2.430 (10% desconto)
- 12 meses: R$ 4.590 (15% desconto)

PREMIUM (R$ 680/mês):
- 12 funcionários + 15 médicos
- 1 mês: R$ 680 (0% desconto)
- 3 meses: R$ 1.938 (5% desconto)
- 6 meses: R$ 3.672 (10% desconto)
- 12 meses: R$ 6.936 (15% desconto)
```

### Edge Functions de Pagamento

#### 1. **create-mercadopago-preference**
```typescript
// Cria preferência de pagamento no Mercado Pago
// Suporta: Cartão, PIX, Boleto
// Calcula desconto automático por período
// Webhook configurado para ativação automática
```

#### 2. **mercadopago-webhook**
```typescript
// Processa notificações do Mercado Pago
// Ativa assinatura automaticamente
// Atualiza status na tabela 'assinaturas'
// Envia confirmação por email

```

### Horários de Ativação
- **Imediato**: Cartão de crédito aprovado
- **1-3 dias úteis**: PIX e boleto após confirmação
- **Webhook**: Monitora 24/7 status dos pagamentos
- **Auto-renovação**: Notifica 7 dias antes do vencimento

### Fluxo de Pagamento Completo
1. **Seleção do Plano**: Cliente escolhe tipo e período
2. **Criação da Preferência**: Edge function gera ID do Mercado Pago
3. **Redirecionamento**: Cliente vai para checkout do Mercado Pago
4. **Pagamento**: Processamento via gateway
5. **Webhook**: Recebe notificação automática
6. **Ativação**: Sistema ativa assinatura instantaneamente
7. **Confirmação**: Email enviado ao cliente

### Métodos de Pagamento Suportados
- ✅ **Cartão de Crédito**: Ativação imediata
- ✅ **PIX**: Ativação após confirmação (1-5 min)
- ⚠️ **Boleto**: Implementação parcial (1-3 dias úteis)

//butao de cancelar assinatura
  ⚠️
    ⚠️
      ⚠️
<Button 
    onClick={() => setCancelModalOpen(true)}
    variant="outline"
    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
    >
    <X className="h-4 w-4 mr-2" />
    Cancelar Plano
</Button>

### Segurança e Compliance
- **PCI DSS**: Mercado Pago certificado
- **Webhooks**: Assinatura HMAC para validação
- **SSL/TLS**: Toda comunicação criptografada
- **Logs**: Auditoria completa de transações

### Configurações Necessárias
1. **Mercado Pago**:
   - ACCESS_TOKEN configurado em secrets
   - Webhook URL: `/functions/v1/mercadopago-webhook`
   - Eventos: `payment.created`, `payment.updated`

2. **Supabase**:
   - Edge Functions deployadas
   - Secrets configurados corretamente
   - RLS policies para tabela assinaturas

### Monitoramento e Alertas
- **Dashboard Administrativo**: Status em tempo real
- **Email Automático**: Avisos 7 dias antes vencimento
- **Logs Detalhados**: Toda transação registrada
- **Retry Logic**: Tentativas automáticas em falhas

### Troubleshooting Comum
1. **Webhook não recebido**: Verificar URL e conectividade
2. **Pagamento não ativado**: Checar logs do webhook
3. **Desconto incorreto**: Validar cálculo na preferência
4. **Email não enviado**: Verificar configuração SMTP

### Próximas Implementações
- [ ] Boleto bancário completo
- [ ] Parcelamento no cartão
- [ ] Desconto por indicação
- [ ] Dashboard financeiro avançado


2. 📋 Sistema Multi-Clínicas - Explicação Completa
Sim, o sistema É multi-clínicas! Aqui está como funciona:

Como o Sistema Funciona Atualmente:
Isolamento por clinica_id: Cada tabela principal tem uma coluna clinica_id que separa 
  completamente os dados de cada clínica
Dados isolados: Pacientes, médicos, funcionários, agendamentos, exames - tudo fica 
  separado por clínica
Login específico: Cada clínica tem suas próprias credenciais de acesso
Para Implantar uma Nova Clínica - Passo a Passo:
OPÇÃO 1: Sistema Unificado (RECOMENDADO)

Criar nova clínica no banco:

INSERT INTO clinicas (nome, email, telefone, endereco) 
VALUES ('Nome da Nova Clínica', 'contato@novaclinica.com', '(XX) XXXXX-XXXX', 'Endereço completo');
Configurar credenciais de acesso:

INSERT INTO configuracoes_clinica (clinica_id, codigo_acesso_clinica, email_login_clinica, senha_acesso_clinica)
VALUES (
  'id-da-nova-clinica-gerado', 
  'codigo_acesso_personalizado',
  'admin@novaclinica.com',
  'senha_segura_123'
);
Criar assinatura:

INSERT INTO assinaturas (clinica_id, valor, status, tipo_plano, limite_funcionarios, limite_medicos)
VALUES ('id-da-nova-clinica', 280.00, 'ativa', 'basico', 4, 10);
Fornecer credenciais para a nova clínica acessar o sistema
Sobre Domínios e Subdomínios:
Situação Atual:

Você tem UMA instalação do sistema
Todas as clínicas acessam pela mesma URL
O sistema identifica automaticamente qual clínica está logada
Opções de Estrutura:

Modelo Atual (Simples):

Uma URL: seusistema.com
Cada clínica faz login com suas credenciais
✅ Mais fácil de manter
✅ Uma única instalação
Modelo com Subdomínios:

clinica1.seusistema.com
clinica2.seusistema.com
Cada uma direcionando para a mesma aplicação, mas com contexto específico
🔧 Mais complexo de configurar
Modelo Separado Completo:

Cada clínica em seu próprio domínio
Instalações completamente independentes
🔧 Muito mais trabalho de manutenção
Recomendação:
Mantenha o modelo atual (Sistema Unificado) porque:

✅ Vantagens:

Uma única instalação para manter
Atualizações simultâneas para todas as clínicas
Economia de recursos e custos
Dados completamente isolados por clinica_id
Pagamentos centralizados (mais fácil de gerir)
❌ Desvantagens mínimas:

Todas acessam pela mesma URL (não é realmente um problema)
Processo Completo para Nova Clínica:
Definir dados da nova clínica
Executar scripts SQL para criar registros
Configurar assinatura e plano
Testar acesso com as novas credenciais
Entregar credenciais para a nova clínica
Treinamento (se necessário)
O sistema está perfeitamente preparado para múltiplas clínicas! A arquitetura é 
  robusta e suporta centenas de clínicas simultaneamente.