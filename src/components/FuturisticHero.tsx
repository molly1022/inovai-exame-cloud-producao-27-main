
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExamPreviewModal from "./ExamPreviewModal";

const FuturisticHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Text content */}
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="h-6 w-6 text-purple-400 animate-pulse" />
              <span className="text-purple-300 font-medium">Especialistas em Exames e Agendamentos</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
                Sistema Focado em
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
                Exames e Consultas
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Plataforma especializada para entrega de exames médicos e agendamento de consultas. 
              <span className="text-purple-300 font-semibold">Não gerenciamos financeiro</span> - 
              somos 100% focados na operação médica.
            </p>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/30 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Nossas Especialidades:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">Entrega de Exames</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">Agendamentos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-gray-300">Laudos Digitais</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-300">Acesso Instantâneo</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold group transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/clinica-login')}
              >
                Testar Sistema Grátis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-400 text-purple-300 hover:bg-purple-400/10 px-8 py-4 text-lg font-semibold group"
              >
                Ver Demonstração
                <Zap className="ml-2 h-5 w-5 group-hover:animate-pulse" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">+500</div>
                <div className="text-sm text-gray-400">Clínicas Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">98.7%</div>
                <div className="text-sm text-gray-400">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400">Disponível</div>
              </div>
            </div>
          </div>

          {/* Right side - Interactive Exam Modal */}
          <div className="relative animate-scale-in delay-300">
            <div className="relative">
              {/* Glowing border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              
              {/* Modal interativo no lugar da imagem */}
              <ExamPreviewModal />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FuturisticHero;
