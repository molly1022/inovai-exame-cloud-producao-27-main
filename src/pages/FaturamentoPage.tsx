import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Shield,
  Clock,
  BarChart3,
  Zap,
  Target,
  Users,
  Building
} from 'lucide-react';

const FaturamentoPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: CreditCard,
      title: "Pagamentos Online Seguros",
      description: "Processamento de cartões integrado com as principais bandeiras"
    },
    {
      icon: FileText,
      title: "Faturamento de Convênios",
      description: "Integração direta com operadoras para agilizar reembolsos"
    },
    {
      icon: BarChart3,
      title: "Relatórios Financeiros",
      description: "Dashboards completos para acompanhar receitas e inadimplência"
    },
    {
      icon: Clock,
      title: "Cobrança Automática",
      description: "Lembretes de pagamento e cobrança recorrente automatizada"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Compliance PCI DSS e criptografia de ponta a ponta"
    },
    {
      icon: Target,
      title: "Planos e Assinaturas",
      description: "Gerencie mensalidades e planos de tratamento facilmente"
    }
  ];

  const benefits = [
    {
      stat: "40%",
      description: "Redução no tempo de cobrança"
    },
    {
      stat: "85%",
      description: "Dos pagamentos recebidos online"
    },
    {
      stat: "3x",
      description: "Mais rápido que sistemas tradicionais"
    },
    {
      stat: "99.9%",
      description: "Uptime garantido para pagamentos"
    }
  ];

  const integrations = [
    {
      name: "Mercado Pago",
      logo: "https://logoeps.com/wp-content/uploads/2014/03/vector-mercadopago-logo.png"
    },
    {
      name: "Stripe",
      logo: "https://logos-world.net/wp-content/uploads/2021/03/Stripe-Logo.png"
    },
    {
      name: "PagSeguro",
      logo: "https://logoeps.com/wp-content/uploads/2013/03/pagseguro-vector-logo.png"
    },
    {
      name: "PIX",
      logo: "https://logoeps.com/wp-content/uploads/2020/11/pix-logo-vector.png"
    }
  ];

  const testimonials = [
    {
      quote: "Nosso fluxo de caixa melhorou drasticamente. Recebemos 85% dos pagamentos no mesmo dia com o Inovai ProMed.",
      author: "Dr. Roberto Lima",
      clinic: "Clínica Médica Excellence",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face"
    },
    {
      quote: "A integração com convênios economizou horas de trabalho administrativo. Agora tudo é automatizado.",
      author: "Dra. Patricia Costa",
      clinic: "Centro Odontológico Saúde Total",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const pricingFeatures = [
    "Taxa competitiva de 2.99% por transação",
    "Recebimento em D+1 (dia útil)",
    "Suporte para PIX, cartão e boleto",
    "Relatórios financeiros completos",
    "Integração com convênios",
    "Cobrança automática recorrente"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold text-sm">
                INOVAI
              </div>
              <span className="font-semibold text-lg">ProMed</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/clinica-login')}
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/nova-clinica')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Experimente Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Faturamento Inteligente
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-slate-800 leading-tight">
                  Faturamento que
                  <span className="text-emerald-600 block">acelera recebíveis</span>
                </h1>
                
                <p className="text-xl text-slate-600 max-w-lg">
                  Receba mais rápido, automatize cobranças e integre com convênios. 
                  A solução completa de faturamento para clínicas modernas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/nova-clinica')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Teste 30 Dias Grátis
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  Ver Demonstração
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{benefit.stat}</div>
                    <div className="text-sm text-slate-600">{benefit.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/650cabdae26d521193e91203_Billing-InsuranceWorkflows-Integrations.webp"
                alt="Sistema de Faturamento Inovai ProMed"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                  <div>
                    <div className="font-semibold text-slate-800">Recebimento</div>
                    <div className="text-emerald-600 font-bold">D+1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Recursos que maximizam sua receita
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Tudo que você precisa para ter um faturamento eficiente e fluxo de caixa saudável
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
                <feature.icon className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Integrações que funcionam
            </h2>
            <p className="text-xl text-slate-600">
              Conecte-se com as principais plataformas de pagamento do Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <img 
                  src={integration.logo} 
                  alt={integration.name}
                  className="h-12 mx-auto mb-4 object-contain"
                />
                <h3 className="font-semibold text-slate-800">{integration.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Preços transparentes e justos
            </h2>
            <p className="text-xl text-slate-600">
              Sem taxas ocultas, apenas resultados garantidos
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-emerald-500">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Faturamento Completo</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-2">2.99%</div>
                <p className="text-slate-600">por transação processada</p>
              </div>

              <div className="space-y-4 mb-8">
                {pricingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                onClick={() => navigate('/nova-clinica')}
              >
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Resultados comprovados
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">{testimonial.author}</div>
                    <div className="text-sm text-slate-600">{testimonial.clinic}</div>
                  </div>
                </div>
                
                <p className="text-slate-600 italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para acelerar seus recebíveis?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Junte-se a milhares de clínicas que já melhoraram seu fluxo de caixa 
            e automatizaram seu faturamento com Inovai ProMed.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/nova-clinica')}
            className="bg-white text-emerald-600 hover:bg-slate-100 px-8 py-4 text-lg"
          >
            <DollarSign className="mr-2 h-5 w-5" />
            Começar Agora - 30 Dias Grátis
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FaturamentoPage;