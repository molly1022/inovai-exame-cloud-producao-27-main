import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Calendar, 
  FileText, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Shield, 
  Star,
  ArrowRight,
  Check,
  ChevronDown,
  X,
  Monitor,
  Smartphone,
  Tablet,
  Menu,
  Brain,
  Clock,
  Globe,
  Award,
  TrendingUp,
  Heart,
  Zap,
  Target,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const JuvonnoLanding = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("scheduling");

  // Logos das clínicas que usam Inovai ProMed
  const clinicLogos = [
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e1953bea4fe3c7af85203_JuvonnoClients-ReginaSpeech.png",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e19533858f71d20e1fd89_JuvonnoClients-OttawaPhysio.png",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e1953adfdd18ff3b6ebb6_JuvonnoClients-UofABPhysio.png",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e195157c3c1c5ec639550_JuvonnoClients-MedRehabPhysio.png",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e195157c3c13610639551_JuvonnoClients-Optimum.png",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e1950d0a1ea16a0d7b3dd_JuvonnoClients-ClearPointHealth.png",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e19518755181e7c1537d2_JuvonnoClients-AcademyMassage.png",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/638e19538255ff587d3d4bd0_JuvonnoClients-SouthGaetz.png"
  ];

  const features = [
    {
      id: "scheduling",
      title: "Agendamento",
      icon: Calendar,
      image: "https://photos.fife.usercontent.google.com/pw/AP1GczOrC7310ZSiN348RqdOUJMTgk-gHVfpf5KVbZ0RwEMquqzDnUfgjYBP=w641-h641-s-no-gm?authuser=0",
      subtitle: "Agende consultas rapidamente. E complete tarefas do dia a dia direto da agenda.",
      points: [
        "Comece a agendar consultas e muito mais, com um único clique",
        "Gerencie múltiplas agendas de clínicas em um painel único",
        "Tenha uma visão geral de todas as atividades na sua clínica",
        "Personalize a agenda de cada profissional: intervalos de tempo, pausas, códigos de cores, serviços etc.",
        "Sincronize consultas com seus calendários Google, Apple ou Outlook"
      ]
    },
    {
      id: "billing",
      title: "Faturamento",
      icon: FileText,
      image: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/650cabdae26d521193e91203_Billing-InsuranceWorkflows-Integrations.webp",
      subtitle: "Fature convênios diretamente, mantenha sua contabilidade organizada e receba mais rápido",
      points: [
        "Aceite pagamentos online facilmente com nossos processadores de cartão integrados para transações rápidas e seguras.",
        "Envie solicitações para seguradoras terceirizadas, incluindo Claim.MD & HCAI, com nossas integrações de faturamento perfeitas",
        "Execute relatórios essenciais ou crie seus próprios personalizados",
        "Verifique a cobertura de benefícios do paciente para uma consulta e acompanhe o saldo restante",
        "Gerencie fluxos de trabalho complexos de seguros",
        "Automatize lembretes de pagamento por texto e e-mail com link seguro para pacientes pagarem online",
        "Ofereça aos seus pacientes assinaturas e pacotes similares a assinaturas com faturamento automático recorrente integrado e rastreamento de uso"
      ]
    },
    {
      id: "charting",
      title: "Prontuário & EMR",
      icon: Users,
      image: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/6508b17438729c76c8d38786_EMR-PatientCharting.webp",
      subtitle: "Ferramentas de prontuário flexíveis e personalizadas—Agora com IA para economizar horas.",
      points: [
        "Registre de forma mais inteligente, não mais difícil, com IA do Inovai ProMed 🤖, ferramentas projetadas para aumentar a eficiência e economizar tempo",
        "Acesse seus registros médicos eletrônicos online e registre de qualquer lugar",
        "Personalize seus gráficos, planos de tratamento, painéis e formulários de admissão",
        "Trate pacientes virtualmente e compartilhe arquivos online",
        "Visualize suas consultas, tarefas pendentes, estatísticas e abandonos de pacientes de relance"
      ]
    },
    {
      id: "booking",
      title: "Agendamento Online",
      icon: Monitor,
      image: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/64c975833aa6057080a48084_EMR-OnlineBooking.webp",
      subtitle: "Ofereça uma experiência de agendamento online fácil e amigável ao mobile",
      points: [
        "Os pacientes podem acessar online para:",
        "Agendar e gerenciar consultas",
        "Completar formulários de admissão",
        "Visualizar, baixar e pagar faturas",
        "Acessar planos de exercícios e recursos úteis",
        "Enviar documentos",
        "Visualizar cobertura de seguro restante",
        "Enquanto isso, aproveite a liberdade de implementar sua marca e fluxos de trabalho"
      ]
    },
    {
      id: "communications",
      title: "Comunicações",
      icon: MessageSquare,
      image: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/650890c55e22b67a3863d15d_Disciplines-Communications.webp",
      subtitle: "Comunique-se com sua equipe e pacientes diretamente no seu software EMR",
      points: [
        "Marketing Automatizado por E-mail e Texto: Automatize campanhas de reengajamento para fomentar conexões duradouras e reagendamento perfeito",
        "Mensagens no App: Estabeleça canais de comunicação rápidos e seguros com colegas e pacientes",
        "Mensagens Bidirecionais: Envie mensagens para pacientes 1:1 ou envie mensagens em massa para uma abordagem personalizada de engajamento do paciente",
        "Ferramentas de Segmentação de Pacientes: Envie campanhas direcionadas para faltas, aniversários, pagamentos perdidos e muito mais",
        "Design Personalizado: Crie e-mails bonitos da sua marca para newsletters e anúncios da clínica"
      ]
    },
    {
      id: "insights",
      title: "Relatórios",
      icon: BarChart3,
      image: "https://lh3.googleusercontent.com/pw/AP1GczMGumgmDKB6rf5rQ3zwuXpneImwevbnP2P33a9a69yvyASI_cpIJaS4re3UMUc3BsQzmpAjOQ5Gq2Z2hvhaT3fWVG2S3L_CS_4sHntb8dYBgVypZeoaCK-pykwmRY3Dnz5dq6aMqoOKuq7q8Ipcq4mG=w641-h641-s-no-gm?authuser=0",
      subtitle: "Cresça seu negócio com nossas poderosas ferramentas de relatório e insights",
      points: [
        "Extraia dados ricos sobre cada aspecto do seu negócio desde retenção de pacientes e rentabilidade, até contas a receber e produtividade",
        "Acesse todos os seus dados de uma plataforma segura",
        "Personalize relatórios por locais de clínicas, equipes, produtos e serviços",
        "Visualize métricas de desempenho chave de relance"
      ]
    },
    {
      id: "telehealth",
      title: "Telemedicina",
      icon: Smartphone,
      image: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/647f8bd59ebe27afe2cb4a9b_Juvonno-Product-Telehealth.webp",
      subtitle: "Execute consultas de telemedicina seguras diretamente do Inovai ProMed",
      points: [
        "Desfrute de sessões 1:1 ilimitadas em alta definição",
        "Tenha confiança sabendo que nossa solução oferece segurança de nível empresarial e está totalmente em conformidade com LGPD",
        "Nenhum aplicativo ou instalação de terceiros necessária",
        "Use áudio e vídeo HD e compartilhamento de tela ao se encontrar com pacientes",
        "Execute sessões em todos os principais navegadores desktop e móveis",
        "Sessões em grupo - Novo!"
      ]
    }
  ];

  const testimonials = [
    {
      quote: "Experiência cinco estrelas. O recurso de mensagens de texto para pacientes é fenomenal!",
      author: "Milay, PT",
      avatar: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/66e078d92164d2bde622fad4_Karen-P.jpg"
    },
    {
      quote: "Devo dizer que amo o Inovai ProMed. É um software EMR fantástico e estou muito feliz por ter migrado para ele. O portal do paciente é excepcional!",
      author: "Dr. Karen P.",
      clinic: "Clínica de Quiropraxia e Massagem (São Paulo, SP)",
      avatar: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/66e078d92164d2bde622fad4_Karen-P.jpg"
    },
    {
      quote: "O serviço e flexibilidade do Inovai ProMed é tudo que preciso em um EMR.",
      author: "Dr. David G.",
      clinic: "Clínica de Fisioterapia Familiar (Rio de Janeiro, RJ)",
      avatar: "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/66e078d93294d10fef7fd66e_David-G.jpg"
    }
  ];

  const awards = [
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/6830d0b9bcf269bd919269a0_capterrabadge4-7.svg",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/68016bebb87b7cf6cce43e91_Get%20App-Category%20Leaders%202025.svg",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/67dc3bb212548836ed4582f5_d9bdfa8b-a944-4f79-9869-571a852bfe1f.svg",
    "https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/6807bfb31b0813659f0d9b12_Capterra-Ease%20of%20Use%202025.svg"
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Economize 80% do tempo administrativo",
      description: "Automatize tarefas repetitivas e foque no que realmente importa"
    },
    {
      icon: TrendingUp,
      title: "Aumente a receita em até 40%",
      description: "Reduza faltas e otimize a agenda com lembretes automáticos"
    },
    {
      icon: Shield,
      title: "100% seguro e em conformidade",
      description: "Certificado LGPD com criptografia de ponta e backups automáticos"
    },
    {
      icon: Globe,
      title: "Acesse de qualquer lugar",
      description: "Sistema 100% em nuvem, funciona em qualquer dispositivo"
    }
  ];

  const specialties = [
    { name: "Fisioterapia", patients: "15K+", icon: Heart },
    { name: "Psicologia", patients: "12K+", icon: Brain },
    { name: "Odontologia", patients: "8K+", icon: Zap },
    { name: "Medicina Geral", patients: "20K+", icon: Target },
    { name: "Dermatologia", patients: "6K+", icon: Star },
    { name: "Cardiologia", patients: "10K+", icon: Heart }
  ];

  const pricingPlans = [
    {
      name: "Essencial",
      price: "R$ 99",
      period: "/mês",
      description: "Perfeito para clínicas pequenas",
      features: [
        "Até 2 profissionais",
        "Agenda online",
        "Prontuário eletrônico",
        "Relatórios básicos",
        "Suporte por email"
      ],
      highlighted: false
    },
    {
      name: "Profissional",
      price: "R$ 199",
      period: "/mês",
      description: "Ideal para clínicas em crescimento",
      features: [
        "Até 10 profissionais",
        "Telemedicina integrada",
        "Faturamento de convênios",
        "Relatórios avançados",
        "Suporte prioritário",
        "Integrações ilimitadas"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "",
      description: "Para grandes clínicas e hospitais",
      features: [
        "Profissionais ilimitados",
        "API personalizada",
        "Implementação dedicada",
        "Treinamento in-loco",
        "Suporte 24/7",
        "Recursos personalizados"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold text-sm">
                INOVAI
              </div>
              <span className="font-semibold text-lg">ProMed</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-primary font-medium">Recursos</a>
              <button 
                onClick={() => navigate('/precos')} 
                className="text-muted-foreground hover:text-foreground"
              >
                Preços
              </button>
              <button 
                onClick={() => navigate('/proprietarios-clinica')} 
                className="text-muted-foreground hover:text-foreground"
              >
                Proprietários
              </button>
              <a href="#depoimentos" className="text-muted-foreground hover:text-foreground">Depoimentos</a>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <nav className="flex flex-col space-y-4 mt-8">
                    <a href="#recursos" className="text-lg font-medium">Recursos</a>
                    <button 
                      onClick={() => navigate('/precos')} 
                      className="text-lg text-left"
                    >
                      Preços
                    </button>
                    <button 
                      onClick={() => navigate('/proprietarios-clinica')} 
                      className="text-lg text-left"
                    >
                      Proprietários
                    </button>
                    <a href="#depoimentos" className="text-lg">Depoimentos</a>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/clinica-login')}
                      className="mt-4"
                    >
                      Login
                    </Button>
                    <Button 
                      onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de solicitar uma demonstração do Inovai ProMed', '_blank')}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Contato Comercial
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/clinica-login')}
              >
                Login
              </Button>
              <Button 
                onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de solicitar uma demonstração do Inovai ProMed', '_blank')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Contato Comercial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Announcement Bar */}
      <div className="bg-emerald-500 text-white py-3 px-4 text-center text-sm relative" id="announcement-bar">
        <span className="font-medium">🎉 NOTIFICAÇÃO DE Agora Disponível:</span> IA para Prontuários 🤖 e Faturamento de Convênios—Trabalhe Mais Inteligente, Seja Pago Mais Rápido! ✨
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-emerald-500 hover:bg-white/20 h-8 w-8 p-0"
          onClick={() => {
            const banner = document.getElementById('announcement-bar');
            if (banner) {
              banner.style.display = 'none';
            }
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Software clínico{' '}
                  <span className="relative">
                    pode ser
                    <span className="absolute -top-2 -right-2">
                      <span className="text-2xl">‍🩺</span>
                    </span>
                  </span>{' '}
                  <span className="text-emerald-600">flexível</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-lg">
                  Simplifique fluxos de trabalho, encante pacientes e escale sem esforço com Inovai ProMed—a solução completa de EMR e gestão clínica projetada para crescer com você.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de solicitar uma demonstração do Inovai ProMed', '_blank')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
                >
                  Agendar Demonstração
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-8 py-4 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Assistir Vídeo
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>Baseado na nuvem</span>
                <div className="flex items-center space-x-2">
                  <span>Funciona em</span>
                  <Monitor className="h-4 w-4" />
                  <Tablet className="h-4 w-4" />
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/pw/AP1GczPEX5yfSoamv6oAx8KWnVvvV26nyCUXJUSyJBOFmTpA7-geaqfNyhU9M99Vlr9MHgU7A44tvDfpmaMOGFelNGzZga-Ln8Xcnb_hVZI1XNU6pEaaowXICHTZ7BTCDmGVosSfEKY5gH3B512uGPpoJHhJ=w736-h641-s-no-gm?authuser=0"
                alt="Interface do software de gestão clínica Inovai ProMed mostrando agenda diária com consultas, informações de pacientes, estatísticas e recursos de personalização."
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Band */}
      <section className="py-8 bg-slate-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-lg text-slate-700 italic">
            "{testimonials[0].quote}" – {testimonials[0].author}
          </p>
        </div>
      </section>

      {/* Client Logos Slider */}
      <section className="py-12 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="flex animate-scroll space-x-8 items-center">
              {[...clinicLogos, ...clinicLogos].map((logo, index) => (
                <img 
                  key={index}
                  src={logo} 
                  alt="Logo de clínica" 
                  className="h-12 w-auto grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Faça sua prática crescer mais rápido com uma plataforma EMR
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Desktop TabsList */}
              <TabsList className="hidden lg:grid w-full grid-cols-7 mb-8">
                {features.map((feature) => (
                  <TabsTrigger 
                    key={feature.id} 
                    value={feature.id}
                    className="text-xs sm:text-sm"
                  >
                    {feature.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Mobile Feature Slider */}
              <div className="lg:hidden mb-8 overflow-x-auto">
                <div className="flex space-x-2 min-w-max px-4">
                  {features.map((feature) => (
                    <Button
                      key={feature.id}
                      variant={activeTab === feature.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(feature.id)}
                      className="whitespace-nowrap flex-shrink-0"
                    >
                      <feature.icon className="h-4 w-4 mr-2" />
                      {feature.title}
                    </Button>
                  ))}
                </div>
              </div>

              {features.map((feature) => (
                <TabsContent key={feature.id} value={feature.id}>
                  <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <feature.icon className="h-8 w-8 text-emerald-600" />
                        <h3 className="text-2xl font-bold text-slate-800">{feature.title}</h3>
                      </div>
                      
                      <h4 className="text-xl font-semibold text-slate-700">
                        {feature.subtitle}
                      </h4>

                      <ul className="space-y-3">
                        {feature.points.map((point, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600">{point}</span>
                          </li>
                        ))}
                      </ul>

                      <Button variant="outline" className="mt-6">
                        Explorar {feature.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <div className="relative">
                      <img 
                        src={feature.image}
                        alt={`Interface ${feature.title}`}
                        className="w-full h-auto rounded-lg shadow-xl"
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-800">
              Junte-se a milhares de profissionais de saúde que confiam no Inovai ProMed como o software de gestão clínica #1
            </h2>
            
            <div className="flex flex-wrap justify-center items-center gap-8">
              {awards.map((award, index) => (
                <img 
                  key={index}
                  src={award} 
                  alt="Prêmio" 
                  className="h-16 w-auto"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">{testimonial.author}</div>
                    {testimonial.clinic && (
                      <div className="text-sm text-slate-600">{testimonial.clinic}</div>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Pronto para transformar sua clínica?
            </h2>
            <p className="text-xl opacity-90">
              Descubra como o Inovai ProMed pode revolucionar sua prática médica. 
              Agende uma demonstração gratuita hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de solicitar uma demonstração do Inovai ProMed', '_blank')}
                className="bg-white text-emerald-600 hover:bg-slate-100 px-8 py-4 text-lg"
              >
                Contato Comercial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/clinica-login')}
                className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-emerald-600 text-white px-2 py-1 rounded font-bold text-sm">
                  INOVAI
                </div>
                <span className="font-semibold text-lg">ProMed</span>
              </div>
              <p className="text-slate-400">
                A solução completa para gestão clínica moderna e eficiente.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Suporte</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos</a></li>
                <li><a href="#" className="hover:text-white">LGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Inovai ProMed. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <h3 className="text-lg font-semibold">Demonstração do Inovai ProMed</h3>
          </DialogHeader>
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ScMzIvxBSi4"
              title="Demonstração Inovai ProMed"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default JuvonnoLanding;