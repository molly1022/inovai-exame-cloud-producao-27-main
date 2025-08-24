
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, 
  Users, 
  FileSearch, 
  CalendarPlus, 
  Activity,
  Shield,
  Zap,
  BarChart3,
  Brain,
  Clock,
  Stethoscope,
  FileText
} from "lucide-react";

const SystemFeatures = () => {
  const features = [
    {
      icon: UserPlus,
      title: "Gestão de Médicos",
      description: "Cadastro completo de profissionais com especialidades e horários disponíveis",
      color: "from-purple-500 to-purple-600",
      stats: "+35% organização"
    },
    {
      icon: Users,
      title: "Portal do Paciente",
      description: "Acesso digital aos resultados de exames e histórico de consultas",
      color: "from-blue-500 to-blue-600",
      stats: "98% satisfação"
    },
    {
      icon: FileSearch,
      title: "Entrega de Exames",
      description: "Sistema especializado para disponibilização segura de resultados e laudos médicos",
      color: "from-emerald-500 to-emerald-600",
      stats: "Entrega instantânea"
    },
    {
      icon: CalendarPlus,
      title: "Agendamento de Consultas",
      description: "Plataforma inteligente para marcação e gestão de consultas médicas",
      color: "from-orange-500 to-orange-600",
      stats: "+50% eficiência"
    },
    {
      icon: Activity,
      title: "Monitoramento Operacional",
      description: "Acompanhamento em tempo real de agendamentos e entregas de exames",
      color: "from-pink-500 to-pink-600",
      stats: "Tempo real"
    },
    {
      icon: Shield,
      title: "Segurança Médica",
      description: "LGPD compliant com criptografia para proteção de dados sensíveis",
      color: "from-indigo-500 to-indigo-600",
      stats: "100% seguro"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stethoscope className="h-6 w-6 text-purple-400 animate-pulse" />
            <span className="text-purple-300 font-medium">Especializado em Saúde</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Sistema Focado em
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Exames e Agendamentos
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Plataforma especializada para entrega de exames e agendamento de consultas. 
            Não gerenciamos financeiro - somos 100% focados na operação médica.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                    {feature.stats}
                  </span>
                  <Zap className="h-4 w-4 text-purple-400 group-hover:animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SystemFeatures;
