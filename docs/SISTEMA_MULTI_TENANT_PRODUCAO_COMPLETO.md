# SISTEMA MULTI-TENANT - DOCUMENTAÇÃO COMPLETA DE PRODUÇÃO

## 📋 VISÃO GERAL DO SISTEMA

O sistema Somos Inovai utiliza uma arquitetura **Database-per-Tenant** onde cada clínica possui seu próprio banco de dados isolado, garantindo máxima segurança e isolamento dos dados.

### **Domínio Base**: somosinovai.com

Todas as clínicas acessam o sistema através de subdomínios:
- **Formato**: `nome-clinica.somosinovai.com`
- **Exemplo**: `bancomodelo.somosinovai.com`

---

## 🏗️ ARQUITETURA DO SISTEMA

### 1. **Banco Central Administrativo**
- **Função**: Gerencia informações de todas as clínicas
- **Tabela Principal**: `clinicas_central`
- **Responsabilidade**: Roteamento de subdomínios para bancos específicos

### 2. **Bancos Específicos por Clínica**
- **Padrão**: Cada clínica = 1 banco isolado
- **Banco Modelo**: `banco_modelo` (base para clonagem)
- **Dados Operacionais**: pacientes, agendamentos, médicos, etc.

---

## 🔄 FLUXO DE ACESSO DO SISTEMA

### **Passo 1: Detecção do Subdomínio**
```typescript
// Arquivo: src/hooks/useSubdomainRouting.tsx
const hostname = window.location.hostname; // Ex: bancomodelo.somosinovai.com
const subdominio = hostname.split('.')[0]; // Extrai "bancomodelo"
```

### **Passo 2: Consulta no Banco Central**
```sql
-- Busca informações da clínica no banco central
SELECT * FROM clinicas_central 
WHERE subdominio = 'bancomodelo' AND status = 'ativa'
```

### **Passo 3: Configuração do Contexto**
```typescript
// Configura variáveis para o sistema
localStorage.setItem('tenant_id', clinica.id);
localStorage.setItem('clinica_id', clinica.id);
localStorage.setItem('database_name', clinica.database_name);
```

### **Passo 4: Conexão com Banco Específico**
```typescript
// Arquivo: src/integrations/supabase/adminClient.ts
const config = CLINIC_DATABASES[subdominio];
const clinicClient = createClient(config.url, config.key);
```

---

## 🗂️ ARQUIVOS RESPONSÁVEIS PELO ROTEAMENTO

### **1. useSubdomainRouting.tsx**
```typescript
// src/hooks/useSubdomainRouting.tsx
// FUNÇÃO: Detecta subdomínio e carrega dados da clínica
```
**Responsabilidades:**
- ✅ Extrair subdomínio da URL
- ✅ Consultar banco central
- ✅ Configurar contexto da sessão
- ✅ Validar status da clínica

### **2. adminClient.ts**
```typescript
// src/integrations/supabase/adminClient.ts  
// FUNÇÃO: Gerencia conexões com bancos específicos
```
**Responsabilidades:**
- ✅ Conexão com banco central
- ✅ Configurações de bancos por clínica
- ✅ Factory de conexões dinâmicas

### **3. SubdomainGuard.tsx**
```typescript
// src/components/SubdomainGuard.tsx
// FUNÇÃO: Protege rotas e força acesso via subdomínio
```
**Responsabilidades:**
- ✅ Bloquear acesso direto sem subdomínio
- ✅ Mostrar mensagens de orientação
- ✅ Redirecionar para subdomínio correto

### **4. databaseConnectionFactory.ts**
```typescript
// src/services/databaseConnectionFactory.ts
// FUNÇÃO: Factory para conexões de banco
```
**Responsabilidades:**
- ✅ Cachear conexões ativas
- ✅ Gerenciar pool de conexões
- ✅ Fallback para banco central

---

## 🆕 PROCESSO DE CRIAÇÃO DE NOVA CLÍNICA

### **Passo 1: Cadastro via Sistema**
- **Arquivo**: `src/pages/NovaClinica.tsx`
- **Ação**: Preencher formulário completo com senha personalizada

### **Passo 2: Salvamento no Banco Central**
```sql
INSERT INTO clinicas_central (
  nome, email, subdominio, status, database_name,
  configuracoes, limites
) VALUES (
  'Nova Clínica', 'email@clinica.com', 'nova-clinica', 
  'ativa', 'clinica_nova_clinica', 
  '{"senha_hash": "...", "responsavel": "..."}',
  '{"max_medicos": 10, "max_pacientes": 1000}'
);
```

