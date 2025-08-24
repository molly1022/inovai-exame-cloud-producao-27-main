
import { Heart, Users, Calendar, FileText, CheckCircle, Star, TrendingUp, Shield } from "lucide-react";

const features = [
  {
    icon: <TrendingUp className="text-green-400" size={38} />,
    title: "Indicadores em Tempo Real",
    desc: "Acompanhe resultados da clínica ao vivo com gráficos e estatísticas de impacto."
  },
  {
    icon: <Users className="text-blue-400" size={38} />,
    title: "Gestão de Pacientes",
    desc: "Centralize informações e histórico de todos os pacientes de forma simples e segura."
  },
  {
    icon: <Calendar className="text-purple-400" size={38} />,
    title: "Agendamento Inteligente",
    desc: "Agende consultas com poucos cliques, receba alertas automáticos e integre com prontuários."
  },
  {
    icon: <FileText className="text-yellow-400" size={38} />,
    title: "Exames Digitais",
    desc: "Compartilhe, filtre e baixe exames e laudos de modo totalmente digital."
  },
  {
    icon: <CheckCircle className="text-emerald-400" size={38} />,
    title: "Automação de Tarefas",
    desc: "Reduza o trabalho manual com fluxos automáticos e formulários inteligentes."
  },
  {
    icon: <Shield className="text-pink-400" size={38} />,
    title: "Segurança de Dados",
    desc: "Proteção de ponta a ponta com criptografia e permissões customizadas."
  },
];

const AnimatedFeatures = () => (
  <section className="py-12 bg-transparent animate-fade-in">
    <h2 className="text-center text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
      Funcionalidades que potencializam a sua clínica
    </h2>
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
      {features.map((f, idx) => (
        <div
          key={f.title}
          className="bg-gradient-to-br from-[#2d2152] to-[#231a3c] border border-[#42367c]/60 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-purple-800/50 animate-scale-in"
          style={{ animationDelay: `${idx * 0.12 + 0.12}s` }}
        >
          <div className="mb-3 animate-pulse">{f.icon}</div>
          <div className="font-semibold text-lg mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
            {f.title}
          </div>
          <div className="text-gray-300 text-sm">{f.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default AnimatedFeatures;
