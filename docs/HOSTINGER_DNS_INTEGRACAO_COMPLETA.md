# 🌐 INTEGRAÇÃO COMPLETA: HOSTINGER + SISTEMA MULTI-TENANT

## 📋 VISÃO GERAL
Este documento detalha **TUDO** sobre a integração do sistema com a Hostinger para gerenciamento automático de DNS e subdomínios.

---

## 🎯 CONFIGURAÇÃO ATUAL

### Domínio Principal
- **Domínio**: `somosinovai.com`
- **Registrador**: Hostinger
- **Status**: ✅ Ativo e configurado
- **Nameservers**: Hostinger padrão

### Subdomínios Ativos
```dns
bancomodelo.somosinovai.com    → 185.158.133.1 ✅
clinica1.somosinovai.com       → 185.158.133.1 ✅
www.somosinovai.com            → 185.158.133.1 ✅
```

### IP de Destino (Lovable)
```
185.158.133.1
```

---

## 🔧 CONFIGURAÇÃO MANUAL ATUAL

### Como Adicionar Subdomínio na Hostinger:

#### 1. **Acessar Painel Hostinger**
```
URL: https://www.hostinger.com.br/cpanel-login
Login: [suas-credenciais]
```

#### 2. **Navegar para DNS**
```
Painel → Domínios → somosinovai.com → Gerenciar → DNS/Nameservers
```

#### 3. **Adicionar Registro A**
```dns
Tipo: A
Nome: [nome-do-subdominio]
Aponta para: 185.158.133.1
TTL: 14400 (4 horas)
```

#### 4. **Exemplo Prático**
Para criar `novaclinica.somosinovai.com`:
```dns
Tipo: A
Nome: novaclinica
Aponta para: 185.158.133.1
TTL: 14400
```

#### 5. **Aguardar Propagação**
- ⏱️ **Tempo**: 30 minutos a 24 horas
- 🧪 **Teste**: `nslookup novaclinica.somosinovai.com`

---

## 🚀 AUTOMAÇÃO FUTURA

### API da Hostinger

#### Obter API Key:
1. **Painel Hostinger** → **Configurações** → **API**
2. **Gerar nova API Key**
3. **Guardar com segurança**

#### Documentação Oficial:
```
https://developers.hostinger.com/
```

#### Endpoint para DNS:
```http
POST https://api.hostinger.com/v1/domains/{domain}/dns/records
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "type": "A",
  "name": "subdominio",
  "content": "185.158.133.1",
  "ttl": 14400
}
```

---

## 📡 CONFIGURAÇÃO WILDCARD DNS

### O que é Wildcard DNS?
Permite que **QUALQUER** subdomínio funcione automaticamente sem configuração manual:
- `*.somosinovai.com` → `185.158.133.1`

### Vantagens:
- ✅ **Automático**: Novos subdomínios funcionam instantaneamente
- ✅ **Escalável**: Suporte ilimitado a clínicas
- ✅ **Sem Latência**: Não precisa aguardar propagação DNS

### Configuração Wildcard na Hostinger:

#### Método 1: Via Painel
```dns
Tipo: A
Nome: *
Aponta para: 185.158.133.1
TTL: 14400
```

#### Método 2: Via API (Futuro)
```javascript
const criarWildcard = async () => {
  const response = await fetch('https://api.hostinger.com/v1/domains/somosinovai.com/dns/records', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + HOSTINGER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'A',
      name: '*',
      content: '185.158.133.1',
      ttl: 14400
    })
  });
};
```

### ⚠️ Cuidados com Wildcard:
- **SSL**: Certificado wildcard necessário (Let's Encrypt suporta)
- **Segurança**: Qualquer subdomínio será válido
- **Monitoramento**: Mais difícil rastrear subdomínios específicos

---

## 🔐 INTEGRAÇÃO COM SISTEMA

### Fluxo Atual (Manual):
1. **Cliente** cadastra nova clínica
2. **Desenvolvedor** acessa Hostinger manualmente
3. **Desenvolvedor** adiciona registro DNS
4. **Sistema** aguarda propagação
5. **Cliente** pode acessar subdomínio

### Fluxo Futuro (Automático):
1. **Cliente** cadastra nova clínica
2. **Sistema** chama API Hostinger automaticamente
3. **Sistema** aguarda confirmação da API
4. **Cliente** recebe notificação de conclusão

### Implementação do Fluxo Automático:

#### 1. **Adicionar Secrets no Supabase**
```typescript
// Adicionar via Supabase Dashboard:
HOSTINGER_API_KEY=your_hostinger_api_key
HOSTINGER_DOMAIN=somosinovai.com
```

#### 2. **Edge Function para DNS**
```typescript
// supabase/functions/criar-dns/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { subdominio } = await req.json();
  
  try {
    // Chama API da Hostinger
    const response = await fetch(`https://api.hostinger.com/v1/domains/${Deno.env.get('HOSTINGER_DOMAIN')}/dns/records`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + Deno.env.get('HOSTINGER_API_KEY'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'A',
        name: subdominio,
        content: '185.158.133.1',
        ttl: 14400
      })
    });

    if (!response.ok) throw new Error('Erro na API Hostinger');
    
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

