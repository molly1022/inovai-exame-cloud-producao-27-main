import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Smartphone,
  Bell,
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const AgendamentoPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Agenda Visual Intuitiva",
      description: "Interface drag-and-drop que simplifica o agendamento diário"
    },
    {
      icon: Clock,
      title: "Horários Flexíveis",
      description: "Configure intervalos personalizados para cada profissional"
    },
    {
      icon: Bell,
      title: "Lembretes Automáticos",
      description: "SMS e email automáticos reduzem faltas em até 60%"
    },
    {
      icon: Users,
      title: "Múltiplos Profissionais",
      description: "Gerencie agendas de toda sua equipe em uma tela"
    },
    {
      icon: Smartphone,
      title: "Agendamento Online",
      description: "Pacientes agendam 24/7 pelo portal web ou app móvel"
    },
    {
      icon: MessageSquare,
      title: "Confirmações Automáticas",
      description: "Sistema confirma automaticamente por WhatsApp e SMS"
    }
  ];

  const benefits = [
    {
      stat: "60%",
      description: "Redução de faltas com lembretes automáticos"
    },
    {
      stat: "3x",
      description: "Mais agendamentos com portal online"
    },
    {
      stat: "80%",
      description: "Menos tempo gasto com reagendamentos"
    },
    {
      stat: "24/7",
      description: "Disponibilidade para agendamentos online"
    }
  ];

  const testimonials = [
    {
      quote: "Nossa taxa de faltas caiu drasticamente depois que implementamos os lembretes automáticos do Inovai ProMed.",
      author: "Dr. Carlos Silva",
      clinic: "Clínica Especializada São Paulo",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face"
    },
    {
      quote: "O agendamento online transformou nossa operação. Pacientes adoram a praticidade de agendar pelo celular.",
      author: "Dra. Ana Santos",
      clinic: "Centro Médico Rio de Janeiro",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face"
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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-2" />
                  Sistema de Agendamento #1
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-slate-800 leading-tight">
                  Agendamento que
                  <span className="text-blue-600 block">funciona para você</span>
                </h1>
                
                <p className="text-xl text-slate-600 max-w-lg">
                  Reduza faltas, otimize sua agenda e permita que pacientes agendem online 24/7. 
                  O sistema de agendamento mais completo do mercado.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/nova-clinica')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
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
                    <div className="text-2xl font-bold text-blue-600">{benefit.stat}</div>
                    <div className="text-sm text-slate-600">{benefit.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/64de27eeb22bbffa75ab208f_Scheduling-TeamWorkflow-GoogleCal.webp"
                alt="Sistema de Agendamento Inovai ProMed"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                  <div>
                    <div className="font-semibold text-slate-800">Taxa de Ocupação</div>
                    <div className="text-emerald-600 font-bold">+85%</div>
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
              Recursos que transformam sua agenda
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Tudo que você precisa para ter uma agenda otimizada e pacientes mais satisfeitos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Como funciona na prática
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Paciente Agenda</h3>
                <p className="text-slate-600">
                  Online pelo portal, app ou telefone. Vê horários disponíveis em tempo real.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Sistema Confirma</h3>
                <p className="text-slate-600">
                  Confirmação automática por SMS/WhatsApp e lembretes antes da consulta.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Consulta Acontece</h3>
                <p className="text-slate-600">
                  Check-in automático, prontuário atualizado e próxima consulta já agendada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              O que dizem nossos clientes
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para otimizar sua agenda?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Junte-se a milhares de profissionais que já reduziram faltas e aumentaram 
            a satisfação dos pacientes com nosso sistema de agendamento.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/nova-clinica')}
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Começar Agora - 30 Dias Grátis
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AgendamentoPage;