# Sistema de Bloqueios por Planos - Documentação Técnica Completa

## 🎯 VISÃO GERAL

O Sistema de Bloqueios por Planos controla quais funcionalidades cada clínica pode acessar baseado no seu plano de assinatura. É a base do modelo de negócio SaaS, garantindo que clientes paguem pelo que usam.

## 🏗️ ARQUITETURA DO SISTEMA

### FLUXO PRINCIPAL:
```
Usuário tenta acessar funcionalidade
    ↓
Sistema verifica plano atual da clínica
    ↓
Consulta funcionalidades bloqueadas do plano
    ↓
Se bloqueada: Mostra modal de upgrade
Se liberada: Permite acesso normal
```

## 📊 TIPOS DE PLANOS E BLOQUEIOS

### 🔴 PLANO BÁSICO (`basico_medico`)
**Valor:** R$ 125/mês + R$ 175/médico adicional

**Funcionalidades BLOQUEADAS:**
- ❌ `emails` - Sistema de emails automáticos
- ❌ `relatorios` - Relatórios avançados  
- ❌ `monitoramento` - Monitoramento de funcionários
- ❌ `telemedicina` - Consultas por vídeo
- ❌ `usuarios_multiplos` - Múltiplos usuários administrativos
- ❌ `convenios` - Sistema de convênios médicos

**Funcionalidades LIBERADAS:**
- ✅ Agenda e agendamentos
- ✅ Cadastro de pacientes
- ✅ Prontuários eletrônicos
- ✅ Portal do paciente
- ✅ Controle financeiro básico

### 🟡 PLANO INTERMEDIÁRIO (`intermediario_medico`)
**Valor:** R$ 190/mês + R$ 175/médico adicional

**Funcionalidades BLOQUEADAS:**
- ❌ `monitoramento` - Monitoramento de funcionários
- ❌ `telemedicina` - Consultas por vídeo
- ❌ `usuarios_multiplos` - Múltiplos usuários administrativos

**Funcionalidades LIBERADAS:**
- ✅ Todas do Plano Básico
- ✅ Sistema de emails automáticos
- ✅ Relatórios financeiros
- ✅ Sistema de convênios

### 🟢 PLANO AVANÇADO (`avancado_medico`)
**Valor:** R$ 299/mês + R$ 175/médico adicional

**Funcionalidades BLOQUEADAS:**
- ✅ Nenhuma! Acesso total ao sistema

**Funcionalidades LIBERADAS:**
- ✅ TODAS as funcionalidades disponíveis

### 🔵 PLANO TRIAL (`trial`)
**Valor:** Gratuito por 30 dias

**Funcionalidades BLOQUEADAS:**
- ❌ `emails` - Sistema de emails automáticos
- ❌ `relatorios` - Relatórios avançados
- ❌ `monitoramento` - Monitoramento de funcionários  
- ❌ `telemedicina` - Consultas por vídeo
- ❌ `usuarios_multiplos` - Múltiplos usuários administrativos
- ❌ `convenios` - Sistema de convênios médicos

## 💻 IMPLEMENTAÇÃO TÉCNICA

### 1. HOOK PRINCIPAL: `useFeatureControl.tsx`

**Localização:** `src/hooks/useFeatureControl.tsx`

```typescript
// Função principal de verificação
const isFeatureBlocked = useCallback((feature: string): boolean => {
  if (!assinatura) {
    return true; // Sem assinatura = tudo bloqueado
  }

  if (assinatura.status === 'vencida' || assinatura.status === 'cancelada') {
    return true; // Assinatura vencida = tudo bloqueado
  }

  // Verifica se funcionalidade está na lista de bloqueadas
  const isBlocked = planoFeatures.includes(feature);
  return isBlocked;
}, [assinatura, planoFeatures]);
```

### 2. COMPONENTE DE BLOQUEIO: `FeaturePageGate.tsx`

**Localização:** `src/components/FeaturePageGate.tsx`

```typescript
// Bloqueia páginas inteiras baseado no plano
export const FeaturePageGate = ({ feature, children }) => {
  const { isFeatureBlocked } = useFeatureControl();
  
  if (isFeatureBlocked(feature)) {
    return <UpgradePrompt feature={feature} />;
  }
  
  return children;
};
```

### 3. COMPONENTE DE FUNCIONALIDADE: `FeatureGate.tsx`

**Localização:** `src/components/FeatureGate.tsx`

```typescript
// Bloqueia componentes específicos
export const FeatureGate = ({ feature, children, fallback }) => {
  const { isFeatureBlocked } = useFeatureControl();
  
  if (isFeatureBlocked(feature)) {
    return fallback || <UpgradeButton feature={feature} />;
  }
  
  return children;
};
```

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `planos_assinatura`
```sql
CREATE TABLE planos_assinatura (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_plano text NOT NULL, -- 'basico_medico', 'intermediario_medico', etc.
  periodo_meses integer NOT NULL, -- 1, 6, 12
  valor_base numeric NOT NULL,
  percentual_desconto numeric DEFAULT 0,
  funcionalidades_bloqueadas text[] DEFAULT '{}',
  limite_medicos integer,
  limite_funcionarios integer,
  created_at timestamp DEFAULT now()
);
```

### Dados de Exemplo:
```sql
-- Plano Básico Mensal
INSERT INTO planos_assinatura VALUES (
  gen_random_uuid(),
  'basico_medico',
  1,
  125.00,
  0,
  '{"emails", "relatorios", "monitoramento", "telemedicina", "usuarios_multiplos", "convenios"}',
  null,
  null
);

-- Plano Intermediário Mensal  
INSERT INTO planos_assinatura VALUES (
  gen_random_uuid(),
  'intermediario_medico',
  1,
  190.00,
  0,
  '{"monitoramento", "telemedicina", "usuarios_multiplos"}',
  null,
  null
);
```

### Tabela: `assinaturas`
```sql
CREATE TABLE assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL,
  tipo_plano text NOT NULL,
  status text NOT NULL, -- 'ativa', 'vencida', 'cancelada', 'trial'
  valor numeric NOT NULL,
  periodo_meses integer NOT NULL,
  data_inicio date NOT NULL,
  proximo_pagamento date NOT NULL,
  created_at timestamp DEFAULT now()
);
```

## 🎮 COMO O SISTEMA FUNCIONA NA PRÁTICA

### EXEMPLO 1: Usuário do Plano Básico tenta acessar Emails

```typescript
// Em qualquer componente relacionado a emails
const { isFeatureBlocked } = useFeatureControl();

if (isFeatureBlocked('emails')) {
  // Mostra modal de upgrade
  return <UpgradeModal currentFeature="emails" />;
}

// Continua normalmente se não bloqueado
return <EmailConfiguration />;
```

### EXEMPLO 2: Página inteira bloqueada

```typescript
// src/pages/Telemedicina.tsx
return (
  <FeaturePageGate
    feature="telemedicina"
    featureName="Telemedicina"
    description="Sistema completo de consultas por vídeo"
    requiredPlan="avancado_medico"
  >
    {/* Conteúdo da página só aparece se desbloqueado */}
    <TelemedicinaDashboard />
  </FeaturePageGate>
);
```

### EXEMPLO 3: Botão específico bloqueado

```typescript
// Dentro de qualquer componente
<FeatureGate
  feature="convenios"
  fallback={
    <Button disabled>
      Convênios (Plano Intermediário)
    </Button>
  }
>
  <Button onClick={handleConvenios}>
    Gerenciar Convênios
  </Button>
</FeatureGate>
```

## 🔧 CONFIGURAÇÃO E MANUTENÇÃO

### 1. Adicionar Nova Funcionalidade Bloqueável

**Passo 1:** Definir identificador único
```typescript
// Exemplo: nova funcionalidade "integracao_laboratorio"
const NOVA_FEATURE = 'integracao_laboratorio';
```

