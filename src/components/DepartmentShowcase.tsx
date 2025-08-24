
import { use3DRotation } from "@/hooks/use3DRotation";
import { LucideIcon } from "lucide-react";
import { BarChart3, TrendingUp } from "lucide-react";

interface Department {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  patients: string;
  procedures: string;
}

interface DepartmentShowcaseProps {
  department: Department;
  index: number;
}

const DepartmentShowcase = ({ department, index }: DepartmentShowcaseProps) => {
  const { rotateY, eventHandlers } = use3DRotation(0);

  return (
    <div
      {...eventHandlers}
      className="relative group cursor-grab active:cursor-grabbing"
      style={{
        transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(2deg)`,
        transformStyle: "preserve-3d",
        animationDelay: `${index * 0.2}s`
      }}
    >
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:shadow-blue-500/20">
        {/* Image Header */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={department.image}
            alt={department.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <department.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
            {department.title}
          </h4>
          <p className="text-slate-400 leading-relaxed mb-4">
            {department.description}
          </p>
          
          {/* Department Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-700/40 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400">Pacientes</span>
              </div>
              <div className="text-lg font-bold text-white">{department.patients}</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-400">Procedimentos</span>
              </div>
              <div className="text-lg font-bold text-white">{department.procedures}</div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Sistema Ativo</span>
            </div>
            <div className="text-sm text-slate-500">Tempo real</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentShowcase;
