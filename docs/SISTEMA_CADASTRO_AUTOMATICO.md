# Sistema de Cadastro Automático de Clínicas

## 🚀 Visão Geral

O sistema de **cadastro automático** permite que novas clínicas sejam aprovadas e configuradas automaticamente, sem necessidade de intervenção manual do administrador. Este documento detalha como o sistema funciona e como configurá-lo.

## ⚙️ Como Funciona

### Fluxo Tradicional (Manual)
1. Clínica preenche formulário de inscrição
2. Inscrição fica com status **"pendente"**
3. Administrador acessa painel admin
4. Administrador aprova manualmente cada inscrição
5. Sistema cria clínica + configurações + trial

### Fluxo Automático (Novo)
1. Clínica preenche formulário de inscrição
2. Sistema **automaticamente** processa a inscrição
3. Clínica é criada instantaneamente
4. Trial de 30 dias é ativado automaticamente
5. Credenciais são enviadas por email

## 🔧 Configuração do Sistema

### 1. Habilitar Verificação Automática

**Via Painel Administrativo:**
1. Acesse o painel admin
2. Vá para a seção **"Configurações do Sistema"**
3. Ative o toggle **"Verificação Automática"**
4. O sistema está configurado!

**Via SQL (Direto no Banco):**
```sql
-- Habilitar cadastro automático
UPDATE configuracoes_sistema 
SET verificacao_automatica_ativa = true,
    tempo_verificacao_minutos = 5,
    updated_at = now();

-- Se não existir configuração, criar uma
INSERT INTO configuracoes_sistema (verificacao_automatica_ativa, tempo_verificacao_minutos)
SELECT true, 5
WHERE NOT EXISTS (SELECT 1 FROM configuracoes_sistema);
```

### 2. Verificar Status Atual
```sql
-- Ver configuração atual
SELECT 
    verificacao_automatica_ativa as automatico_ativo,
    tempo_verificacao_minutos as intervalo_minutos,
    updated_at as ultima_atualizacao
FROM configuracoes_sistema
LIMIT 1;
```

## 🏭 Processamento Automático

### Edge Function: `processar-verificacao-automatica`

A função executa automaticamente a cada 5 minutos e:

1. **Busca inscrições pendentes**
2. **Valida dados básicos**
3. **Verifica duplicatas** (mesmo email)
4. **Cria clínica automaticamente**
5. **Configura trial de 30 dias**
6. **Envia credenciais** (se configurado)

### Código da Função

```typescript
// supabase/functions/processar-verificacao-automatica/index.ts
export const handler = async () => {
  // Verificar se está ativo
  const { data: config } = await supabase
    .from('configuracoes_sistema')
    .select('verificacao_automatica_ativa')
    .single();

  if (!config?.verificacao_automatica_ativa) {
    return { success: false, message: 'Verificação automática desativada' };
  }

  // Buscar inscrições pendentes
  const { data: inscricoes } = await supabase
    .from('inscricoes_pendentes')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: true });

  let processadas = 0;
  let rejeitadas = 0;

  for (const inscricao of inscricoes || []) {
    try {
      // Verificar se email já existe
      const { data: clinicaExistente } = await supabase
        .from('clinicas')
        .select('id')
        .eq('email', inscricao.email_responsavel)
        .single();

      if (clinicaExistente) {
        // Rejeitar por email duplicado
        await supabase
          .from('inscricoes_pendentes')
          .update({
            status: 'rejeitada',
            processada_em: new Date().toISOString(),
            dados_completos: { erro: 'Email já cadastrado no sistema' }
          })
          .eq('id', inscricao.id);
        
        rejeitadas++;
        continue;
      }

      // Processar automaticamente
      const resultado = await supabase.rpc('processar_inscricao_clinica', {
        inscricao_id: inscricao.id,
        aprovada: true
      });

      if (resultado.data?.success) {
        processadas++;
      } else {
        rejeitadas++;
      }

    } catch (error) {
      console.error('Erro ao processar:', error);
      rejeitadas++;
    }
  }

  return {
    success: true,
    processadas,
    rejeitadas,
    message: `Processamento concluído: ${processadas} aprovadas, ${rejeitadas} rejeitadas`
  };
};
```

## 📋 Validações Automáticas

### ✅ Validações que APROVAM automaticamente
- Email válido e não duplicado
- Nome da clínica preenchido
- CPF do responsável válido
- Telefone informado
- Subdomínio único

