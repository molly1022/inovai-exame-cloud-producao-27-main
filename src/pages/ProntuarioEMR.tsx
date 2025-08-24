import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Brain, 
  Clock, 
  Shield, 
  Smartphone, 
  Users,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Heart,
  Stethoscope,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ProntuarioEMR = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Brain,
      title: "Prontuário com IA",
      description: "Economize horas com assistente de IA para documentação médica inteligente"
    },
    {
      icon: Clock,
      title: "Acesso Online 24/7",
      description: "Acesse registros médicos eletrônicos de qualquer lugar, a qualquer hora"
    },
    {
      icon: Shield,
      title: "Totalmente Personalizado",
      description: "Adapte formulários, planos de tratamento e dashboards às suas necessidades"
    },
    {
      icon: Activity,
      title: "Telemedicina Integrada",
      description: "Trate pacientes virtualmente e compartilhe arquivos com segurança"
    }
  ];

  const features = [
    "Documentação automática com IA do Inovai ProMed 🤖",
    "Prontuários eletrônicos acessíveis online",
    "Formulários de admissão personalizáveis",
    "Planos de tratamento adaptáveis",
    "Dashboards médicos personalizados",
    "Compartilhamento seguro de arquivos",
    "Visualização de estatísticas em tempo real",
    "Alertas de tarefas pendentes",
    "Histórico completo do paciente",
    "Integração com agenda e faturamento"
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
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Prontuário eletrônico{' '}
                  <span className="text-blue-600">inteligente</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-lg">
                  Ferramentas de prontuário flexíveis e personalizadas—Agora com IA para economizar horas de documentação.
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
                  Falar com Especialista
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/6508b17438729c76c8d38786_EMR-PatientCharting.webp"
                alt="Interface do prontuário eletrônico Inovai ProMed"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Prontuário que se adapta ao seu trabalho
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Documente mais inteligente, não mais difícil, com ferramentas projetadas para aumentar a eficiência
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
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

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                  Tudo que você precisa em um prontuário
                </h2>
                <p className="text-xl text-slate-600">
                  Acesse seus registros médicos online e documente de qualquer lugar com nossa plataforma completa.
                </p>
              </div>

              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Explorar Prontuário
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <img 
                src="https://cdn.prod.website-files.com/633db23da0a6e4b0401d863a/64c9758386d16dcd2e37f4c3_EMR-Charting.webp"
                alt="Funcionalidades do prontuário eletrônico"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* IA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="h-8 w-8" />
                <span className="text-2xl font-bold">IA do Inovai ProMed</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Documente mais rápido com Inteligência Artificial
              </h2>
              <p className="text-xl opacity-90">
                Nossa IA revolucionária automatiza a documentação médica, economizando horas do seu tempo para focar no que realmente importa: o cuidado com o paciente.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <Stethoscope className="h-8 w-8 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">Documentação Automática</h3>
                <p className="text-sm opacity-90">IA gera notas médicas baseadas na consulta</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <BarChart3 className="h-8 w-8 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">Análise Inteligente</h3>
                <p className="text-sm opacity-90">Insights automáticos sobre padrões de saúde</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <Heart className="h-8 w-8 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">Cuidado Personalizado</h3>
                <p className="text-sm opacity-90">Recomendações baseadas no histórico do paciente</p>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={() => navigate('/nova-clinica')}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Testar IA Gratuitamente
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Pronto para revolucionar seus prontuários?
            </h2>
            <p className="text-xl opacity-90">
              Junte-se a milhares de profissionais que já economizam horas com o Inovai ProMed.
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

export default ProntuarioEMR;