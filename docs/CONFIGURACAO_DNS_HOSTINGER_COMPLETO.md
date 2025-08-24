# CONFIGURAÇÃO DNS HOSTINGER - GUIA COMPLETO

## 🎯 OBJETIVO

Configurar o DNS na Hostinger para permitir que subdomínios como `clinica1.somosinovai.com` funcionem automaticamente com o sistema multi-tenant do Lovable.

## 🏗️ CONFIGURAÇÃO ATUAL

### Domínio Principal: somosinovai.com

**Status: ✅ CONFIGURADO E FUNCIONANDO**

### Configuração DNS Wildcard

```
Tipo: CNAME
Nome: *
Valor: sxtqlnayloetwlcjtkbj.supabase.co
TTL: 300 (5 minutos)
```

## 📋 PASSO A PASSO - CONFIGURAÇÃO MANUAL

### 1. Acessar Painel Hostinger

1. Faça login no painel da Hostinger
2. Vá em "Websites" → "Gerenciar"
3. Procure por "DNS / Nameservers"
4. Clique em "DNS Zone"

### 2. Adicionar Registro CNAME Wildcard

```
Type: CNAME
Name: * (asterisco)
Points to: sxtqlnayloetwlcjtkbj.supabase.co
TTL: 300
```

### 3. Configurações Individuais (Se Wildcard Falhar)

Se o wildcard não funcionar, configure individualmente:

```
Type: CNAME
Name: bancomodelo
Points to: sxtqlnayloetwlcjtkbj.supabase.co

Type: CNAME  
Name: clinica-teste
Points to: sxtqlnayloetwlcjtkbj.supabase.co

Type: CNAME
Name: nova-clinica
Points to: sxtqlnayloetwlcjtkbj.supabase.co
```

### 4. Verificar Configuração

Após salvar, aguarde 15-30 minutos e teste:

```bash
# Verificar resolução DNS
nslookup bancomodelo.somosinovai.com

# Testar acesso HTTP  
curl -I https://bancomodelo.somosinovai.com
```

## 🤖 AUTOMAÇÃO VIA API (FUTURO)

### Configuração da API Key

1. Obter API Key da Hostinger
2. Configurar secret no Supabase:

```bash
# Via painel Supabase
HOSTINGER_API_KEY=sua_api_key_aqui
```

### Edge Function para Automação

```typescript
// supabase/functions/configurar-dns-hostinger/index.ts
const criarSubdominio = async (subdominio: string) => {
  const response = await fetch('https://api.hostinger.com/dns/records', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('HOSTINGER_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      domain: 'somosinovai.com',
      type: 'CNAME',
      name: subdominio,
      content: 'sxtqlnayloetwlcjtkbj.supabase.co',
      ttl: 300
    })
  });
  
  return await response.json();
};
```

## 🔍 VERIFICAÇÃO E TESTES

### Comandos de Verificação

```bash
# 1. Testar resolução DNS
nslookup bancomodelo.somosinovai.com
# Deve retornar: sxtqlnayloetwlcjtkbj.supabase.co

# 2. Testar conectividade HTTP
curl -v https://bancomodelo.somosinovai.com
# Deve retornar status 200

# 3. Verificar propagação global
dig @8.8.8.8 bancomodelo.somosinovai.com CNAME
```

### Ferramentas Online

- **DNS Checker**: https://dnschecker.org
- **What's My DNS**: https://whatsmydns.net
- **DNS Propagation**: https://dnspropagation.net

## 📊 MONITORAMENTO

### Clínicas Ativas Atualmente

```
bancomodelo.somosinovai.com ✅
clinica-teste.somosinovai.com ✅
nova-era.somosinovai.com ✅
```

### Scripts de Monitoramento

