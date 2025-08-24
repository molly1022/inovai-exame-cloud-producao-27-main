
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, UserPlus, Crown, Zap, Clock } from 'lucide-react';

interface LimiteIndicatorProps {
  atual: number;
  limite: number;
  tipo: 'funcionarios' | 'medicos';
  tipoPlano: string;
  onUpgrade?: () => void;
  className?: string;
}

const LimiteIndicator = ({ 
  atual, 
  limite, 
  tipo, 
  tipoPlano, 
  onUpgrade, 
  className = "" 
}: LimiteIndicatorProps) => {
  const percentual = (atual / limite) * 100;
  const proximoLimite = atual >= limite;
  
  const getStatusColor = () => {
    if (percentual >= 100) return 'bg-red-100 text-red-800 border-red-200';
    if (percentual >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getTipoPlanoIcon = () => {
    switch (tipoPlano) {
      case 'basico': return <Clock className="h-3 w-3" />;
      case 'intermediario': return <Zap className="h-3 w-3" />;
      case 'premium': return <Crown className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatTipoPlano = (tipo: string) => {
    switch (tipo) {
      case 'basico': return 'Básico';
      case 'intermediario': return 'Intermediário';
      case 'premium': return 'Premium';
      default: return tipo;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-600" />
        <Badge className={getStatusColor()}>
          {atual} de {limite} {tipo}
        </Badge>
      </div>
      
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {getTipoPlanoIcon()}
        <span>Plano {formatTipoPlano(tipoPlano)}</span>
      </div>

      {proximoLimite && onUpgrade && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onUpgrade}
          className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
};

export default LimiteIndicator;