### ❌ Validações que REJEITAM automaticamente
- Email já cadastrado no sistema
- Email inválido (@teste, @example, etc.)
- Dados incompletos obrigatórios
- Subdomínio já em uso
- CPF inválido

### 🔄 Casos que ficam PENDENTES
- Problemas técnicos durante processamento
- Validações especiais (se implementadas)
- Quando a verificação automática está desativada

## 🏗️ Estrutura da Inscrição Automática

### Tabela: `inscricoes_pendentes`
```sql
CREATE TABLE public.inscricoes_pendentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_clinica TEXT NOT NULL,
    subdominio_solicitado TEXT NOT NULL,
    email_responsavel TEXT NOT NULL,
    telefone TEXT,
    nome_responsavel TEXT NOT NULL,
    cpf_responsavel TEXT NOT NULL,
    senha_escolhida TEXT, -- Senha personalizada (opcional)
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
    processada_em TIMESTAMP WITH TIME ZONE,
    processada_por UUID,
    dados_completos JSONB, -- Dados extras ou erros
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### O que é Criado Automaticamente

**1. Registro da Clínica (`clinicas`)**
```sql
INSERT INTO clinicas (nome, email, telefone, subdominio)
VALUES (inscricao.nome_clinica, inscricao.email_responsavel, inscricao.telefone, inscricao.subdominio_solicitado);
```

**2. Configurações da Clínica (`configuracoes_clinica`)**
```sql
INSERT INTO configuracoes_clinica (
    clinica_id, 
    email_login_clinica, 
    senha_acesso_clinica,
    codigo_acesso_clinica,
    codigo_acesso_funcionario
) VALUES (
    nova_clinica_id,
    inscricao.email_responsavel,
    senha_escolhida_ou_gerada,
    'clinica_' + random_string,
    'func_' + random_string
);
```

**3. Assinatura Trial (`assinaturas`)**
```sql
INSERT INTO assinaturas (
    clinica_id,
    status,
    tipo_plano,
    valor,
    data_inicio,
    proximo_pagamento,
    limite_funcionarios,
    limite_medicos
) VALUES (
    nova_clinica_id,
    'trial',
    'trial',
    0.00,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    4,
    5
);
```

## 📈 Monitoramento e Métricas

### Dashboard do Admin
No painel administrativo você pode ver:

- **Total de inscrições pendentes**
- **Processadas automaticamente hoje**
- **Taxa de aprovação automática**
- **Últimas inscrições processadas**

### Consultas SQL para Acompanhamento

```sql
-- Estatísticas do dia
SELECT 
    COUNT(*) FILTER (WHERE status = 'aprovada' AND processada_em::date = CURRENT_DATE) as aprovadas_hoje,
    COUNT(*) FILTER (WHERE status = 'rejeitada' AND processada_em::date = CURRENT_DATE) as rejeitadas_hoje,
    COUNT(*) FILTER (WHERE status = 'pendente') as ainda_pendentes
FROM inscricoes_pendentes;

-- Histórico mensal
SELECT 
    DATE_TRUNC('month', processada_em) as mes,
    COUNT(*) FILTER (WHERE status = 'aprovada') as aprovadas,
    COUNT(*) FILTER (WHERE status = 'rejeitada') as rejeitadas,
    ROUND(COUNT(*) FILTER (WHERE status = 'aprovada') * 100.0 / COUNT(*), 2) as taxa_aprovacao
FROM inscricoes_pendentes
WHERE processada_em IS NOT NULL
GROUP BY DATE_TRUNC('month', processada_em)
ORDER BY mes DESC;

-- Motivos de rejeição mais comuns
SELECT 
    dados_completos->>'erro' as motivo_rejeicao,
    COUNT(*) as quantidade
FROM inscricoes_pendentes
WHERE status = 'rejeitada'
AND dados_completos->>'erro' IS NOT NULL
GROUP BY dados_completos->>'erro'
ORDER BY quantidade DESC;
```

## 🔧 Configurações Avançadas

### Personalizar Tempo de Verificação
```sql
-- Verificar a cada 1 minuto (desenvolvimento)
UPDATE configuracoes_sistema 
SET tempo_verificacao_minutos = 1;

-- Verificar a cada 15 minutos (produção)
UPDATE configuracoes_sistema 
SET tempo_verificacao_minutos = 15;
```

### Desabilitar Temporariamente
```sql
-- Desabilitar processamento automático
UPDATE configuracoes_sistema 
SET verificacao_automatica_ativa = false;

