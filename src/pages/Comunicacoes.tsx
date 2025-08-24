import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Users, 
  Bell, 
  Megaphone,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Zap,
  Target,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Comunicacoes = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Mail,
      title: "Email Marketing Automatizado",
      description: "Automatize campanhas de reengajamento para conexões duradouras",
      isPremium: false
    },
    {
      icon: MessageSquare,
      title: "Mensagens no App",
      description: "Canais de comunicação rápidos e seguros com colegas e pacientes",
      isPremium: true
    },
    {
      icon: Phone,
      title: "SMS Bidirecional",
      description: "Mensagens 1:1 ou em massa para engajamento personalizado",
      isPremium: true
    },
    {
      icon: Target,
      title: "Segmentação de Pacientes",
      description: "Campanhas direcionadas para faltas, aniversários e mais",
      isPremium: true
    }
  ];

  const communicationTypes = [
    {
      icon: Bell,
      title: "Lembretes Automáticos",
      description: "Reduza faltas com lembretes por SMS e email",
      benefits: [
        "Lembretes de consulta automáticos",
        "Confirmação de agendamento",
        "Notificações de mudança de horário",
        "Lembretes de pagamento"
      ]
    },
    {
      icon: Megaphone,
      title: "Campanhas de Marketing",
      description: "Mantenha pacientes engajados com sua clínica",
      benefits: [
        "Newsletters mensais",
        "Promoções de serviços",
        "Dicas de saúde personalizadas",
        "Campanhas de aniversário"
      ]
    },
    {
      icon: Users,
      title: "Comunicação Interna",
      description: "Melhore a comunicação da equipe",
      benefits: [
        "Chat interno da equipe",
        "Notificações de emergência",
        "Atualizações de protocolo",
        "Compartilhamento de recursos"
      ]
    }
  ];

  const customizationOptions = [
    "Templates de email personalizados",
    "Design com sua marca e cores",
    "Assinatura profissional automática",
    "Logos e imagens personalizadas",
    "Tons de voz adaptados à clínica",
    "Horários de envio otimizados"
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
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Recurso Premium
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Comunicação{' '}
                  <span className="text-purple-600">inteligente</span>{' '}
                  com pacientes
                </h1>
                <p className="text-xl text-slate-600 max-w-lg">
                  Comunique-se com sua equipe e pacientes diretamente no seu software EMR. Automatize campanhas e construa relacionamentos duradouros.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/nova-clinica')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
                >
                  Começar Agora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  Ver Demonstração
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/650890c55e22b67a3863d15d_Disciplines-Communications.webp"
                alt="Interface de comunicação Inovai ProMed"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Ferramentas completas de comunicação
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Tudo que você precisa para se comunicar eficientemente com pacientes e equipe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow relative">
                {feature.isPremium && (
                  <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-800 border-purple-200 text-xs">
                    Premium
                  </Badge>
                )}
                <CardContent className="space-y-4">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Communication Types Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Tipos de comunicação disponíveis
            </h2>
            <p className="text-xl text-slate-600">
              Escolha o canal ideal para cada tipo de mensagem
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {communicationTypes.map((type, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <type.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{type.title}</h3>
                      <p className="text-slate-600">{type.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {type.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Palette className="h-8 w-8 text-purple-600" />
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                    Design personalizado
                  </h2>
                </div>
                <p className="text-xl text-slate-600">
                  Crie emails bonitos com sua marca para newsletters e anúncios da clínica. Mantenha consistência visual em todas as comunicações.
                </p>
              </div>

              <ul className="space-y-3">
                {customizationOptions.map((option, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{option}</span>
                  </li>
                ))}
              </ul>

              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Explorar Customização
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-8 rounded-lg text-white">
                <div className="space-y-6">
                  <div className="bg-white/20 p-4 rounded backdrop-blur-sm">
                    <Mail className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">Templates Profissionais</h3>
                    <p className="text-sm opacity-90">Designs responsivos e modernos</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded backdrop-blur-sm">
                    <Zap className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">Automação Inteligente</h3>
                    <p className="text-sm opacity-90">Campanhas que se enviam sozinhas</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded backdrop-blur-sm">
                    <Target className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">Segmentação Avançada</h3>
                    <p className="text-sm opacity-90">Mensagens certas para pessoas certas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Resultados impressionantes
            </h2>
            <p className="text-xl opacity-90">
              Clínicas que usam nossas ferramentas de comunicação relatam:
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">45%</div>
              <p className="text-lg opacity-90">Redução de faltas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">80%</div>
              <p className="text-lg opacity-90">Taxa de abertura emails</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">35%</div>
              <p className="text-lg opacity-90">Aumento retenção</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">90%</div>
              <p className="text-lg opacity-90">Taxa entrega SMS</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Transforme sua comunicação
            </h2>
            <p className="text-xl opacity-90">
              Construa relacionamentos mais fortes com pacientes através de comunicação inteligente e automatizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/nova-clinica')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
              >
                Começar Teste Gratuito
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg"
              >
                Agendar Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Comunicacoes;