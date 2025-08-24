# 🏥 MANUAL COMPLETO: ADICIONANDO NOVA CLÍNICA

## 📋 VISÃO GERAL
Este manual detalha **TODOS** os passos necessários para adicionar uma nova clínica ao sistema multi-tenant, incluindo os processos manuais que ainda não foram automatizados.

---

## 🚀 PROCESSO COMPLETO (PASSO A PASSO)

### ETAPA 1: CADASTRO INICIAL (AUTOMÁTICO) ✅

#### 1.1 Acessar Interface de Cadastro
- Navegue para: `https://somosinovai.com/nova-clinica`
- Ou clique em "Cadastre sua Clínica" na página inicial

#### 1.2 Preencher Formulário Completo
```
📋 DADOS OBRIGATÓRIOS:
✓ Nome da Clínica
✓ Nome do Responsável  
✓ CPF do Responsável
✓ Email do Responsável
✓ Subdomínio Desejado (sem espaços/caracteres especiais)
✓ Senha de Acesso (mínimo 8 caracteres)

📋 DADOS OPCIONAIS:
- Telefone
- Endereço Completo
- Observações
```

#### 1.3 Validação Automática
O sistema verificará:
- ✅ Subdomínio único (não pode repetir)
- ✅ Formato de email válido
- ✅ Senha forte (mínimo 8 caracteres)
- ✅ CPF formato válido

#### 1.4 Confirmação
- Dados serão salvos em `clinicas_central`
- Status inicial: `ativa`
- Referência inicial: `banco_modelo`

---

### ETAPA 2: CRIAR BANCO ESPECÍFICO (MANUAL) ⚠️

> **IMPORTANTE**: Esta etapa ainda é manual e deve ser feita por um desenvolvedor

#### 2.1 Acessar Supabase Dashboard
- URL: `https://app.supabase.com`
- Login com conta principal do projeto

#### 2.2 Criar Novo Projeto Supabase
```bash
Nome do Projeto: clinica-[subdominio]
Região: East US (us-east-1)  
Database Password: [senha-forte-gerada]
```

#### 2.3 Copiar Schema do Banco Modelo
1. **Acessar banco modelo**:
   - URL: `https://tgydssyqgmifcuajacgo.supabase.co`

2. **Exportar Schema**:
   ```sql
   -- Acessar SQL Editor > Export Schema
   -- Copiar todo o SQL gerado
   ```

3. **Executar no Novo Banco**:
   ```sql
   -- Colar e executar no SQL Editor do novo projeto
   -- Incluir todas as tabelas, triggers, functions, e RLS policies
   ```

#### 2.4 Configurar Autenticação
```sql
-- Configurar authentication.users para a clínica
-- Permitir cadastro de usuários da clínica
-- Configurar políticas RLS baseadas em user_id
```

#### 2.5 Obter Credenciais do Novo Banco
```
✓ Project URL: https://[project-ref].supabase.co
✓ Anon Key: eyJ... (chave pública)
✓ Service Role Key: eyJ... (chave privada - CUIDADO!)
```

#### 2.6 Atualizar Banco Central
```sql
-- Conectar no banco central e executar:
UPDATE clinicas_central 
SET 
  database_url = 'https://[project-ref].supabase.co',
  service_role_key = '[service-role-key]',
  database_name = 'clinica_[subdominio]',
  status = 'ativa'
WHERE subdominio = '[subdominio-da-clinica]';
```

---

### ETAPA 3: CONFIGURAR DNS NA HOSTINGER (MANUAL) ⚠️

> **IMPORTANTE**: Esta etapa é feita no painel da Hostinger

#### 3.1 Acessar Painel Hostinger
- URL: `https://www.hostinger.com.br`
- Login: [credenciais-da-conta]
- Selecionar domínio: `somosinovai.com`

#### 3.2 Gerenciar Zona DNS
1. **Painel** → **Domínios** → **somosinovai.com**
2. **DNS / Nameservers** → **Gerenciar registros DNS**

#### 3.3 Adicionar Novo Registro A
```dns
Tipo: A
Nome: [subdominio-da-clinica]
Aponta para: 185.158.133.1
TTL: 14400 (4 horas)
```

**Exemplo para clínica "saojoao"**:
```dns
Tipo: A
Nome: saojoao
Aponta para: 185.158.133.1
TTL: 14400
```

#### 3.4 Aguardar Propagação DNS
- ⏱️ **Tempo**: 30 minutos a 24 horas
- 🔍 **Teste**: `nslookup saojoao.somosinovai.com`
- ✅ **Confirmação**: Deve retornar `185.158.133.1`

#### 3.5 Testar Acesso
```bash
# Teste manual no navegador:
https://saojoao.somosinovai.com
```

---

### ETAPA 4: CONFIGURAR SISTEMA DE LOGIN (MANUAL) ⚠️

#### 4.1 Criar Usuário Administrador da Clínica
No banco específico da clínica, executar:
```sql
-- Inserir usuário na tabela auth.users (via interface Supabase)
-- Ou criar via Authentication > Users > Invite user
```

#### 4.2 Configurar Perfil da Clínica
```sql
-- Executar no banco específico da clínica:
INSERT INTO profiles (
  id, 
  email, 
  nome, 
  role, 
  created_at
) VALUES (
  '[user-id-do-supabase]',
  '[email-do-responsavel]',
  '[nome-do-responsavel]',
  'admin',
  NOW()
);
```

#### 4.3 Testar Login
1. Acessar `https://[subdominio].somosinovai.com`
2. Fazer login com credenciais criadas
3. Verificar se acesso está funcionando