-- Reabilitar
UPDATE configuracoes_sistema 
SET verificacao_automatica_ativa = true;
```

## 📧 Integração com Email (Opcional)

### Envio Automático de Credenciais
Quando configurado, o sistema pode enviar automaticamente:

1. **Email de boas-vindas**
2. **Credenciais de acesso**
3. **Links dos portais**
4. **Guia de primeiros passos**

### Template de Email
```html
Olá {{nome_clinica}},

Bem-vindo ao Unovai Exame Cloud!

Sua clínica foi aprovada e já está pronta para uso.

DADOS DE ACESSO:
- Email: {{email_login}}
- Senha: {{senha_gerada}}
- Link: https://sistema.com/clinica-login

TRIAL GRATUITO:
✅ 30 dias grátis
✅ Todos os recursos liberados
✅ Até 4 funcionários
✅ Até 5 médicos

PRÓXIMOS PASSOS:
1. Faça login no sistema
2. Configure sua clínica
3. Cadastre seus primeiros pacientes
4. Explore todas as funcionalidades

Dúvidas? Entre em contato: suporte@sistema.com

Bem-vindo à revolução digital da sua clínica!
```

## 🚨 Segurança e Auditoria

### Logs de Processamento
```sql
-- Ver logs de processamento automático
SELECT 
    al.detalhes->>'processadas' as aprovadas,
    al.detalhes->>'rejeitadas_por_erro' as rejeitadas,
    al.detalhes->>'timestamp' as executado_em,
    al.created_at
FROM admin_logs al
WHERE al.acao = 'PROCESSAMENTO_AUTOMATICO'
ORDER BY al.created_at DESC
LIMIT 10;
```

### Auditoria de Aprovações
```sql
-- Clínicas criadas automaticamente hoje
SELECT 
    c.nome,
    c.email,
    c.created_at,
    'automatico' as tipo_aprovacao
FROM clinicas c
WHERE c.created_at::date = CURRENT_DATE
ORDER BY c.created_at DESC;
```

## ⚠️ Considerações Importantes

### ✅ Vantagens do Sistema Automático
- **Experiência instantânea** para novos usuários
- **Redução de trabalho manual** para administradores
- **Disponibilidade 24/7** para novos cadastros
- **Padronização** do processo de aprovação
- **Métricas automáticas** de conversão

### ⚠️ Cuidados Necessários
- **Monitorar regularmente** aprovações automáticas
- **Validar logs** de processamento
- **Ter plano de rollback** se necessário
- **Configurar alertas** para volumes altos
- **Revisar ocasionalmente** critérios de validação

### 🔄 Rollback (Se Necessário)
```sql
-- Desabilitar sistema automático
UPDATE configuracoes_sistema 
SET verificacao_automatica_ativa = false;

-- Reverter clínicas criadas hoje (CUIDADO!)
-- APENAS EM CASO DE EMERGÊNCIA
-- UPDATE inscricoes_pendentes 
-- SET status = 'pendente', processada_em = NULL
-- WHERE processada_em::date = CURRENT_DATE 
-- AND status = 'aprovada';
```

## 📊 KPIs de Sucesso

### Métricas a Acompanhar
1. **Taxa de aprovação automática**: % de inscrições aprovadas vs rejeitadas
2. **Tempo médio de processamento**: Da inscrição ao login da clínica
3. **Taxa de ativação**: % de clínicas que fazem login após aprovação
4. **Qualidade das aprovações**: % de clínicas que continuam usando após trial
5. **Redução de trabalho manual**: Horas economizadas da equipe admin

### Dashboard Sugerido
```sql
-- Métricas dos últimos 30 dias
WITH metricas AS (
  SELECT 
    COUNT(*) as total_inscricoes,
    COUNT(*) FILTER (WHERE status = 'aprovada') as aprovadas,
    COUNT(*) FILTER (WHERE status = 'rejeitada') as rejeitadas,
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes
  FROM inscricoes_pendentes 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  total_inscricoes,
  aprovadas,
  rejeitadas,
  pendentes,
  ROUND(aprovadas * 100.0 / total_inscricoes, 2) as taxa_aprovacao,
  ROUND(rejeitadas * 100.0 / total_inscricoes, 2) as taxa_rejeicao
FROM metricas;
```

Com o sistema automático ativo, novas clínicas podem começar a usar o sistema **imediatamente** após o cadastro, melhorando significativamente a experiência do usuário e reduzindo a carga administrativa.