**Passo 2:** Atualizar configuração dos planos
```sql
-- Bloquear nos planos básico e intermediário
UPDATE planos_assinatura 
SET funcionalidades_bloqueadas = array_append(funcionalidades_bloqueadas, 'integracao_laboratorio')
WHERE tipo_plano IN ('basico_medico', 'intermediario_medico');
```

**Passo 3:** Implementar verificação no código
```typescript
// No componente da nova funcionalidade
const { isFeatureBlocked } = useFeatureControl();

if (isFeatureBlocked('integracao_laboratorio')) {
  return <UpgradePrompt />;
}
```

### 2. Modificar Plano Existente

```sql
-- Exemplo: liberar emails no plano básico
UPDATE planos_assinatura 
SET funcionalidades_bloqueadas = array_remove(funcionalidades_bloqueadas, 'emails')
WHERE tipo_plano = 'basico_medico';
```

### 3. Criar Novo Plano

```sql
-- Exemplo: Plano Enterprise
INSERT INTO planos_assinatura (
  tipo_plano,
  periodo_meses,
  valor_base,
  percentual_desconto,
  funcionalidades_bloqueadas
) VALUES (
  'enterprise_medico',
  1,
  499.00,
  0,
  '{}' -- Nenhuma funcionalidade bloqueada
);
```

## 📍 LOCALIZAÇÕES NO CÓDIGO

### Hooks (Lógica Principal)
```
src/hooks/
├── useFeatureControl.tsx      # Hook principal de controle
├── useLimitesPlano.tsx       # Controle de limites numéricos
└── useClinica.tsx            # Dados da clínica atual
```

### Componentes de Bloqueio
```
src/components/
├── FeatureGate.tsx           # Bloqueio de componentes
├── FeaturePageGate.tsx       # Bloqueio de páginas inteiras
├── UpgradeModal.tsx          # Modal de upgrade
└── PlanSelector.tsx          # Seleção de planos
```

### Páginas com Bloqueios
```
src/pages/
├── Telemedicina.tsx         # Bloqueada no básico/intermediário
├── MonitoramentoFuncionarios.tsx # Bloqueada no básico/intermediário
├── ConfiguracaoEmails.tsx   # Bloqueada no básico
└── Convenios.tsx            # Bloqueada no básico
```

## 🧪 TESTES E VALIDAÇÕES

### Teste Manual Completo

**1. Teste Plano Básico:**
```
✅ Deve bloquear: emails, relatórios, telemedicina, convênios
✅ Deve liberar: agenda, pacientes, prontuários, financeiro básico
```

**2. Teste Plano Intermediário:**
```
✅ Deve bloquear: telemedicina, monitoramento
✅ Deve liberar: emails, relatórios, convênios + todas do básico
```

**3. Teste Plano Avançado:**
```
✅ Deve liberar: TODAS as funcionalidades
```

**4. Teste Estados de Assinatura:**
```
✅ Vencida: Deve bloquear tudo
✅ Cancelada: Deve bloquear tudo  
✅ Trial: Deve aplicar bloqueios do trial
```

### Verificação Automática

```typescript
// Função para testar bloqueios
export const testPlanBlocking = async (tipoPlano: string) => {
  const expectedBlocks = getFeaturesBlockedByPlan(tipoPlano);
  
  for (const feature of ALL_FEATURES) {
    const isBlocked = isFeatureBlocked(feature);
    const shouldBeBlocked = expectedBlocks.includes(feature);
    
    if (isBlocked !== shouldBeBlocked) {
      console.error(`Erro: ${feature} deveria ser ${shouldBeBlocked ? 'bloqueada' : 'liberada'} no plano ${tipoPlano}`);
    }
  }
};
```

## 🚨 TROUBLESHOOTING

### Problema 1: Funcionalidade não bloqueia
**Possíveis causas:**
- Hook não implementado no componente
- Identificador de funcionalidade incorreto
- Dados de plano desatualizados

**Solução:**
```typescript
// Verificar se hook está sendo usado
const { isFeatureBlocked } = useFeatureControl();

// Verificar identificador
console.log('Feature checked:', 'nome_da_funcionalidade');

// Verificar dados do plano
console.log('Plan data:', assinatura);
```

