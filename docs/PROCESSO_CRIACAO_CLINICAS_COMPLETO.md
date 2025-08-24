# Processo Completo de Criação de Clínicas

## 📋 Visão Geral do Sistema

O sistema Inovai utiliza arquitetura **Database-per-Tenant** com roteamento por subdomínio.

### Fluxo de Criação
1. **Solicitação** → `/nova-clinica`
2. **Validação** → Dados + Subdomínio único
3. **Registro** → Banco central `clinicas_central`
4. **Clonagem** → Banco modelo → Banco específico
5. **DNS** → Configuração automática de roteamento
6. **Ativação** → Sistema operacional

## 🏥 Processo Atual (Manual)

### 1. Registro Inicial
```typescript
// src/pages/NovaClinica.tsx
const handleSubmit = async (e) => {
  // 1. Validar subdomínio único
  const { data: existingClinica } = await supabase
    .from('clinicas_central')
    .select('id')
    .eq('subdominio', formData.subdominioSolicitado)
    .single();

  // 2. Inserir no banco central
  const { data: novaClinica } = await supabase
    .from('clinicas_central')
    .insert({
      nome: formData.nomeClinica,
      email: formData.emailResponsavel,
      subdominio: formData.subdominioSolicitado,
      status: 'ativa',
      database_name: `clinica_${subdominio}`,
      configuracoes: {
        senha_hash: hashedPassword,
        responsavel: formData.nomeResponsavel
      },
      limites: {
        max_medicos: 10,
        max_funcionarios: 20,
        max_pacientes: 1000
      }
    });
};
```

### 2. Configuração DNS (Manual)
**Hostinger → DNS Zone → somosinovai.com**
```dns
Tipo: CNAME
Nome: nova-clinica
Valor: sxtqlnayloetwlcjtkbj.supabase.co
```

### 3. Clonagem de Banco (CRÍTICO - Manual)
**ATUALMENTE:** Todas as clínicas usam o mesmo banco físico com RLS

**FUTURO:** Cada clínica terá banco físico próprio

```sql
-- Processo de clonagem (futuro)
-- 1. Criar novo projeto Supabase
CREATE DATABASE clinica_novaempresa;

-- 2. Importar schema do banco modelo
\i banco_modelo_schema.sql

-- 3. Configurar RLS policies
-- 4. Inserir dados iniciais
-- 5. Configurar usuários padrão
```

## 🛠️ Configuração Técnica Atual

### Banco Central
```sql
-- Tabela principal: clinicas_central
CREATE TABLE clinicas_central (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  subdominio text UNIQUE NOT NULL,
  status text DEFAULT 'ativa',
  database_name text,
  database_url text,
  service_role_key text,
  configuracoes jsonb DEFAULT '{}',
  limites jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);
```

### Roteamento de Subdomínio
```typescript
// src/hooks/useSubdomainRouting.tsx
export const useSubdomainRouting = () => {
  const detectSubdomain = () => {
    const hostname = window.location.hostname;
    
    // Desenvolvimento
    if (hostname === 'localhost') {
      return 'bancomodelo';
    }
    
    // Produção: extrair subdomínio
    const parts = hostname.split('.');
    return parts[0]; // clinica-1 de clinica-1.somosinovai.com
  };
  
  const { data: clinica } = useQuery({
    queryKey: ['clinica-by-subdomain', subdomain],
    queryFn: async () => {
      const { data } = await supabase
        .from('clinicas_central')
        .select('*')
        .eq('subdominio', subdomain)
        .eq('status', 'ativa')
        .single();
      return data;
    }
  });
};
```

### Configuração de Clientes
```typescript
// src/integrations/supabase/adminClient.ts
const CLINIC_DATABASES = {
  'clinica-1': {
    url: "https://tgydssyqgmifcuajacgo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  'bancomodelo': {
    url: "https://tgydssyqgmifcuajacgo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
};

export const createClinicClient = (subdominio: string) => {
  const config = CLINIC_DATABASES[subdominio];
  return createClient(config.url, config.key);
};
```

## 🔄 Fluxo de Dados

### 1. Usuário Acessa Subdomínio
```
nova-clinica.somosinovai.com
↓
DNS resolve para Lovable
↓
useSubdomainRouting detecta 'nova-clinica'
↓
Busca em clinicas_central
↓
Conecta ao banco específico
↓
Renderiza interface da clínica
```

### 2. Autenticação por Clínica
```typescript
// Cada clínica tem contexto isolado
localStorage.setItem('tenant_id', clinicaId);
localStorage.setItem('clinica_id', clinicaId);

// Queries são automaticamente filtradas
const { data } = useQuery({
  queryKey: ['pacientes', tenantId],
  queryFn: () => clinicClient
    .from('pacientes')
    .select('*')
    .eq('clinica_id', tenantId)
});
```

## 🎯 Processo Ideal (Automação Futura)

### 1. Edge Function de Criação
```typescript
// supabase/functions/create-clinic/index.ts
export default async (req: Request) => {
  const { clinicData } = await req.json();
  
  // 1. Validar dados
  // 2. Criar projeto Supabase
  // 3. Configurar DNS automático
  // 4. Clonar schema
  // 5. Configurar usuários padrão
  // 6. Registrar no central
  
  return new Response(JSON.stringify({
    success: true,
    clinicUrl: `https://${subdomain}.somosinovai.com`
  }));
};
```

### 2. Management API Integration
```typescript
// Futuro: Usar Supabase Management API
const createDatabase = async (clinicName: string) => {
  const response = await fetch('https://api.supabase.com/v1/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MANAGEMENT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `clinica-${clinicName}`,
      organization_id: ORG_ID,
      plan: 'free',
      region: 'sa-east-1'
    })
  });
  
  return response.json();
};
```

## 📊 Monitoramento e Controle

### Dashboard Admin
- **URL**: `/admin`
- **Funcionalidades**:
  - Lista todas as clínicas
  - Status de conexão
  - Métricas de uso
  - Suspender/reativar
  - Logs de acesso

### Métricas Importantes
```sql
-- Clínicas ativas
SELECT COUNT(*) FROM clinicas_central WHERE status = 'ativa';

-- Último acesso
SELECT nome, ultimo_acesso 
FROM clinicas_central 
ORDER BY ultimo_acesso DESC;

-- Distribuição por plano
SELECT plano_contratado, COUNT(*) 
FROM clinicas_central 
GROUP BY plano_contratado;
```

## 🚨 Pontos Críticos Atuais

### ⚠️ Limitações
1. **Banco Único**: Todas as clínicas no mesmo banco físico
2. **DNS Manual**: Configuração manual no Hostinger
3. **Clonagem Manual**: Processo não automatizado
4. **Backup**: Não implementado por clínica

### ✅ Próximos Passos
1. **Automatizar DNS** via API Hostinger
2. **Implementar clonagem** via Management API
3. **Backup automático** por tenant
4. **Monitoramento avançado**
5. **Migração zero-downtime**

## 📞 Informações Técnicas

### Bancos Configurados
- **Central**: `biihsfrunulliloaaxju.supabase.co`
- **Modelo**: `tgydssyqgmifcuajacgo.supabase.co`

### Clínicas Ativas
- `bancomodelo` → Modelo/Template
- `clinica-1` → Primeira clínica teste  
- `redemedic` → Rede médica exemplo

### Domínios
- **Desenvolvimento**: `localhost:8080`
- **Produção**: `*.somosinovai.com`

---

**Status**: Sistema operacional com limitações conhecidas
**Próxima Atualização**: Automação completa do processo
**Responsável**: Equipe de desenvolvimento