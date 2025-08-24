import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Shield, Users, Calendar, FileText, MessageSquare, BarChart3, Smartphone } from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Essencial",
      subtitle: "Organize-se com os recursos essenciais de gestão clínica.",
      price: "R$ 99",
      period: "/ por mês",
      description: "Perfeito para clínicas pequenas começando a se digitalizar",
      features: [
        "Uma licença por localização",
        "Todos os recursos de agendamento",
        "Lembretes de consulta (Email & SMS)",
        "Ferramentas administrativas",
        "Formulários de admissão personalizáveis",
        "Prontuários personalizáveis",
        "Ferramentas para profissionais",
        "Prontuários pré-construídos",
        "Faturamento & Recibos",
        "Processamento de cartão integrado",
        "Ferramentas de equipe & gestão",
        "Armazenamento ilimitado de dados",
        "Segurança & Conformidade",
        "Consultas de telemedicina 1:1 HD",
        "Integrações de agenda e pagamentos",
        "Ferramentas gratuitas de importação",
        "Resumos de prontuário com IA",
        "Assistente de escrita com IA"
      ],
      highlighted: false,
      buttonText: "Agendar Demonstração",
      additionalInfo: "+ R$ 50 por licença adicional"
    },
    {
      name: "Profissional",
      subtitle: "Escale seu negócio e aumente a eficiência em todos os níveis.",
      price: "R$ 189",
      period: "/ por mês",
      description: "Ideal para clínicas em crescimento que querem maximizar resultados",
      features: [
        "Todos os benefícios do Essencial, e:",
        "Portal do Paciente/Agendamento Online",
        "Faturamento de convênios",
        "Assinaturas & Planos de saúde",
        "Gestão de múltiplas localizações",
        "Implementação assistida",
        "Suporte por telefone",
        "App móvel para pacientes",
        "Relatórios avançados",
        "Integração com laboratórios",
        "Backup automático em nuvem",
        "API para integrações personalizadas"
      ],
      highlighted: true,
      buttonText: "Agendar Demonstração",
      additionalInfo: "+ R$ 50 por licença adicional",
      badge: "Mais Popular"
    },
    {
      name: "Enterprise",
      subtitle: "Toda a flexibilidade que você precisa para atender seus requisitos e acompanhar seu crescimento.",
      price: "Personalizado",
      period: "",
      description: "Para clínicas com 5+ localizações ou 100+ funcionários",
      features: [
        "Todos os benefícios do Profissional, e:",
        "Preços personalizados",
        "Suporte & implementação sob medida",
        "Treinamento especializado",
        "Gerente de conta dedicado",
        "Integrações personalizadas",
        "Conformidade avançada",
        "SLA garantido de 99.9%",
        "Backup geográfico redundante",
        "Auditoria de segurança completa"
      ],
      highlighted: false,
      buttonText: "Solicitar Orçamento"
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamento com confirmações automáticas"
    },
    {
      icon: FileText,
      title: "Prontuário Eletrônico",
      description: "EMR completo com IA integrada para otimizar documentação"
    },
    {
      icon: Users,
      title: "Portal do Paciente",
      description: "Área exclusiva para pacientes acessarem informações e agendarem"
    },
    {
      icon: MessageSquare,
      title: "Comunicação Automática",
      description: "Envio de SMS e emails automáticos para pacientes"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Analytics completo sobre desempenho da clínica"
    },
    {
      icon: Smartphone,
      title: "Telemedicina",
      description: "Consultas virtuais integradas com gravação e prontuário"
    }
  ];

  const faqs = [
    {
      question: "Posso mudar de plano a qualquer momento?",
      answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas no próximo ciclo de faturamento."
    },
    {
      question: "O que são licenças simultâneas?",
      answer: "Uma licença = um usuário conectado simultaneamente. Se você tem 5 funcionários mas apenas 3 usam o sistema ao mesmo tempo, você precisa de apenas 3 licenças."
    },
    {
      question: "Existe contrato de fidelidade?",
      answer: "Não exigimos contratos de longo prazo. Você pode cancelar a qualquer momento com 30 dias de antecedência."
    },
    {
      question: "A migração dos dados é gratuita?",
      answer: "Sim! Nossa equipe migra todos os seus dados de outros sistemas gratuitamente, independente do plano escolhido."
    },
    {
      question: "O suporte técnico está incluído?",
      answer: "Sim! Todos os planos incluem suporte técnico. O Essencial tem suporte por email, Profissional inclui telefone, e Enterprise tem suporte 24/7."
    }
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
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Escolha o melhor plano para sua clínica
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Pague mensalmente ou anualmente, adicione recursos conforme cresce, e pague apenas pelo número máximo de usuários acessando o sistema simultaneamente.
          </p>
          
          <div className="flex justify-center items-center space-x-4 mb-12">
            <span className="text-sm text-slate-500">Pague anualmente</span>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
              Economize 10%
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                  plan.highlighted 
                    ? 'border-orange-500 scale-105' 
                    : 'border-slate-200'
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
                    {plan.badge}
                  </Badge>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{plan.subtitle}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                    {plan.period && <span className="text-slate-600">{plan.period}</span>}
                  </div>
                  
                  {plan.additionalInfo && (
                    <p className="text-sm text-slate-500">{plan.additionalInfo}</p>
                  )}
                </div>

                <Button 
                  className={`w-full mb-6 ${
                    plan.highlighted 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  onClick={() => navigate('/nova-clinica')}
                >
                  {plan.buttonText}
                </Button>

                <div className="space-y-3">
                  <p className="font-semibold text-slate-800 text-sm">Inclui:</p>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Recursos que fazem a diferença
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <feature.icon className="h-10 w-10 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para revolucionar sua clínica?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 500 clínicas que já transformaram sua gestão com Inovai ProMed
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/nova-clinica')}
            className="bg-white text-orange-600 hover:bg-slate-100 px-8 py-4 text-lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            Começar Teste Gratuito de 30 Dias
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;