### Problema 2: Sempre bloqueado
**Possíveis causas:**
- Assinatura não encontrada
- Status de assinatura incorreto
- Cache desatualizado

**Solução:**
```typescript
// Forçar atualização dos dados
const { refetch } = useFeatureControl();
await refetch();
```

### Problema 3: Modal de upgrade não aparece
**Possíveis causas:**
- Componente `FeatureGate` não implementado
- Modal não configurado
- Estado do componente incorreto

**Solução:**
```typescript
// Verificar se FeatureGate está envolvendo o componente
<FeatureGate feature="nome_funcionalidade">
  <ComponenteBloqueavel />
</FeatureGate>
```

## 📊 MÉTRICAS E ANALYTICS

### Dados Importantes para Acompanhar

```sql
-- Funcionalidades mais bloqueadas
SELECT 
  unnest(funcionalidades_bloqueadas) as funcionalidade,
  COUNT(*) as clinicas_bloqueadas
FROM planos_assinatura p
JOIN assinaturas a ON a.tipo_plano = p.tipo_plano
WHERE a.status = 'ativa'
GROUP BY funcionalidade
ORDER BY clinicas_bloqueadas DESC;

-- Planos mais utilizados
SELECT 
  tipo_plano,
  COUNT(*) as total_clinicas,
  AVG(valor) as valor_medio
FROM assinaturas 
WHERE status = 'ativa'
GROUP BY tipo_plano
ORDER BY total_clinicas DESC;

-- Taxa de conversão trial → pago
SELECT 
  COUNT(CASE WHEN tipo_plano = 'trial' THEN 1 END) as total_trial,
  COUNT(CASE WHEN tipo_plano != 'trial' THEN 1 END) as total_pagos,
  ROUND(
    COUNT(CASE WHEN tipo_plano != 'trial' THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 2
  ) as taxa_conversao_percent
FROM assinaturas;
```

## 🔮 FUTURAS MELHORIAS

### 1. Bloqueios Mais Granulares
- Limitar número de pacientes por plano
- Limitar espaço de armazenamento
- Limitar número de emails por mês

### 2. Bloqueios Dinâmicos
- Funcionalidades que se bloqueiam após uso excessivo
- Degradação progressiva de performance
- Bloqueios temporários por inadimplência

### 3. A/B Testing de Planos
- Testar diferentes combinações de funcionalidades
- Otimizar conversão entre planos
- Análise de abandono por funcionalidade

### 4. Sistema de Quotas
```sql
-- Exemplo de tabela de quotas
CREATE TABLE quotas_plano (
  plano_id uuid,
  recurso text, -- 'emails_mes', 'storage_gb', 'pacientes_max'
  limite integer,
  usado_atual integer DEFAULT 0
);
```

---

## ✅ RESUMO EXECUTIVO

O Sistema de Bloqueios por Planos é o **coração do modelo de negócio** SaaS. Ele:

### 🎯 Funciona através de:
1. **Hook centralizado** (`useFeatureControl`) que verifica permissões
2. **Componentes de bloqueio** que impedem acesso não autorizado  
3. **Base de dados** que define o que cada plano pode acessar
4. **Interface de upgrade** que converte usuários

### 🔧 É mantido via:
1. **Configuração de banco** - Fácil de ajustar planos
2. **Componentes modulares** - Reutilizáveis em qualquer lugar
3. **Logs e métricas** - Para otimização contínua

### 💰 Gera resultado através de:
1. **Conversão de trials** para planos pagos
2. **Upgrade de planos** básicos para avançados  
3. **Retenção de clientes** com funcionalidades certas
4. **Previsibilidade de receita** baseada em uso

**Status**: ✅ SISTEMA TOTALMENTE FUNCIONAL E DOCUMENTADO  
**Complexidade**: ⭐⭐⭐ (Média-Alta)  
**Manutenibilidade**: ⭐⭐⭐⭐⭐ (Muito Alta)  
**Importância**: 🔥🔥🔥🔥🔥 (Crítica para o negócio)