```bash
#!/bin/bash
# verificar_subdominios.sh

DOMINIOS=(
  "bancomodelo.somosinovai.com"
  "clinica-teste.somosinovai.com"
  "nova-era.somosinovai.com"
)

for dominio in "${DOMINIOS[@]}"; do
  status=$(curl -o /dev/null -s -w "%{http_code}" https://$dominio)
  if [ $status -eq 200 ]; then
    echo "✅ $dominio - OK"
  else
    echo "❌ $dominio - FALHA ($status)"
  fi
done
```

## 🛠️ TROUBLESHOOTING

### Problema: Subdomínio não resolve

**Sintomas**: 
- `nslookup` não retorna resultado
- Browser mostra erro "Site não encontrado"

**Soluções**:
1. Verificar se wildcard `*` está configurado
2. Aguardar propagação DNS (até 24h)
3. Configurar subdomínio individual se wildcard falhar
4. Verificar TTL (deve ser 300-3600)

### Problema: Subdomínio resolve mas site não carrega

**Sintomas**:
- DNS resolve corretamente  
- Erro 404 ou 500 no browser

**Soluções**:
1. Verificar se clínica existe no `clinicas_central`
2. Verificar logs do sistema
3. Testar `TenantRouter` no código
4. Verificar RLS policies

### Problema: Apenas alguns subdomínios funcionam

**Sintomas**:
- Wildcard parcialmente funcional
- Inconsistência entre subdomínios

**Soluções**:
1. Remover wildcard e configurar individualmente
2. Verificar cache DNS local (`ipconfig /flushdns`)
3. Testar com diferentes provedores DNS
4. Configurar A record como alternativa

## 📈 MÉTRICAS E PERFORMANCE

### Tempo de Propagação Médio

- **Hostinger**: 5-15 minutos
- **Global**: 30 minutos - 2 horas
- **Cache Local**: Até 24 horas

### Performance DNS

```bash
# Testar velocidade de resolução
time nslookup bancomodelo.somosinovai.com

# Resultado esperado: < 100ms
```

## 🔮 PRÓXIMOS PASSOS

### Automação Completa

1. **Integração API Hostinger**: Criação automática de subdomínios
2. **Validação Automática**: Verificar propagação após criação
3. **Rollback Automático**: Remover DNS se clínica for excluída
4. **Monitoramento Contínuo**: Alertas se subdomínio parar de funcionar

### Configurações Avançadas

1. **CDN**: Cloudflare para performance global
2. **SSL Personalizado**: Certificados por subdomínio
3. **Load Balancing**: Distribuição de carga
4. **Backup DNS**: Provedores secundários

## 📞 SUPORTE TÉCNICO

### Informações para Suporte Hostinger

- **Domínio**: somosinovai.com
- **Configuração**: CNAME Wildcard
- **Objetivo**: Sistema multi-tenant com subdomínios
- **TTL**: 300 segundos
- **Destino**: sxtqlnayloetwlcjtkbj.supabase.co

### Contatos

- **Hostinger Support**: Via painel ou chat
- **DNS Issues**: Verificar primeiro com ferramentas online
- **Lovable Support**: Para questões do lado da aplicação

## 📋 CHECKLIST DE CONFIGURAÇÃO

### ✅ Configuração Inicial
- [ ] Wildcard CNAME configurado
- [ ] TTL definido (300-3600)
- [ ] Aguardar propagação (15-30 min)
- [ ] Testar com nslookup
- [ ] Testar acesso HTTP

### ✅ Testes de Validação  
- [ ] bancomodelo.somosinovai.com funciona
- [ ] Novos subdomínios resolvem automaticamente
- [ ] Sistema detecta clínicas corretamente
- [ ] RLS isola dados por clínica
- [ ] Login funciona por subdomínio

### ✅ Monitoramento
- [ ] Script de verificação automática
- [ ] Alertas configurados
- [ ] Logs de acesso monitorados
- [ ] Performance DNS acceptable
- [ ] Backup de configuração documentado

---

**Status Final**: ✅ CONFIGURAÇÃO FUNCIONAL EM PRODUÇÃO