#### 3. **Integrar no Cadastro de Clínica**
```typescript
// NovaClinica.tsx - após salvar no banco central
const configurarDNS = async (subdominio: string) => {
  const { data, error } = await supabase.functions.invoke('criar-dns', {
    body: { subdominio }
  });
  
  if (error) throw error;
  return data;
};
```

---

## 🧪 TESTES E VALIDAÇÃO

### Ferramentas de Teste DNS:

#### 1. **nslookup** (Linha de comando)
```bash
nslookup subdominio.somosinovai.com
# Deve retornar: 185.158.133.1
```

#### 2. **Online DNS Checker**
```
https://dnschecker.org/
# Verificar propagação global
```

#### 3. **curl** (Teste HTTP)
```bash
curl -I https://subdominio.somosinovai.com
# Deve retornar status 200
```

### Automatizar Testes no Sistema:

#### Edge Function de Validação:
```typescript
// supabase/functions/validar-dns/index.ts
const validarDNS = async (subdominio: string) => {
  try {
    // Resolver DNS
    const ips = await Deno.resolveDns(`${subdominio}.somosinovai.com`, "A");
    
    // Verificar se aponta para o IP correto
    const ipCorreto = ips.includes('185.158.133.1');
    
    return { valido: ipCorreto, ips };
  } catch (error) {
    return { valido: false, erro: error.message };
  }
};
```

---

## 📊 MONITORAMENTO E LOGS

### Logs de DNS:
```sql
-- Tabela para monitorar DNS
CREATE TABLE dns_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdominio TEXT NOT NULL,
  acao TEXT NOT NULL, -- 'criado', 'validado', 'erro'
  detalhes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Dashboard de Monitoramento:
```typescript
// Componente para monitorar DNS
const DNSMonitor = () => {
  const { data: dnsLogs } = useQuery({
    queryKey: ['dns-logs'],
    queryFn: () => supabase.from('dns_logs').select('*').order('created_at', { ascending: false })
  });
  
  return (
    <div>
      {dnsLogs?.map(log => (
        <div key={log.id}>
          <span>{log.subdominio}</span>
          <span>{log.acao}</span>
          <span>{log.created_at}</span>
        </div>
      ))}
    </div>
  );
};
```

---

## 🚨 PROBLEMAS COMUNS

### 1. **DNS não propaga**
```bash
# Diagnóstico:
dig subdominio.somosinovai.com

# Soluções:
- Verificar TTL (pode ser cache)
- Confirmar configuração na Hostinger
- Aguardar até 48h em casos extremos
```

### 2. **API Hostinger retorna erro**
```javascript
// Tratar erros comuns:
{
  "error": "Record already exists" → Registro já existe
  "error": "Invalid domain" → Domínio inválido
  "error": "Authentication failed" → API key inválida
}
```

### 3. **SSL/HTTPS não funciona**
```
Motivo: Lovable precisa provisionar certificado para novo subdomínio
Tempo: Até 24h após DNS propagar
Solução: Aguardar ou entrar em contato com suporte Lovable
```

### 4. **Subdomínio não resolve**
```bash
# Verificações:
1. nslookup subdominio.somosinovai.com
2. Verificar se registro A existe na Hostinger
3. Testar com DNS público (8.8.8.8)
```

---

## 🔮 ROADMAP DE AUTOMAÇÃO

### Fase 1: Configuração Manual ✅
- [x] Domínio principal configurado
- [x] Subdomínios principais funcionando
- [x] Processo manual documentado

### Fase 2: API Integration 🚧
- [ ] Obter API key da Hostinger
- [ ] Implementar edge function de DNS
- [ ] Integrar com cadastro de clínicas
- [ ] Testes automatizados

### Fase 3: Wildcard DNS ⏳
- [ ] Configurar *.somosinovai.com
- [ ] Certificado SSL wildcard
- [ ] Monitoramento automático

### Fase 4: Dashboard Completo ⏳
- [ ] Interface de gestão DNS
- [ ] Logs e métricas
- [ ] Alertas automáticos
- [ ] Backup/restore de configurações

---

## 📞 SUPORTE HOSTINGER

### Contatos Oficiais:
- 📞 **Telefone**: 0800 888 2888
- 💬 **Chat**: Disponível 24/7 no painel
- 📧 **Email**: Via ticket no painel
- 🌐 **Documentação**: https://support.hostinger.com/

### Para API/Desenvolvimento:
- 📚 **Docs API**: https://developers.hostinger.com/
- 💻 **GitHub**: https://github.com/hostinger
- 🎫 **Suporte Técnico**: Via painel → Desenvolvimento

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### Configuração Inicial:
- [ ] ✅ Domínio somosinovai.com ativo
- [ ] ✅ Nameservers da Hostinger configurados
- [ ] ✅ Subdomínios principais funcionando

### Para Nova Clínica (Manual):
- [ ] 🔧 Acessar painel Hostinger
- [ ] 🔧 Adicionar registro A
- [ ] ⏱️ Aguardar propagação DNS
- [ ] 🧪 Testar resolução DNS
- [ ] ✅ Confirmar HTTPS funcionando

### Para Automação (Futuro):
- [ ] 🔑 Obter API key Hostinger
- [ ] ⚙️ Implementar edge function
- [ ] 🧪 Testes automatizados
- [ ] 📊 Monitoramento ativo

---

*Documentação atualizada em: $(date)  
Responsável: Equipe DevOps  
Versão: 1.0*