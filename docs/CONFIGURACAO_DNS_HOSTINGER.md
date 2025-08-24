# 🌐 CONFIGURAÇÃO DNS HOSTINGER PARA SUBDOMÍNIOS

## ⚠️ PROBLEMA IDENTIFICADO
Quando acessa `clinica-1.somosinovai.com` → Aparece página da Hostinger ❌
**Motivo:** DNS não configurado para apontar subdomínios para o Lovable

## 🎯 SOLUÇÃO: CONFIGURAR DNS NA HOSTINGER

### 📋 **PASSO A PASSO**

#### 1. **ACESSO AO PAINEL HOSTINGER**
- Entre no painel da Hostinger
- Vá em **"Domínios"** → **"somosinovai.com"** → **"Gerenciar"**
- Clique em **"Zona DNS"**

#### 2. **CONFIGURAR REGISTRO WILDCARD**
Adicione este registro DNS:

```
Tipo: CNAME
Nome: *
Valor: sxtqlnayloetwlcjtkbj.supabase.co
TTL: 14400
```

**OU se não aceitar wildcard (*), configure individualmente:**

```
Tipo: CNAME
Nome: clinica-1
Valor: sxtqlnayloetwlcjtkbj.supabase.co
TTL: 14400

Tipo: CNAME
Nome: teste-1
Valor: sxtqlnayloetwlcjtkbj.supabase.co
TTL: 14400

Tipo: CNAME
Nome: redemedic
Valor: sxtqlnayloetwlcjtkbj.supabase.co
TTL: 14400
```

#### 3. **CONFIGURAÇÃO ALTERNATIVA (Se CNAME não funcionar)**
Use registro A:

```
Tipo: A
Nome: *
Valor: 185.158.133.1
TTL: 14400
```

## 🔍 **CLÍNICAS ATIVAS NO SISTEMA**
- **clinica-1** → Clínica Memorial (Principal)
- **teste-1** → Clínica Teste 1
- **redemedic** → Redemedic

## ⏱️ **TEMPO DE PROPAGAÇÃO**
- **Hostinger**: 15-30 minutos
- **Global**: Até 24 horas

## ✅ **TESTE DE FUNCIONAMENTO**
Após configurar, teste:
1. `https://clinica-1.somosinovai.com` → Deve carregar sistema da clínica
2. `https://teste-1.somosinovai.com` → Deve carregar sistema da clínica
3. `https://redemedic.somosinovai.com` → Deve carregar sistema da clínica

## 🚨 **CONFIGURAÇÃO ATUAL DO SISTEMA**
O sistema já está 100% configurado para:
- ✅ Detectar subdomínios automaticamente
- ✅ Buscar clínica no banco central
- ✅ Rotear para banco específico da clínica
- ✅ Isolar dados por clínica

**APENAS o DNS precisa ser configurado na Hostinger!**

## 📞 **SUPORTE HOSTINGER**
Se tiver problemas, contate suporte da Hostinger informando:
- "Preciso configurar subdomínios wildcard"
- "Apontar *.somosinovai.com para sxtqlnayloetwlcjtkbj.supabase.co"