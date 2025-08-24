
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Star, Zap, Shield, Award, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MarketingCTA = () => {
  const navigate = useNavigate();

  const benefits = [
    "Implementação em 24 horas",
    "Especializado em exames médicos",
    "Agendamentos inteligentes",
    "Suporte técnico 24/7",
    "Migração de dados gratuita",
    "Compliance total com LGPD"
  ];

  const socialProof = [
    { name: "Clínica São Paulo", logo: "🏥", testimonial: "Entregas de exames 90% mais rápidas" },
    { name: "MedCenter", logo: "⚕️", testimonial: "Agendamentos sem conflitos há 6 meses" },
    { name: "Saúde Total", logo: "🩺", testimonial: "Nossos pacientes adoram o acesso digital" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Social Proof Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-6 w-6 text-yellow-400 fill-current" />
            <span className="text-yellow-300 font-medium">Clínicas que Confiam</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {socialProof.map((proof, index) => (
              <Card key={proof.name} className="bg-slate-800/50 border-slate-700/50 p-6 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl mb-4 text-center">{proof.logo}</div>
                <h4 className="text-lg font-semibold text-white mb-2">{proof.name}</h4>
                <p className="text-gray-300 italic">"{proof.testimonial}"</p>
                <div className="flex justify-center mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main CTA */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Award className="h-8 w-8 text-purple-400 animate-pulse" />
            <span className="text-purple-300 font-medium text-lg">Sistema Especializado</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
              Foco Total em
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Exames e Agendamentos
            </span>
          </h2>

          <p className="text-2xl text-gray-300 mb-8 leading-relaxed">
            Junte-se a mais de <span className="text-purple-400 font-bold">500+ clínicas</span> que já otimizaram 
            suas operações com nossa plataforma especializada
          </p>

          {/* Specialization highlight */}
          <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-2xl p-6 mb-8 border border-purple-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-white">Entrega de Exames</h4>
                  <p className="text-gray-300 text-sm">Acesso instantâneo e seguro aos resultados</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-white">Agendamentos</h4>
                  <p className="text-gray-300 text-sm">Sistema inteligente de marcação de consultas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit} 
                className="flex items-center space-x-3 bg-slate-800/30 rounded-lg p-4 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-gray-200">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Pricing CTA */}
          <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <div className="text-sm text-purple-300 mb-2">Sistema Especializado</div>
                <div className="text-4xl font-bold text-white mb-2">
                  <span className="line-through text-gray-500 text-2xl">R$ 2.997</span>
                  <span className="ml-3 text-green-400">R$ 997</span>
                  <span className="text-lg text-gray-400">/mês</span>
                </div>
                <div className="text-purple-300">Foco exclusivo em exames e agendamentos</div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold transform hover:scale-105 transition-all duration-300 group"
                  onClick={() => navigate('/clinica-login')}
                >
                  Começar Agora
                  <Zap className="ml-3 h-6 w-6 group-hover:animate-pulse" />
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-purple-400 text-purple-300 hover:bg-purple-400/10 px-8 py-6 text-lg"
                >
                  Ver Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span>Especializado</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-400" />
              <span>Garantia 30 dias</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketingCTA;
