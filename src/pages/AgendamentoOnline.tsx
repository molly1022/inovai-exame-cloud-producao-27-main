import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Smartphone, 
  Globe, 
  CreditCard, 
  FileText, 
  Shield,
  CheckCircle,
  ArrowRight,
  Monitor,
  Tablet,
  Users,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AgendamentoOnline = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Agendamento 24/7",
      description: "Pacientes podem agendar consultas a qualquer hora, de qualquer lugar"
    },
    {
      icon: FileText,
      title: "Formulários Online",
      description: "Complete formulários de admissão antes da consulta"
    },
    {
      icon: CreditCard,
      title: "Pagamentos Online",
      description: "Visualize, baixe e pague faturas diretamente online"
    },
    {
      icon: Shield,
      title: "Portal Seguro",
      description: "Acesso seguro a recursos úteis e planos de exercícios"
    }
  ];

  const patientFeatures = [
    "Agendar e gerenciar consultas",
    "Completar formulários de admissão",
    "Visualizar, baixar e pagar faturas",
    "Acessar planos de exercícios e recursos",
    "Enviar documentos com segurança",
    "Visualizar cobertura de convênio restante",
    "Receber lembretes automáticos",
    "Histórico completo de consultas"
  ];

  const clinicBenefits = [
    {
      icon: Globe,
      title: "Sua Marca, Sua Identidade",
      description: "Portal totalmente personalizado com suas cores e logotipo"
    },
    {
      icon: Bell,
      title: "Lembretes Automáticos",
      description: "Reduza faltas com notificações por SMS e email"
    },
    {
      icon: Monitor,
      title: "Multiplataforma",
      description: "Funciona perfeitamente em qualquer dispositivo"
    },
    {
      icon: Users,
      title: "Experiência do Paciente",
      description: "Interface intuitiva que seus pacientes vão adorar"
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
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Agendamento online{' '}
                  <span className="text-green-600">simples</span> e{' '}
                  <span className="text-green-600">eficiente</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-lg">
                  Ofereça uma experiência de agendamento online fácil e amigável ao mobile para seus pacientes.
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

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>Disponível em</span>
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <Tablet className="h-4 w-4" />
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/64c975833aa6057080a48084_EMR-OnlineBooking.webp"
                alt="Interface de agendamento online Inovai ProMed"
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
              Tudo que seus pacientes precisam em um portal
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Os pacientes podem acessar online para gerenciar completamente seus cuidados de saúde
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                  Os pacientes podem acessar online para:
                </h2>
                <p className="text-xl text-slate-600">
                  Um portal completo que coloca o controle nas mãos dos seus pacientes, enquanto você aproveita a liberdade de implementar sua marca e fluxos de trabalho.
                </p>
              </div>

              <ul className="space-y-3">
                {patientFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Explorar Portal do Paciente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-green-400 to-green-600 p-8 rounded-lg text-white">
                <div className="space-y-6">
                  <div className="bg-white/20 p-4 rounded backdrop-blur-sm">
                    <Calendar className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">Agendamento Inteligente</h3>
                    <p className="text-sm opacity-90">Interface intuitiva para marcar consultas</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded backdrop-blur-sm">
                    <FileText className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">Formulários Digitais</h3>
                    <p className="text-sm opacity-90">Preenchimento rápido e seguro</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded backdrop-blur-sm">
                    <CreditCard className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">Pagamentos Online</h3>
                    <p className="text-sm opacity-90">Transações seguras e instantâneas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Benefícios para sua clínica
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Reduza a carga administrativa e melhore a experiência do paciente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {clinicBenefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <benefit.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Resultados comprovados
            </h2>
            <p className="text-xl opacity-90">
              Clínicas que usam nosso agendamento online relatam:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">40%</div>
              <p className="text-lg opacity-90">Redução de faltas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">60%</div>
              <p className="text-lg opacity-90">Menos ligações telefônicas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">25%</div>
              <p className="text-lg opacity-90">Aumento na satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Modernize seu agendamento hoje
            </h2>
            <p className="text-xl opacity-90">
              Ofereça a conveniência que seus pacientes esperam e otimize sua operação.
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

export default AgendamentoOnline;