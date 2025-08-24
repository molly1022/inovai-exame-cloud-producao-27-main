
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Activity,
  Target,
  Zap,
  BarChart3,
  UserCheck,
  FileText,
  Calendar
} from "lucide-react";

const ProductivityMetrics = () => {
  const metrics = [
    {
      icon: TrendingUp,
      title: "Entregas de Exames",
      value: "+89%",
      description: "Aumento na velocidade de entrega de resultados",
      color: "from-green-400 to-emerald-500",
      trend: "↗ Entrega instantânea"
    },
    {
      icon: Calendar,
      title: "Agendamentos",
      value: "24/7",
      description: "Sistema disponível para agendamentos a qualquer hora",
      color: "from-blue-400 to-blue-500",
      trend: "100% disponibilidade"
    },
    {
      icon: Clock,
      title: "Tempo de Resposta",
      value: "< 2min",
      description: "Tempo médio para acesso aos exames",
      color: "from-purple-400 to-purple-500",
      trend: "↗ 95% mais rápido"
    },
    {
      icon: UserCheck,
      title: "Pacientes Ativos",
      value: "2.847",
      description: "Pacientes com acesso digital aos resultados",
      color: "from-orange-400 to-orange-500",
      trend: "↗ +156 novos"
    }
  ];

  const portals = [
    {
      icon: Users,
      title: "Portal do Paciente",
      description: "Acesso completo aos resultados de exames e agendamentos",
      features: ["Resultados de Exames", "Histórico Médico", "Agendamento Online", "Laudos Digitais"]
    },
    {
      icon: Activity,
      title: "Portal do Médico",
      description: "Dashboard especializado para consulta de exames e agenda",
      features: ["Visualização de Exames", "Agenda de Consultas", "Histórico de Pacientes", "Relatórios Médicos"]
    },
    {
      icon: Target,
      title: "Administração da Clínica",
      description: "Controle operacional de exames e agendamentos",
      features: ["Dashboard Operacional", "Gestão de Exames", "Controle de Agenda", "Relatórios de Atividade"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-purple-900/20 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.1)_50%,transparent_75%)] bg-[length:60px_60px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Productivity Metrics */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-6 w-6 text-purple-400 animate-pulse" />
            <span className="text-purple-300 font-medium">Métricas Operacionais</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Eficiência Comprovada em
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Exames e Agendamentos
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nosso foco exclusivo em entregas de exames e agendamentos garante máxima eficiência operacional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {metrics.map((metric, index) => (
            <Card 
              key={metric.title}
              className="group bg-slate-800/60 backdrop-blur-xl border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className="h-8 w-8 text-white" />
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-2`}>
                  {metric.value}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{metric.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{metric.description}</p>
                <div className="text-xs text-green-400 font-medium">{metric.trend}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Portals Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Portais Especializados
            </span>
          </h3>
          <p className="text-lg text-gray-300">
            Cada portal é otimizado para exames e agendamentos específicos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portals.map((portal, index) => (
            <Card 
              key={portal.title}
              className="group bg-gradient-to-br from-slate-800/80 to-purple-900/20 border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <portal.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  {portal.title}
                </h3>
                <p className="text-gray-400 mb-6">{portal.description}</p>
                <ul className="space-y-3">
                  {portal.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductivityMetrics;
