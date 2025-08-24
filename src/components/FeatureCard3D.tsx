
import { use3DRotation } from "@/hooks/use3DRotation";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

interface FeatureCard3DProps {
  feature: Feature;
  index: number;
}

const FeatureCard3D = ({ feature, index }: FeatureCard3DProps) => {
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
            src={feature.image}
            alt={feature.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <feature.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
            {feature.title}
          </h4>
          <p className="text-slate-400 leading-relaxed">
            {feature.description}
          </p>
          
          {/* Progress Bar Simulation */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Implementação</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard3D;
