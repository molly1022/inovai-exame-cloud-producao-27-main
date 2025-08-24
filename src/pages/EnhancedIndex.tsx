import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Users,
  Calendar,
  FileSearch,
  Building2,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Star,
  Zap,
  HelpCircle,
  BarChart,
  Heart,
  Pill,
  Brain,
  MonitorSpeaker,
  Database,
  Activity,
  Globe,
  Smartphone,
  Lock,
  UserCheck,
  Settings,
  PieChart,
  FileText,
  Mail,
  Phone,
  MapPin,
  Camera,
  Mic,
  Video,
  Headphones,
  Wifi,
  Server,
  CloudUpload,
  Download,
  Upload,
  Share2,
  Printer,
  Scan,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EnhancedIndex = () => {
  const navigate = useNavigate();

  // Expanded features with 25+ cards
  const mainFeatures = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Gestão Completa de Pacientes",
      description: "Prontuários digitais, histórico médico e dados centralizados para um atendimento mais eficiente e personalizado.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Agenda Inteligente e Flexível",
      description: "Agendamento online, confirmações por e-mail e SMS, e otimização de horários para reduzir faltas.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <FileSearch className="h-8 w-8 text-purple-600" />,
      title: "Central de Exames e Laudos",
      description: "Organização automática de laudos, categorização inteligente e acesso instantâneo para médicos e pacientes.",
      gradient: "from-purple-500 to-violet-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Relatórios Financeiros Detalhados",
      description: "Dashboard completo com métricas de faturamento, inadimplência e análises detalhadas para decisões estratégicas.",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: <Brain className="h-8 w-8 text-pink-600" />,
      title: "Inteligência Artificial Integrada",
      description: "IA para sugestões de diagnóstico, análise de padrões e otimização de processos clínicos.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: <MonitorSpeaker className="h-8 w-8 text-indigo-600" />,
      title: "Telemedicina Avançada",
      description: "Consultas virtuais com qualidade profissional, gravação de sessões e prontuário integrado.",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Database className="h-8 w-8 text-emerald-600" />,
      title: "Backup Automático em Nuvem",
      description: "Seus dados sempre seguros com backup automático, criptografia e redundância geográfica.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Activity className="h-8 w-8 text-red-600" />,
      title: "Monitoramento em Tempo Real",
      description: "Acompanhe métricas da clínica, desempenho da equipe e satisfação dos pacientes instantaneamente.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <Globe className="h-8 w-8 text-cyan-600" />,
      title: "Portal do Paciente Online",
      description: "Área exclusiva para pacientes visualizarem exames, agendamentos e histórico médico.",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-violet-600" />,
      title: "App Mobile Nativo",
      description: "Aplicativo completo para médicos e pacientes com todas as funcionalidades.",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: <Lock className="h-8 w-8 text-slate-600" />,
      title: "Segurança LGPD Compliance",
      description: "Total conformidade com LGPD, criptografia de ponta e controles de acesso rigorosos.",
      gradient: "from-slate-500 to-gray-500"
    },
    {
      icon: <UserCheck className="h-8 w-8 text-lime-600" />,
      title: "Gestão de Funcionários",
      description: "Controle de acesso, logs de atividade e gestão completa da equipe médica.",
      gradient: "from-lime-500 to-green-500"
    },
    {
      icon: <Settings className="h-8 w-8 text-amber-600" />,
      title: "Configurações Avançadas",
      description: "Personalize workflows, automações e integre com seus sistemas existentes.",
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      icon: <PieChart className="h-8 w-8 text-fuchsia-600" />,
      title: "Analytics Inteligente",
      description: "Dashboards interativos com insights sobre tendências e oportunidades de crescimento.",
      gradient: "from-fuchsia-500 to-pink-500"
    },
    {
      icon: <FileText className="h-8 w-8 text-sky-600" />,
      title: "Receituário Digital",
      description: "Prescrições digitais com validação, histórico completo e envio direto para farmácias.",
      gradient: "from-sky-500 to-cyan-500"
    },
    {
      icon: <Mail className="h-8 w-8 text-rose-600" />,
      title: "Comunicação Automatizada",
      description: "E-mails e SMS automáticos para lembretes, confirmações e seguimento pós-consulta.",
      gradient: "from-rose-500 to-red-500"
    },
    {
      icon: <Phone className="h-8 w-8 text-teal-600" />,
      title: "Central de Atendimento",
      description: "Sistema integrado de telefonia com gravação de chamadas e CRM completo.",
      gradient: "from-teal-500 to-emerald-500"
    },
    {
      icon: <MapPin className="h-8 w-8 text-orange-600" />,
      title: "Múltiplas Unidades",
      description: "Gerencie várias clínicas simultaneamente com controle centralizado.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Camera className="h-8 w-8 text-purple-600" />,
      title: "Captura de Imagens",
      description: "Integração com equipamentos médicos para captura automática de imagens e exames.",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: <Video className="h-8 w-8 text-blue-600" />,
      title: "Videoconferência HD",
      description: "Reuniões médicas em alta definição com compartilhamento de tela e gravação.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: <Server className="h-8 w-8 text-green-600" />,
      title: "Infraestrutura Robusta",
      description: "Servidores dedicados com 99.9% de uptime e suporte 24/7 especializado.",
      gradient: "from-green-500 to-blue-500"
    },
    {
      icon: <CloudUpload className="h-8 w-8 text-cyan-600" />,
      title: "Sincronização em Nuvem",
      description: "Dados sincronizados em tempo real entre todos os dispositivos e localizações.",
      gradient: "from-cyan-500 to-purple-500"
    },
    {
      icon: <Share2 className="h-8 w-8 text-indigo-600" />,
      title: "Compartilhamento Seguro",
      description: "Compartilhe laudos e exames com outros profissionais de forma segura e controlada.",
      gradient: "from-indigo-500 to-cyan-500"
    },
    {
      icon: <Printer className="h-8 w-8 text-slate-600" />,
      title: "Impressão Profissional",
      description: "Templates personalizados para receitas, laudos e relatórios com marca da clínica.",
      gradient: "from-slate-500 to-indigo-500"
    }
  ];

  const benefits = [
    {
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      title: "Economize 70% do tempo",
      description: "com automação de processos manuais e repetitivos.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "100% Seguro e Confiável",
      description: "Dados protegidos com criptografia de ponta e backups automáticos.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Implementação Rápida",
      description: "Sua clínica pronta para usar o sistema em menos de 24 horas.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: <BarChart className="h-8 w-8 text-red-500" />,
      title: "Aumente seu Faturamento",
      description: "Reduza faltas e otimize a agenda para maximizar seus lucros.",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Solicite sua Demonstração",
      description: "Preencha nosso formulário rápido e um de nossos especialistas entrará em contato.",
      icon: <Mail className="h-6 w-6" />
    },
    {
      number: "02",
      title: "Configuração Personalizada",
      description: "Adaptamos o sistema às necessidades e fluxos de trabalho específicos da sua clínica.",
      icon: <Settings className="h-6 w-6" />
    },
    {
      number: "03",
      title: "Treinamento da Equipe",
      description: "Capacitamos toda a sua equipe para que aproveitem ao máximo todas as funcionalidades.",
      icon: <Users className="h-6 w-6" />
    },
    {
      number: "04",
      title: "Suporte Contínuo e Humanizado",
      description: "Oferecemos acompanhamento e suporte técnico especializado sempre que você precisar.",
      icon: <Headphones className="h-6 w-6" />
    }
  ];

  const testimonials = [
    {
      name: "Dr. Ana Silva",
      clinic: "Clínica São Lucas",
      quote: "\"O Unovai Exame Cloud transformou a gestão da nossa clínica. Reduzimos o tempo administrativo em mais de 80% e agora podemos focar totalmente no atendimento ao paciente.\"",
      image: "/api/placeholder/64/64"
    },
    {
      name: "Dr. Carlos Mendes",
      clinic: "Policlínica Central",
      quote: "\"É um sistema intuitivo e extremamente completo. A implementação foi rápida e o suporte é excepcional, sempre pronto para ajudar. Recomendo fortemente.\"",
      image: "/api/placeholder/64/64"
    },
    {
      name: "Dra. Maria Costa",
      clinic: "Clínica Vida e Saúde",
      quote: "\"Com a organização dos agendamentos e a redução de faltas, conseguimos aumentar nossa receita em 40% em apenas seis meses. Foi um divisor de águas!\"",
      image: "/api/placeholder/64/64"
    }
  ];

  const faqItems = [
    {
      question: "Meus dados estão seguros na plataforma?",
      answer: "Sim, a segurança é nossa maior prioridade. Utilizamos criptografia de ponta, servidores seguros e realizamos backups automáticos diários para garantir a integridade e a confidencialidade dos seus dados, em total conformidade com a LGPD."
    },
    {
      question: "É difícil migrar meus dados atuais para o sistema?",
      answer: "Não. Nossa equipe de especialistas cuidará de todo o processo de migração para você, garantindo uma transição suave e sem perda de informações, seja de planilhas ou de outro sistema."
    },
    {
      question: "Preciso instalar algum programa no meu computador?",
      answer: "Não é necessário. O Unovai Exame Cloud é um sistema 100% em nuvem. Você pode acessá-lo de qualquer dispositivo com internet (computador, tablet ou celular) a qualquer hora e em qualquer lugar."
    },
    {
      question: "Existe algum contrato de fidelidade?",
      answer: "Não. Acreditamos na qualidade do nosso serviço. Oferecemos planos flexíveis, incluindo opções mensais sem fidelidade, para que você tenha total liberdade de escolha."
    }
  ];

  return (

    
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Unovai Exame Cloud
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/nova-clinica')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                Experimentar 30 Dias Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate('/clinica-login')}
                variant="outline"
                size="lg"
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
              >
                Login da Clínica
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto container px-4">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-full px-6 py-3 text-sm">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-purple-300">Sistema #1 em Gestão Clínica</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-bold leading-tight">
              Revolucione a 
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent block"> Gestão </span>
              da sua Clínica
            </h2>
            
            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-4xl mx-auto">
              Plataforma completa que digitaliza e otimiza todos os processos da sua clínica. 
              Mais eficiência, menos burocracia, e mais tempo para o que realmente importa: seus pacientes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={() => navigate('/nova-clinica')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-lg h-auto border-0 shadow-2xl shadow-purple-500/25"
              >
                <Zap className="mr-3 h-6 w-6" />
                Começar Demonstração Gratuita
              </Button>
              <Button
                onClick={() => navigate('/admin-access')}
                variant="outline"
                size="lg"
                className="px-12 py-6 text-lg h-auto border-purple-400 text-purple-400 hover:bg-purple-400/10"
              >
                <Shield className="mr-3 h-6 w-6" />
                Acesso Administrativo
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">500+</div>
                <div className="text-sm text-slate-400">Clínicas Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">99.9%</div>
                <div className="text-sm text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">24/7</div>
                <div className="text-sm text-slate-400">Suporte</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">LGPD</div>
                <div className="text-sm text-slate-400">Compliance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold mb-6">Vantagens que Vão Além do Software</h3>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Nosso sistema foi desenhado para gerar resultados reais e mensuráveis para a sua clínica.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-black/20 backdrop-blur p-8 rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 text-center group hover:transform hover:scale-105"
              >
                <div className={`mb-6 inline-block ${benefit.bgColor} p-4 rounded-full group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                <h4 className="text-2xl font-semibold mb-3">{benefit.title}</h4>
                <p className="text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Grid - 24 Cards */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold mb-6">
              Funcionalidades Completas para sua Clínica
            </h3>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Mais de 24 módulos integrados para transformar completamente a gestão da sua clínica médica.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${feature.gradient} p-1 rounded-2xl group hover:transform hover:scale-105 transition-all duration-300`}
              >
                <div className="bg-black/80 backdrop-blur p-6 rounded-2xl h-full">
                  <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold mb-3 text-white">{feature.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold mb-6">
              Comece a Usar em 4 Passos Simples
            </h3>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Um processo rápido e transparente para digitalizar sua clínica sem complicações.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <div className="bg-black/20 backdrop-blur p-6 rounded-2xl border border-white/10 group-hover:border-purple-400/50 transition-all duration-300">
                  <div className="text-purple-400 mb-3 flex justify-center">
                    {step.icon}
                  </div>
                  <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-5xl font-bold mb-16">
            Clínicas que Confiam e Aprovam Nossa Solução
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-black/20 backdrop-blur p-8 rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 group hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-1 justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic text-lg">{testimonial.quote}</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-purple-400">{testimonial.clinic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold mb-6">Perguntas Frequentes</h3>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Tiramos suas principais dúvidas para que você tome a melhor decisão para sua clínica.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-black/20 backdrop-blur border border-white/10 rounded-2xl px-6 data-[state=open]:border-purple-400/50"
                >
                  <AccordionTrigger className="text-lg font-semibold text-left hover:text-purple-400 transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-slate-300 leading-relaxed pb-6">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-6xl font-bold mb-8">
              Pronto para Modernizar sua Clínica?
            </h3>
            <p className="text-xl opacity-90 mb-12 leading-relaxed">
              Junte-se a centenas de clínicas que já transformaram sua gestão.
              Teste grátis por 30 dias, sem compromisso e sem necessidade de cartão de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={() => navigate('/nova-clinica')}
                size="lg"
                className="bg-white hover:bg-gray-100 text-purple-600 px-16 py-8 text-xl h-auto font-bold shadow-2xl"
              >
                <Zap className="mr-3 h-6 w-6" />
                Quero Minha Demonstração Gratuita
              </Button>
              <Button
                onClick={() => navigate('/clinica-login')}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 px-12 py-8 text-xl h-auto"
              >
                Já sou cliente
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Unovai Exame Cloud
              </span>
            </div>
            <nav className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-purple-400 transition-colors">Início</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Funcionalidades</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Preços</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Contato</a>
              <a href="/admin-access" className="hover:text-purple-400 transition-colors">Admin</a>
            </nav>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Unovai Exame Cloud. Transformando a gestão de clínicas no Brasil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedIndex;