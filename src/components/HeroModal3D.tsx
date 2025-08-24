
import { Star, Users, Heart, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import clsx from "clsx";

const dashboardImage = "/lovable-uploads/8ae6b20f-ca92-40cf-a683-5c1e887b6c20.png";

export default function HeroModal3D() {
  return (
    <div className="relative flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
      {/* Balões ou círculos decorativos */}
      <svg className="absolute left-8 top-8 w-20 h-20 text-purple-400 opacity-20 blur-2xl animate-pulse z-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="currentColor" />
      </svg>
      <svg className="absolute right-10 top-36 w-32 h-32 text-blue-400 opacity-25 blur-3xl animate-pulse z-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="currentColor" />
      </svg>
      {/* 3D Modal Simulado */}
      <div
        className={clsx(
          "relative z-10 rounded-3xl shadow-2xl border-2 border-[#5f40af]/70 bg-gradient-to-br from-blue-950 via-[#352565]/90 to-purple-900/70 p-0 flex flex-col items-center transition-transform duration-500",
          "hover:scale-105 hover:-rotate-x-2 hover:rotate-y-1 hover:shadow-[0_16px_60px_0_rgba(160,120,255,0.7)]",
          "perspective-3d"
        )}
        style={{
          transform: "rotateY(-5deg) rotateX(4deg)",
          boxShadow: "0 8px 32px 0 rgba(80,50,180,0.18), 0 0px 0px #0000",
          marginBottom: "3rem",
          maxWidth: 440,
          width: "100%",
        }}
      >
        {/* Dashboard image "in 3d" */}
        <div className="relative w-full h-[260px]">
          <img
            src={dashboardImage}
            alt="Dashboard Inovai Pro"
            className="absolute left-4 right-4 top-4 bottom-4 w-[92%] h-[92%] object-cover rounded-2xl shadow-lg border-2 border-blue-600/40 animate-scale-in"
            style={{
              boxShadow: "0 18px 46px 0 rgba(101,84,187,0.3)",
              filter: "brightness(1.06) contrast(1.04) drop-shadow(0 0 20px #a78bfa99)"
            }}
          />
          {/* Fetish "shine" overlay */}
          <div className="absolute left-6 top-5 w-1/2 h-2 rounded-full bg-white/30 blur-sm"></div>
        </div>
        {/* Conteúdo central do "modal" */}
        <div className="relative z-10 py-8 px-6 text-center space-y-5">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex gap-2 justify-center items-center">
              <Heart className="text-pink-400" size={26} />
              <span className="text-xl font-bold bg-gradient-to-r from-[#A177FF] via-sky-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                Inovai Pro
              </span>
              <Star className="text-yellow-300" size={22} />
            </div>
            <div className="font-bold text-2xl text-white leading-tight mt-1">
              O sistema inovador que já<span className="ml-2 text-purple-400">transforma clínicas</span>
            </div>
            <div className="flex flex-row space-x-8 justify-center mt-3">
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-purple-400 to-blue-400 bg-clip-text text-transparent animate-scale-in">
                  +1.000
                </span>
                <div className="flex gap-1 items-center text-base text-gray-200 mt-1"><TrendingUp size={16} className="text-green-400" /> Clínicas ativas</div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-blue-300 via-purple-300 to-blue-500 bg-clip-text text-transparent animate-scale-in">
                  +30 mil
                </span>
                <div className="flex gap-1 items-center text-base text-gray-200 mt-1"><Users size={16} className="text-blue-300" /> Pacientes atendidos/mês</div>
              </div>
            </div>
          </div>
          <div className="text-base text-gray-300 mt-2 max-w-xs mx-auto">
            Potencialize a performance e organização da sua clínica com recursos completos, interface moderna e tecnologia 100% cloud.
          </div>
          <div className="mt-7">
            <Link to="/clinica-login">
              <Button size="lg" className="bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 text-lg px-8 py-4 rounded-full shadow-xl hover:from-purple-800 hover:to-pink-700 transition-all">
                Testar Sistema Grátis <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Glow/gradiente embaixo */}
      <div className="absolute z-0 left-0 right-0 mx-auto bottom-3 h-16 w-[370px] blur-2xl bg-purple-500 opacity-30 pointer-events-none"></div>
    </div>
  );
}
