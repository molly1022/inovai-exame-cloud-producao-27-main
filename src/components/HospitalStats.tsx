
import { TrendingUp, Users, UserCheck, Calendar, Heart, Stethoscope } from "lucide-react";

const HospitalStats = () => {
  const stats = [
    {
      icon: Users,
      label: "Pacientes Ativos",
      value: "12.847",
      subtitle: "Cadastrados no sistema",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: UserCheck,
      label: "Consultas/Mês",
      value: "3.240",
      subtitle: "Média mensal",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Stethoscope,
      label: "Procedimentos",
      value: "1.856",
      subtitle: "Realizados este mês",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      label: "Satisfação",
      value: "98.7%",
      subtitle: "Avaliação dos pacientes",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-slate-800/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            Nossa Performance em Números
          </h3>
          <p className="text-slate-400 text-lg">
            Resultados que comprovam nossa excelência e eficiência
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`mx-auto w-20 h-20 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-slate-300 font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-slate-500 text-sm">
                {stat.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HospitalStats;
