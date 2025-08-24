
# Configuração do Stripe - Guia Completo

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Projeto Supabase configurado
3. Edge Functions habilitadas no Supabase

## 🔑 1. Configuração das Chaves do Stripe

### 1.1 Obter as chaves no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie as seguintes chaves:
   - **Publishable key** (pk_test_... para teste)
   - **Secret key** (sk_test_... para teste)

### 1.2 Configurar no Supabase

1. Acesse: https://supabase.com/dashboard/project/sxtqlnayloetwlcjtkbj/settings/functions
2. Adicione a seguinte secret:
   - **Nome**: `STRIPE_SECRET_KEY`
   - **Valor**: sua chave secreta do Stripe (sk_test_...)

### 1.3 Configurar no frontend (desenvolvimento local)

Edite o arquivo `src/config/stripe.ts`:
```typescript
export const stripeConfig = {
  publicKey: {
    development: 'pk_test_SUA_CHAVE_PUBLICA_AQUI',
    production: 'pk_live_SUA_CHAVE_PUBLICA_PRODUCAO',
  },
  // ... resto da configuração
};
```

## 🚀 2. Edge Functions Disponíveis

### 2.1 create-checkout
- **Função**: Cria sessão de checkout do Stripe
- **Endpoint**: `/functions/v1/create-checkout`
- **Método**: POST
- **Headers**: Authorization: Bearer {token}

### 2.2 check-subscription
- **Função**: Verifica status da assinatura no Stripe
- **Endpoint**: `/functions/v1/check-subscription`
- **Método**: POST
- **Headers**: Authorization: Bearer {token}

### 2.3 customer-portal
- **Função**: Abre portal do cliente para gerenciar assinatura
- **Endpoint**: `/functions/v1/customer-portal`
- **Método**: POST
- **Headers**: Authorization: Bearer {token}

## 📊 3. Fluxo de Pagamento

### 3.1 Nova Assinatura
1. Usuário clica em "Assinar"
2. Sistema chama `create-checkout`
3. Usuário é redirecionado para Stripe Checkout
4. Após pagamento, retorna para `/dashboard/pagamentos?success=true`
5. Sistema automaticamente verifica status com `check-subscription`

### 3.2 Renovação Automática
1. Stripe processa pagamento automaticamente todo mês
2. Sistema atualiza `dias_restantes` automaticamente a cada 10 segundos
3. Quando `dias_restantes` chega a 0, status muda para "vencida"

### 3.3 Gerenciamento de Assinatura
1. Usuário clica em "Gerenciar Assinatura"
2. Sistema chama `customer-portal`
3. Usuário é redirecionado para Stripe Customer Portal
4. Pode cancelar, alterar cartão, ver faturas, etc.

## 🗄️ 4. Estrutura do Banco de Dados

### Tabela: assinaturas
- `id`: UUID (PK)
- `clinica_id`: UUID (FK para clinicas)
- `stripe_customer_id`: String
- `stripe_subscription_id`: String
- `status`: String ('ativa', 'vencida', 'cancelada')
- `valor`: Decimal (150.00)
- `proximo_pagamento`: Date
- `dias_restantes`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp

## ⚙️ 5. Configuração para Desenvolvimento Local

### 5.1 Variáveis de Ambiente Necessárias
No Supabase Functions, configure:
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase

### 5.2 URLs de Retorno
Para desenvolvimento local, configure no Stripe Dashboard:
- Success URL: `http://localhost:3000/dashboard/pagamentos?success=true`
- Cancel URL: `http://localhost:3000/dashboard/pagamentos?canceled=true`

## 🔄 6. Sistema de Contagem Automática

### 6.1 Como Funciona
- Timer JavaScript executa a cada 10 segundos
- Calcula dias restantes baseado em `proximo_pagamento`
- Atualiza banco de dados automaticamente
- Muda status para "vencida" quando dias_restantes <= 0

### 6.2 Notificações
- Aviso quando faltam 5 dias ou menos
- Notificação quando assinatura vence
- Status visual atualizado em tempo real

## 🧪 7. Testes

### 7.1 Cartões de Teste do Stripe
- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### 7.2 Fluxo de Teste
1. Configure chaves de teste do Stripe
2. Crie assinatura usando cartão de teste
3. Verifique atualização automática dos dias
4. Teste portal do cliente
5. Teste cancelamento/renovação

## 📞 8. Suporte e Logs

### 8.1 Logs das Edge Functions
Acesse: https://supabase.com/dashboard/project/sxtqlnayloetwlcjtkbj/functions

### 8.2 Logs do Stripe
Acesse: https://dashboard.stripe.com/logs

### 8.3 Debugging
- Todos os edge functions têm logs detalhados
- Console do navegador mostra erros de frontend
- Supabase Dashboard mostra logs de banco de dados

## 🔒 9. Segurança

### 9.1 Chaves de API
- ✅ Chaves secretas apenas no backend (Edge Functions)
- ✅ Chaves públicas podem ser expostas no frontend
- ✅ Service Role Key apenas em Edge Functions

### 9.2 Autenticação
- ✅ Todas as Edge Functions validam token JWT
- ✅ RLS habilitado em todas as tabelas
- ✅ Usuário só acessa dados da própria clínica

## 🚀 10. Deploy para Produção

### 10.1 Checklist
- [ ] Configurar chaves de produção do Stripe
- [ ] Atualizar URLs de retorno para domínio de produção
- [ ] Configurar webhook (se necessário)
- [ ] Testar fluxo completo em produção
- [ ] Monitorar logs iniciais

### 10.2 URLs de Produção
- Success: `https://seudominio.com/dashboard/pagamentos?success=true`
- Cancel: `https://seudominio.com/dashboard/pagamentos?canceled=true`