### **Passo 3: Clonagem do Banco Modelo**
**MANUAL** (Por enquanto):
1. Clonar estrutura do `banco_modelo`
2. Criar novo projeto Supabase
3. Importar schema e dados básicos
4. Configurar RLS policies

### **Passo 4: Configuração DNS na Hostinger**
**MANUAL**:
1. Acessar painel da Hostinger
2. Ir em **DNS Zone Editor**
3. Adicionar registro **CNAME**:
   ```
   Nome: nova-clinica
   Valor: somosinovai.com
   TTL: 300
   ```

### **Passo 5: Atualização do Código**
```typescript
// Adicionar em src/integrations/supabase/adminClient.ts
'nova-clinica': {
  url: "https://[novo-projeto].supabase.co",
  key: "[nova-anon-key]"
}
```

---

## 🔧 CONFIGURAÇÃO DE PRODUÇÃO

### **Variáveis Importantes**
```typescript
// Base domain
const BASE_DOMAIN = 'somosinovai.com';

// Banco central
const ADMIN_SUPABASE_URL = "https://biihsfrunulliloaaxju.supabase.co";

// Banco modelo (para clonagem)
const MODELO_BANCO = 'banco_modelo';
```

### **Checklist Pré-Produção**
- ✅ Remover `refetchInterval` excessivos
- ✅ Configurar domínio base correto
- ✅ Limpar dados de teste/mock
- ✅ Validar RLS policies
- ✅ Testar fluxo completo de subdomínio
- ✅ Configurar backups automáticos

---

## 🚀 COMO ADICIONAR NOVA CLÍNICA (MANUAL)

### **1. Preparar Banco da Clínica**
```bash
# 1. Criar novo projeto no Supabase
# 2. Copiar URL e chave anon
# 3. Importar schema do banco_modelo
# 4. Configurar RLS policies
```

### **2. Configurar DNS (Hostinger)**
```
Tipo: CNAME
Nome: nome-clinica  
Valor: somosinovai.com
TTL: 300
```

### **3. Atualizar Código**
```typescript
// Adicionar em adminClient.ts
'nome-clinica': {
  url: "https://[project-ref].supabase.co",
  key: "[anon-key]"
}
```

### **4. Registrar no Banco Central**
```sql
INSERT INTO clinicas_central (
  nome, email, subdominio, status, 
  database_name, database_url
) VALUES (
  'Nome da Clínica', 'email@clinica.com',
  'nome-clinica', 'ativa',
  'banco_nome_clinica', 'https://[project-ref].supabase.co'
);
```

### **5. Testar Acesso**
```
URL: https://nome-clinica.somosinovai.com
Verificar: Login, dados, isolamento
```

---

## 🔍 TROUBLESHOOTING

### **Problema: Subdomínio não funciona**
1. ✅ Verificar DNS na Hostinger
2. ✅ Aguardar propagação (até 24h)
3. ✅ Testar com `nslookup nome-clinica.somosinovai.com`

### **Problema: Erro de conexão com banco**
1. ✅ Verificar configuração em `adminClient.ts`
2. ✅ Validar URL e chave do Supabase
3. ✅ Verificar status da clínica no banco central

### **Problema: Dados não aparecem**
1. ✅ Verificar RLS policies no banco da clínica
2. ✅ Validar contexto do tenant no localStorage
3. ✅ Verificar logs do console

---

## 📊 STATUS ATUAL DO SISTEMA

### **✅ IMPLEMENTADO**
- Sistema de detecção de subdomínio
- Banco central com informações das clínicas
- Roteamento para bancos específicos
- Proteção de rotas via subdomínio
- Cadastro de novas clínicas com senha
- Clínica modelo (bancomodelo) configurada

### **⏳ PENDENTE (MANUAL)**
- Automação da clonagem de banco
- Script de criação de DNS automático
- Dashboard de monitoramento de clínicas
- Sistema de backup automatizado

### **🎯 PRÓXIMOS PASSOS**
1. Testar fluxo completo com clínica real
2. Implementar monitoramento de performance
3. Criar sistema de backup/restore
4. Desenvolver dashboard admin avançado

---

## 📞 CONTATO E SUPORTE

Para dúvidas sobre implementação:
- **Sistema**: Já configurado e funcional
- **DNS**: Configurar manualmente na Hostinger
- **Novos Bancos**: Clonar do banco_modelo
- **Problemas**: Verificar logs do console

**Este sistema está PRONTO para produção com o processo manual de adição de clínicas.**