---

### ETAPA 5: CONFIGURAÇÕES INICIAIS (MANUAL) ⚠️

#### 5.1 Configurar Informações da Clínica
```sql
-- No banco específico da clínica:
INSERT INTO configuracoes_clinica (
  nome_clinica,
  cnpj,
  endereco,
  telefone,
  email_contato
) VALUES (
  '[nome-da-clinica]',
  '[cnpj-se-tiver]',
  '[endereco-completo]', 
  '[telefone]',
  '[email-contato]'
);
```

#### 5.2 Configurar Planos e Limites
```sql
-- Aplicar limites baseados no plano contratado:
UPDATE configuracoes_clinica 
SET limites = '{
  "max_medicos": 10,
  "max_funcionarios": 20, 
  "max_pacientes": 1000,
  "teleconsultas_mes": 100
}';
```

---

## 🔧 AUTOMAÇÃO FUTURA

### O que pode ser automatizado:

#### 1. **Criação de Banco (Supabase API)**
```typescript
// Em desenvolvimento:
const criarBancoClinica = async (subdominio: string) => {
  const response = await fetch('https://api.supabase.com/v1/projects', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SUPABASE_MANAGEMENT_KEY,
    },
    body: JSON.stringify({
      name: `clinica-${subdominio}`,
      organization_id: ORG_ID,
      region: 'us-east-1'
    })
  });
};
```

#### 2. **Configuração DNS (Hostinger API)**
```typescript  
// Em desenvolvimento:
const adicionarDNS = async (subdominio: string) => {
  const response = await fetch('https://api.hostinger.com/dns/records', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + HOSTINGER_API_KEY,
    },
    body: JSON.stringify({
      type: 'A',
      name: subdominio,
      content: '185.158.133.1',
      domain: 'somosinovai.com'
    })
  });
};
```

#### 3. **Script de Deploy Completo**
```bash
#!/bin/bash
# Em desenvolvimento: deploy-nova-clinica.sh

SUBDOMINIO=$1
NOME_CLINICA=$2
EMAIL_ADMIN=$3

echo "🏗️ Criando banco para $SUBDOMINIO..."
node scripts/criar-banco.js $SUBDOMINIO

echo "🌐 Configurando DNS..."  
node scripts/configurar-dns.js $SUBDOMINIO

echo "👤 Criando usuário admin..."
node scripts/criar-admin.js $EMAIL_ADMIN $SUBDOMINIO

echo "✅ Clínica $NOME_CLINICA está pronta!"
echo "🔗 Acesso: https://$SUBDOMINIO.somosinovai.com"
```

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### 1. **DNS Não Propaga**
```bash
# Verificar propagação:
nslookup subdominio.somosinovai.com

# Se não funcionar:
- Aguardar mais tempo (até 24h)
- Verificar configuração na Hostinger
- Limpar cache DNS: ipconfig /flushdns
```

### 2. **Erro de Conexão com Banco**
```sql
-- Verificar no banco central:
SELECT * FROM clinicas_central WHERE subdominio = 'problema';

-- Verificar se database_url está correto
-- Verificar se service_role_key está correto
```

### 3. **Login Não Funciona**
```sql
-- Verificar usuários no banco específico:
SELECT * FROM auth.users;

-- Verificar se perfil foi criado:
SELECT * FROM profiles;
```

### 4. **Subdomínio Já Existe**
```sql
-- Verificar duplicatas:
SELECT subdominio, COUNT(*) 
FROM clinicas_central 
GROUP BY subdominio 
HAVING COUNT(*) > 1;
```

---

## 📞 CONTATOS DE SUPORTE

### Para Desenvolvedores:
- 📧 **Email**: dev@somosinovai.com
- 💬 **Slack**: #desenvolvimento
- 📱 **WhatsApp**: +55 11 99999-9999

### Para Suporte DNS/Hostinger:
- 🌐 **Painel**: https://www.hostinger.com.br
- 📞 **Suporte**: 0800 888 2888
- 💬 **Chat**: Disponível 24/7 no painel

### Para Suporte Supabase:
- 🌐 **Dashboard**: https://app.supabase.com
- 📧 **Suporte**: support@supabase.io
- 📚 **Docs**: https://supabase.com/docs

---

## ✅ CHECKLIST FINAL

Antes de considerar a clínica "pronta":

### Banco de Dados:
- [ ] ✅ Novo projeto Supabase criado
- [ ] ✅ Schema copiado do banco modelo
- [ ] ✅ RLS configurado corretamente
- [ ] ✅ Credenciais atualizadas no banco central
- [ ] ✅ Teste de conectividade OK

### DNS:
- [ ] ✅ Registro A criado na Hostinger
- [ ] ✅ DNS propagado (nslookup OK)
- [ ] ✅ HTTPS funcionando
- [ ] ✅ Redirecionamento automático OK

### Sistema:
- [ ] ✅ Login funcionando
- [ ] ✅ Usuário admin criado
- [ ] ✅ Configurações iniciais aplicadas
- [ ] ✅ Limites de plano configurados
- [ ] ✅ Teste completo do sistema OK

### Entrega:
- [ ] ✅ Credenciais enviadas para responsável
- [ ] ✅ Manual de uso entregue
- [ ] ✅ Suporte técnico informado
- [ ] ✅ Monitoramento ativado

---

*Manual atualizado em: $(date)  
Responsável: Equipe de Desenvolvimento  
Versão: 1.0*