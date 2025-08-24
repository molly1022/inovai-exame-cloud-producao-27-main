
// Configurações do Stripe para desenvolvimento local e produção

export const stripeConfig = {
  // Chaves públicas (podem ser expostas no frontend)
  publicKey: {
    development: 'pk_test_...', // Substitua pela sua chave pública de teste
    production: 'pk_test_51RWsxcPC8SiUEprzUO1Amm3Wtdlk7RuA2OJBIywxG5O3vzXqMmymFVDOGJjdUdSyR6tCYhpyh30CPnVfMqCVoLpn006tPsgzVI', // Substitua pela sua chave pública de produção
  },
  
  // URLs de retorno
  successUrl: '/dashboard/pagamentos?success=true',
  cancelUrl: '/dashboard/pagamentos?canceled=true',
  
  // Configurações do produto
  product: {
    name: 'Assinatura Unovai Exame Cloud - Plano Básico',
    description: 'Acesso completo ao sistema de gestão clínica',
    price: 28000, // R$ 280,00 em centavos
    currency: 'brl',
    interval: 'month',
  },
  
  // Configurações específicas por ambiente
  development: {
    webhookEndpoint: 'http://localhost:54321/functions/v1/stripe-webhook',
  },
  production: {
    webhookEndpoint: 'https://sxtqlnayloetwlcjtkbj.supabase.co/functions/v1/stripe-webhook',
  }
};

// Helper para obter a chave pública baseada no ambiente
export const getStripePublicKey = () => {
  const isDevelopment = window.location.hostname === 'localhost';
  return isDevelopment 
    ? stripeConfig.publicKey.development 
    : stripeConfig.publicKey.production;
};

// Helper para obter configurações baseadas no ambiente
export const getStripeConfig = () => {
  const isDevelopment = window.location.hostname === 'localhost';
  return isDevelopment ? stripeConfig.development : stripeConfig.production;
};
