import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Target, 
  Users, 
  Award, 
  Building, 
  Globe,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SobreNos = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Cuidado em Primeiro Lugar",
      description: "Desenvolvemos tecnologia que permite aos profissionais focar no que realmente importa: o cuidado com o paciente."
    },
    {
      icon: Zap,
      title: "Inovação Constante",
      description: "Estamos sempre à frente, incorporando as mais recentes tecnologias, incluindo IA, para revolucionar a medicina."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Proteção máxima de dados com criptografia de ponta e conformidade total com LGPD e padrões internacionais."
    },
    {
      icon: Users,
      title: "Comunidade Forte",
      description: "Construímos uma comunidade de profissionais da saúde que se apoiam mutuamente para crescer juntos."
    }
  ];

  const stats = [
    { number: "50K+", label: "Profissionais de Saúde", icon: Users },
    { number: "300+", label: "Clínicas Ativas", icon: Building },
    { number: "1M+", label: "Consultas Realizadas", icon: Heart },
    { number: "99.9%", label: "Disponibilidade", icon: TrendingUp }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Fundação",
      description: "Nascemos com a missão de digitalizar e modernizar o atendimento médico no Brasil."
    },
    {
      year: "2021",
      title: "Primeira Clínica",
      description: "Implementamos nosso sistema na primeira clínica parceira em São Paulo."
    },
    {
      year: "2022",
      title: "Expansão Nacional",
      description: "Expandimos para mais de 100 clínicas em todo o território nacional."
    },
    {
      year: "2023",
      title: "IA Integrada",
      description: "Lançamos nossa revolucionária IA para documentação médica automática."
    },
    {
      year: "2024",
      title: "Telemedicina Avançada",
      description: "Introduzimos sessões em grupo e recursos avançados de telemedicina."
    }
  ];

  const team = [
    {
      name: "Dr. Carlos Silva",
      role: "CEO & Fundador",
      description: "Médico cardiologista com 15 anos de experiência em tecnologia médica.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Ana Rodrigues",
      role: "CTO",
      description: "Engenheira de software especializada em sistemas de saúde e IA.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b008?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Dr. João Santos",
      role: "Diretor Médico",
      description: "Especialista em gestão clínica e implementação de EMR.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Maria Costa",
      role: "Diretora de Produto",
      description: "Expert em UX/UI para sistemas médicos e experiência do usuário.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face"
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
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight">
              Transformando o futuro da{' '}
              <span className="text-blue-600">medicina digital</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Somos uma empresa brasileira dedicada a revolucionar o atendimento médico através de tecnologia inovadora, 
              inteligência artificial e design centrado no usuário.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/nova-clinica')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
              >
                Conheça Nossa Solução
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Falar com Nossa Equipe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800">{stat.number}</div>
                  <p className="text-slate-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                  Nossa Missão
                </h2>
                <p className="text-xl text-slate-600">
                  Democratizar o acesso à tecnologia médica de ponta, permitindo que profissionais da saúde de todos os tamanhos 
                  ofereçam cuidados excepcionais aos seus pacientes.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Visão</h3>
                    <p className="text-slate-600">Ser a plataforma líder em gestão clínica na América Latina até 2030.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Compromisso</h3>
                    <p className="text-slate-600">Desenvolver soluções que realmente fazem a diferença na vida dos profissionais e pacientes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop"
                alt="Equipe médica colaborando"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Nossos Valores
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Os princípios que guiam cada decisão e desenvolvimento em nossa empresa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Nossa Jornada
            </h2>
            <p className="text-xl text-slate-600">
              Como chegamos até aqui e para onde estamos indo
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              
              {timeline.map((item, index) => (
                <div key={index} className="relative flex items-start space-x-6 mb-12">
                  <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative z-10">
                    {item.year}
                  </div>
                  <div className="space-y-2 pt-3">
                    <h3 className="text-xl font-semibold text-slate-800">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Nossa Equipe
            </h2>
            <p className="text-xl text-slate-600">
              Profissionais dedicados que fazem a diferença na saúde brasileira
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{member.name}</h3>
                    <p className="text-blue-600 font-medium">{member.role}</p>
                    <p className="text-slate-600 text-sm mt-2">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Reconhecimento e Certificações
            </h2>
            <p className="text-xl opacity-90">
              Nosso compromisso com a excelência é reconhecido por organizações nacionais e internacionais
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <Shield className="h-12 w-12 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Certificação LGPD</h3>
                <p className="text-sm opacity-90">Totalmente adequado às leis brasileiras</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <Award className="h-12 w-12 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">ISO 27001</h3>
                <p className="text-sm opacity-90">Padrão internacional de segurança</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <Star className="h-12 w-12 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Top 10 HealthTech</h3>
                <p className="text-sm opacity-90">Ranking nacional de inovação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Junte-se à revolução da medicina digital
            </h2>
            <p className="text-xl opacity-90">
              Faça parte de uma comunidade que está transformando a forma como cuidamos da saúde no Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/nova-clinica')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
              >
                Começar Gratuitamente
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

export default SobreNos;