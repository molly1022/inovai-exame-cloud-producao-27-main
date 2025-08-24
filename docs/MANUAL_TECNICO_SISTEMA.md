# Manual Técnico - Sistema Multi-Tenant Inovai

## 📋 Visão Geral da Arquitetura

O sistema Inovai implementa uma arquitetura **Database-per-Tenant** com roteamento por subdomínio, permitindo que cada clínica tenha seu ambiente isolado.

## 🏗️ Estrutura do Sistema

### Componentes Principais
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   DNS Routing   │ -> │  Lovable App     │ -> │  Supabase DBs   │
│ *.somosinovai   │    │  React/TS        │    │  Per Tenant     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Fluxo de Requisição
1. **Usuario** → `clinica-1.somosinovai.com`
2. **DNS** → Resolve para Lovable
3. **Router** → Detecta subdomínio `clinica-1`
4. **Auth** → Busca clínica no banco central
5. **Client** → Conecta ao banco específico da clínica
6. **App** → Renderiza interface isolada

## 🗄️ Estrutura de Bancos de Dados

### Banco Central (`biihsfrunulliloaaxju`)
**Função**: Gerenciar todas as clínicas e roteamento

```sql
-- Tabelas principais
clinicas_central         -- Registro de todas as clínicas
admin_sessions          -- Sessões administrativas  
configuracoes_sistema   -- Configurações globais
logs_sistema           -- Logs de auditoria
metricas_sistema       -- Métricas de performance
planos_sistema         -- Planos disponíveis
```

### Bancos por Clínica (`tgydssyqgmifcuajacgo`)
**Função**: Dados operacionais isolados por clínica

```sql
-- Tabelas operacionais (com RLS por clinica_id)
pacientes              -- Pacientes da clínica
medicos               -- Médicos da clínica  
funcionarios          -- Funcionários da clínica
agendamentos          -- Agendamentos da clínica
exames               -- Exames realizados
prontuarios          -- Prontuários médicos
```

## 🔧 Configuração Técnica

### Arquivos Principais

#### `/src/integrations/supabase/adminClient.ts`
```typescript
// Cliente para banco central
export const adminSupabase = createClient(
  "https://biihsfrunulliloaaxju.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

// Configurações por clínica
const CLINIC_DATABASES = {
  'clinica-1': {
    url: "https://tgydssyqgmifcuajacgo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
};

// Criar cliente específico
export const createClinicClient = (subdominio: string) => {
  const config = CLINIC_DATABASES[subdominio];
  return createClient(config.url, config.key);
};
```

#### `/src/hooks/useSubdomainRouting.tsx`
```typescript
export const useSubdomainRouting = () => {
  const [clinica, setClinica] = useState(null);
  
  useEffect(() => {
    const detectSubdomain = () => {
      const hostname = window.location.hostname;
      
      // Desenvolvimento
      if (hostname === 'localhost') {
        return 'bancomodelo';
      }
      
      // Produção: extrair subdomínio  
      return hostname.split('.')[0];
    };
    
    const fetchClinica = async () => {
      const subdomain = detectSubdomain();
      
      const { data } = await adminSupabase
        .from('clinicas_central')
        .select('*')
        .eq('subdominio', subdomain)
        .eq('status', 'ativa')
        .single();
        
      if (data) {
        setClinica(data);
        localStorage.setItem('tenant_id', data.id);
      }
    };
    
    fetchClinica();
  }, []);
  
  return { clinica, loading, error };
};
```

#### `/src/hooks/useTenantId.tsx`
```typescript
export const useTenantId = () => {
  const tenantId = localStorage.getItem('tenant_id');
  
  const getClinicaId = () => {
    const id = localStorage.getItem('tenant_id');
    if (!id) {
      console.error('❌ ID da clínica não encontrado');
      return null;
    }
    return id;
  };
  
  return { tenantId, getClinicaId, isAuthenticated: !!tenantId };
};
```

### Roteamento e Guards

#### `/src/components/SubdomainGuard.tsx`
```typescript
export const SubdomainGuard = ({ children }) => {
  const { clinica, loading, error } = useSubdomainRouting();
  
  if (loading) return <LoadingSpinner />;
  if (error || !clinica) return <ErrorPage />;
  
  return children;
};
```

## 🔐 Autenticação e Segurança

### Sistema de Isolamento
```typescript
// Cada query é automaticamente filtrada por tenant
const usePacientes = () => {
  const { tenantId } = useTenantId();
  
  return useQuery({
    queryKey: ['pacientes', tenantId],
    queryFn: async () => {
      const clinicClient = createClinicClient(subdomain);
      
      const { data } = await clinicClient
        .from('pacientes')
        .select('*')
        .eq('clinica_id', tenantId); // RLS automático
        
      return data;
    }
  });
};
```

### RLS Policies (Exemplos)
```sql
-- Pacientes só podem ser vistos pela própria clínica
CREATE POLICY "pacientes_isolation" ON pacientes
FOR ALL USING (clinica_id = current_setting('app.current_tenant_id'));

-- Médicos só podem ver pacientes da própria clínica  
CREATE POLICY "medicos_isolation" ON medicos
FOR ALL USING (clinica_id = current_setting('app.current_tenant_id'));
```

## 📊 Sistema Administrativo

