
import { use3DRotation } from "@/hooks/use3DRotation";
import { Monitor, Smartphone, Tablet, Database, Cloud, Shield } from "lucide-react";

const SystemDemo3DCard = () => {
  const { rotateY, eventHandlers } = use3DRotation(-5);

  return (
    <div className="flex justify-center mb-16">
      <div
        {...eventHandlers}
        className="relative w-full max-w-4xl"
        style={{
          transform: `perspective(1200px) rotateY(${rotateY}deg) rotateX(2deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Main Dashboard Card */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Dashboard Principal</h4>
              <p className="text-slate-400">Visão geral completa da sua clínica</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pacientes</p>
                  <p className="text-lg font-bold text-white">1,247</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Consultas</p>
                  <p className="text-lg font-bold text-white">342</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Tablet className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Exames</p>
                  <p className="text-lg font-bold text-white">156</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Receita</p>
                  <p className="text-lg font-bold text-white">R$ 89k</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area Simulation */}
          <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
            <h5 className="text-white font-semibold mb-4">Agendamentos da Semana</h5>
            <div className="flex items-end space-x-2 h-32">
              {[40, 65, 80, 45, 90, 70, 60].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm flex-1"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>

          {/* Features Bar */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-slate-700/40 rounded-lg px-3 py-2">
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">Cloud Storage</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-700/40 rounded-lg px-3 py-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Segurança LGPD</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-700/40 rounded-lg px-3 py-2">
              <Database className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-300">Backup Automático</span>
            </div>
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            🖱️ Arraste para girar o card • 📱 Touch para dispositivos móveis
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemDemo3DCard;
