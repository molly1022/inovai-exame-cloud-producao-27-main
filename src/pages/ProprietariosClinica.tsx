import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Star, 
  ArrowRight, 
  Check, 
  Building2, 
  Heart, 
  Shield, 
  Clock,
  TrendingUp,
  Globe,
  Zap,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';

const ProprietariosClinica = () => {
  const navigate = useNavigate();

  const ownerBenefits = [
    {
      icon: TrendingUp,
      title: "Aumente sua receita em até 40%",
      description: "Reduza faltas com lembretes automáticos e otimize sua agenda para maximizar o faturamento"
    },
    {
      icon: Clock,
      title: "Economize 80% do tempo administrativo",
      description: "Automatize tarefas repetitivas e foque no crescimento do seu negócio"
    },
    {
      icon: Shield,
      title: "Total conformidade com LGPD",
      description: "Mantenha os dados dos seus pacientes seguros e em conformidade com a legislação"
    },
    {
      icon: Globe,
      title: "Expanda sem limites",
      description: "Gerencie múltiplas unidades de forma centralizada com escalabilidade total"
    }
  ];

  const successStories = [
    {
      name: "Dr. Ricardo Santos",
      specialty: "Proprietário - Clínica Vida Plena",
      location: "São Paulo, SP",
      quote: "Em 6 meses, nossa receita aumentou 45% e reduzimos custos administrativos drasticamente. O ROI foi imediato.",
      metrics: {
        revenue: "+45%",
        efficiency: "+80%",
        patients: "+300"
      },
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Dra. Maria Oliveira",
      specialty: "Proprietária - Centro Médico Saúde Total",
      location: "Rio de Janeiro, RJ",
      quote: "O sistema transformou nossa operação. Conseguimos abrir uma segunda unidade com a eficiência que o Inovai ProMed proporcionou.",
      metrics: {
        units: "2 unidades",
        team: "15 profissionais",
        growth: "+120%"
      },
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Dr. João Pereira",
      specialty: "Proprietário - Grupo Médico Excellence",
      location: "Belo Horizonte, MG",
      quote: "A inteligência artificial para prontuários economizou horas de trabalho da equipe. Nossos médicos ficaram muito mais satisfeitos.",
      metrics: {
        satisfaction: "+95%",
        time: "-70%",
        accuracy: "+99%"
      },
      avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const features = [
    {
      title: "Gestão Centralizada",
      description: "Controle total de múltiplas unidades em um só lugar",
      icon: Building2
    },
    {
      title: "Relatórios Executivos",
      description: "KPIs e métricas em tempo real para decisões estratégicas",
      icon: Target
    },
    {
      title: "Equipe Otimizada",
      description: "Ferramentas para maximizar a produtividade dos profissionais",
      icon: Users
    },
    {
      title: "Experiência do Paciente",
      description: "Portal exclusivo e comunicação automatizada",
      icon: Heart
    },
    {
      title: "Tecnologia de Ponta",
      description: "IA integrada e automações inteligentes",
      icon: Zap
    },
    {
      title: "Suporte Premium",
      description: "Atendimento especializado para proprietários",
      icon: Award
    }
  ];

  const pricing = [
    {
      plan: "Starter",
      description: "Para clínicas em início de expansão",
      price: "R$ 299",
      period: "/mês",
      features: [
        "Até 3 unidades",
        "Dashboard executivo",
        "Relatórios avançados",
        "Suporte prioritário",
        "Treinamento da equipe"
      ]
    },
    {
      plan: "Growth",
      description: "Para grupos médicos em crescimento",
      price: "R$ 599",
      period: "/mês",
      features: [
        "Até 10 unidades",
        "IA para prontuários",
        "API personalizada",
        "Gerente de conta dedicado",
        "SLA garantido 99.9%"
      ],
      popular: true
    },
    {
      plan: "Enterprise",
      description: "Para grandes redes de saúde",
      price: "Personalizado",
      period: "",
      features: [
        "Unidades ilimitadas",
        "Recursos personalizados",
        "Implementação dedicada",
        "Suporte 24/7",
        "Conformidade avançada"
      ]
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
                Solicitar Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4 mr-2" />
              Solução #1 para Proprietários de Clínicas
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              Escale sua clínica com
              <span className="text-blue-600 block">inteligência e eficiência</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              A plataforma completa para proprietários que querem expandir seus negócios 
              na área da saúde com tecnologia de ponta e resultados mensuráveis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={() => navigate('/nova-clinica')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Agendar Demonstração Executiva
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Ver Cases de Sucesso
              </Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-slate-600">Clínicas Ativas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">40%</div>
                <div className="text-sm text-slate-600">Aumento Médio de Receita</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">80%</div>
                <div className="text-sm text-slate-600">Redução de Tempo Admin</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">99.9%</div>
                <div className="text-sm text-slate-600">Uptime Garantido</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Por que proprietários escolhem Inovai ProMed?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Resultados comprovados para quem quer transformar sua clínica em um negócio escalável e lucrativo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {ownerBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Cases de Sucesso Reais
            </h2>
            <p className="text-xl text-slate-600">
              Proprietários que transformaram suas clínicas com Inovai ProMed
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <img 
                    src={story.avatar} 
                    alt={story.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">{story.name}</div>
                    <div className="text-sm text-slate-600">{story.specialty}</div>
                    <div className="text-sm text-slate-500">{story.location}</div>
                  </div>
                </div>
                
                <p className="text-slate-600 italic mb-6">"{story.quote}"</p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  {Object.entries(story.metrics).map(([key, value]) => (
                    <div key={key}>
                      <div className="font-bold text-blue-600">{value}</div>
                      <div className="text-xs text-slate-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Recursos Exclusivos para Proprietários
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
                <Button variant="ghost" className="mt-4 p-0">
                  Saiba mais <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing for Owners */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Planos para Proprietários Visionários
            </h2>
            <p className="text-xl text-slate-600">
              Investimentos que se pagam rapidamente com o aumento da eficiência
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'border-2 border-blue-500 scale-105' : 'border border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-lg mb-6 text-sm font-medium">
                    Mais Escolhido
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.plan}</h3>
                <p className="text-slate-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                  {plan.period && <span className="text-slate-600">{plan.period}</span>}
                </div>

                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  onClick={() => navigate('/nova-clinica')}
                >
                  Solicitar Demonstração
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para escalar sua clínica?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Junte-se a centenas de proprietários que já transformaram seus negócios 
            e multiplicaram seus resultados com Inovai ProMed.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/nova-clinica')}
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg"
          >
            <Star className="mr-2 h-5 w-5" />
            Agendar Demonstração Executiva Gratuita
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProprietariosClinica;