
import { TrendingUp, Users, FileText, Calendar } from "lucide-react";

const SystemStats = () => {
  const stats = [
    {
      icon: Users,
      label: "Clínicas Ativas",
      value: "500+",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FileText,
      label: "Exames Processados",
      value: "1M+",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Calendar,
      label: "Consultas Agendadas",
      value: "50K+",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      label: "Taxa de Satisfação",
      value: "98%",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-slate-800/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            Números que Impressionam
          </h3>
          <p className="text-slate-400 text-lg">
            Resultados reais de quem já utiliza nossa plataforma
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SystemStats;