### Painel Admin (`/admin`)
```typescript
// src/pages/AdminPanel.tsx
const AdminPanel = () => {
  // Buscar todas as clínicas
  const { data: clinicas } = useQuery({
    queryKey: ['clinicas-admin'],
    queryFn: async () => {
      const { data } = await adminSupabase
        .from('clinicas_central')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    }
  });
  
  // Métricas financeiras
  const mrr = clinicas.length * 300; // R$ 300 por clínica
  const arpu = mrr / clinicas.length;
  
  return (
    <div>
      <h1>Painel Administrativo</h1>
      <StatsCards mrr={mrr} arpu={arpu} />
      <ClinicasList clinicas={clinicas} />
    </div>
  );
};
```

### Funcionalidades Admin
- **Listar Clínicas**: Status, conexões, métricas
- **Suspender/Reativar**: Controle de acesso
- **Métricas Financeiras**: MRR, ARPU, crescimento
- **Logs do Sistema**: Auditoria e monitoramento
- **Configurações**: Parâmetros globais

## 🛠️ Criação de Novas Clínicas

### Processo Atual
1. **Formulário** (`/nova-clinica`)
2. **Validação** (subdomínio único)
3. **Registro** (banco central)
4. **DNS** (manual no Hostinger)
5. **Ativação** (automática)

### Código de Criação
```typescript
// src/pages/NovaClinica.tsx
const handleSubmit = async (e) => {
  // 1. Validar subdomínio
  const { data: existing } = await adminSupabase
    .from('clinicas_central')
    .select('id')
    .eq('subdominio', formData.subdominioSolicitado)
    .single();
    
  if (existing) {
    toast.error('Subdomínio já existe');
    return;
  }
  
  // 2. Criar registro
  const { data: novaClinica } = await adminSupabase
    .from('clinicas_central')
    .insert({
      nome: formData.nomeClinica,
      email: formData.emailResponsavel,
      subdominio: formData.subdominioSolicitado,
      status: 'ativa',
      configuracoes: {
        senha_hash: btoa(formData.senhaPersonalizada),
        responsavel: formData.nomeResponsavel
      },
      limites: {
        max_medicos: 10,
        max_funcionarios: 20,
        max_pacientes: 1000
      }
    });
    
  toast.success('Clínica criada com sucesso!');
};
```

## 🌐 Configuração DNS

### Hostinger - somosinovai.com
```dns
# Configuração Wildcard
Tipo: CNAME
Nome: *
Valor: sxtqlnayloetwlcjtkbj.supabase.co

# Configurações específicas
clinica-1    CNAME    sxtqlnayloetwlcjtkbj.supabase.co
bancomodelo  CNAME    sxtqlnayloetwlcjtkbj.supabase.co
redemedic    CNAME    sxtqlnayloetwlcjtkbj.supabase.co
```

## 📊 Monitoramento e Métricas

### Logs Automáticos
```typescript
// Sistema de logs integrado
console.log('🔧 Configurando tenant:', tenantId);
console.log('✅ Clínica conectada:', clinicaData);
console.log('⚠️ Erro de conexão:', error);

// Logs no banco
await adminSupabase
  .from('logs_sistema')
  .insert({
    acao: 'tenant_access',
    clinica_id: tenantId,
    dados_novos: { subdomain, timestamp: new Date() }
  });
```

### Métricas de Performance
```sql
-- Dashboard queries
SELECT 
  COUNT(*) as total_clinicas,
  SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) as ativas,
  AVG(EXTRACT(EPOCH FROM (now() - ultimo_acesso))/3600) as horas_sem_acesso
FROM clinicas_central;
```

## 🔧 Desenvolvimento Local

### Setup Environment
```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
VITE_SUPABASE_URL=https://biihsfrunulliloaaxju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Executar em desenvolvimento
npm run dev

# 4. Acessar
http://localhost:8080  # → bancomodelo (padrão)
```

### Simulação de Subdomínios
```javascript
// Para testar diferentes clínicas localmente
// Modificar temporariamente useSubdomainRouting:
const detectSubdomain = () => {
  // return 'bancomodelo';  // Padrão
  // return 'clinica-1';    // Teste clínica 1
  return 'redemedic';       // Teste rede médica
};
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **"Clínica não encontrada"**
   ```sql
   -- Verificar registro
   SELECT * FROM clinicas_central WHERE subdominio = 'clinica-teste';
   -- Verificar status
   UPDATE clinicas_central SET status = 'ativa' WHERE id = 'uuid...';
   ```

2. **Erro de conexão Supabase**
   - Verificar chaves API
   - Confirmar RLS policies
   - Testar conectividade

3. **DNS não resolve**
   - Aguardar propagação (24-48h)
   - Verificar configuração Hostinger
   - Testar com DNS checker

### Debug Commands
```bash
# Testar DNS
nslookup clinica-1.somosinovai.com

# Verificar logs
tail -f logs/application.log

# Testar conexão Supabase
curl -H "apikey: YOUR_KEY" https://biihsfrunulliloaaxju.supabase.co/rest/v1/clinicas_central
```

## 📞 Suporte

### Informações de Contato
- **Sistema**: Inovai Multi-Tenant v1.0
- **Docs**: `/docs/` (pasta do projeto)
- **Admin**: `/admin` (painel administrativo)
- **Logs**: Console do navegador + banco central

### Recursos Úteis
- Supabase Dashboard
- Hostinger DNS Zone
- Lovable Project Settings
- GitHub Repository (se integrado)

---

**Versão**: 1.0  
**Última Atualização**: 23/08/2025  
**Responsável**: Sistema Administrativo Inovai