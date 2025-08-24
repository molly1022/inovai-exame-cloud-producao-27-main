# Manual de Configuração DNS - Hostinger

## 📋 Visão Geral
Este manual detalha o processo completo para configurar subdomínios no Hostinger para o sistema multi-tenant Inovai.

## 🌐 Configuração DNS Principal

### Domínio Principal: `somosinovai.com`

O sistema está configurado para:
- **Desenvolvimento**: `localhost:8080`
- **Produção**: `*.somosinovai.com`

### 🔧 Passos de Configuração no Hostinger

1. **Acesse o Painel Hostinger**
   - Entre em sua conta Hostinger
   - Vá para "DNS / Nameservers"
   - Selecione o domínio `somosinovai.com`

2. **Configurar Wildcard CNAME**
   ```dns
   Tipo: CNAME
   Nome: *
   Valor: sxtqlnayloetwlcjtkbj.supabase.co
   TTL: 3600
   ```

3. **Configurações Alternativas**
   Se wildcard não funcionar, configure individualmente:
   ```dns
   # Para cada clínica específica
   Tipo: CNAME
   Nome: clinica-1
   Valor: sxtqlnayloetwlcjtkbj.supabase.co
   
   Tipo: CNAME
   Nome: bancomodelo
   Valor: sxtqlnayloetwlcjtkbj.supabase.co
   
   Tipo: CNAME
   Nome: redemedic
   Valor: sxtqlnayloetwlcjtkbj.supabase.co
   ```

4. **Configuração A Record (Fallback)**
   ```dns
   Tipo: A
   Nome: *
   Valor: 185.158.133.1
   TTL: 3600
   ```

## 🏥 Clínicas Ativas no Sistema

### Clínicas Registradas
- `bancomodelo.somosinovai.com` - Clínica modelo/template
- `clinica-1.somosinovai.com` - Primeira clínica teste
- `redemedic.somosinovai.com` - Rede Médica (exemplo)

### Como Adicionar Nova Clínica

1. **Registro no Sistema**
   - Acesse `/nova-clinica`
   - Preencha dados da clínica
   - Escolha subdomínio único
   - Define senha de acesso

2. **Configuração DNS Automática**
   O sistema já está preparado para:
   - Detectar automaticamente o subdomínio
   - Conectar ao banco correto
   - Validar status da clínica

## 🔄 Processo de Propagação

### Tempos de Propagação DNS
- **Hostinger**: 15-30 minutos
- **Global**: Até 24-48 horas
- **Cache Local**: Até 4 horas

### Verificar Propagação
```bash
# Teste DNS
nslookup clinica-1.somosinovai.com

# Teste HTTP
curl https://clinica-1.somosinovai.com
```

## 🛠️ Configuração Técnica do Sistema

### Estrutura do Roteamento
```typescript
// src/hooks/useSubdomainRouting.tsx
const detectSubdomain = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost') {
    return 'bancomodelo'; // Desenvolvimento
  }
  
  const subdomain = hostname.split('.')[0];
  return subdomain;
};
```

### Mapeamento de Bancos
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
```

## 🔐 Segurança e Validação

### Validações Automáticas
- Verificação de subdomínio único
- Status da clínica (ativa/suspensa)
- Conectividade do banco
- Último acesso registrado

### Monitoramento
```sql
-- Verificar clínicas no banco central
SELECT 
  nome,
  subdominio,
  status,
  ultimo_acesso,
  created_at
FROM clinicas_central
ORDER BY created_at DESC;
```

## 📊 Monitoramento e Logs

### Dashboard Admin
- Acesse `/admin` com credenciais
- Visualize status de todas as clínicas
- Monitore conexões ativas
- Gerencie suspensões/reativações

### Logs do Sistema
```javascript
// Logs automáticos no console do navegador
console.log('🔧 Inicializando tenant:', tenantId);
console.log('✅ Clínica conectada:', clinicaData);
console.log('⚠️ Erro de conexão:', error);
```

## 🚨 Solução de Problemas

### Problemas Comuns

1. **Subdomínio não resolve**
   - Verificar configuração DNS
   - Aguardar propagação (24-48h)
   - Testar com ferramentas DNS online

2. **Erro "Clínica não encontrada"**
   - Verificar registro em `clinicas_central`
   - Confirmar status = 'ativa'
   - Validar subdomínio exato

3. **Erro de conexão de banco**
   - Verificar chaves API Supabase
   - Confirmar URLs dos bancos
   - Testar conectividade manual

### Comandos de Depuração
```bash
# Testar DNS
dig clinica-1.somosinovai.com

# Verificar HTTPS
curl -I https://clinica-1.somosinovai.com

# Testar subdomínio específico
curl -H "Host: clinica-1.somosinovai.com" http://localhost:8080
```

## 📞 Contatos Técnicos

- **Sistema**: Inovai Multi-Tenant
- **Documentação**: `/docs`
- **Suporte**: Verificar logs do admin panel

---

**Última Atualização**: 23/08/2025
**Versão**: 1.0
**Responsável**: Sistema Administrativo