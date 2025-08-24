
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Crown, Zap, Clock, Users, UserPlus, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { PagamentoModal } from './PagamentoModal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoAtual: string;
  limiteFuncionarios: number;
  limiteMedicos: number;
  funcionariosAtivos: number;
  medicosAtivos: number;
  tipoLimite: 'funcionarios' | 'medicos';
}

const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  tipoAtual, 
  limiteFuncionarios, 
  limiteMedicos,
  funcionariosAtivos,
  medicosAtivos,
  tipoLimite 
}: UpgradeModalProps) => {
  const [showPagamento, setShowPagamento] = useState(false);

  const planos = [
    {
      tipo: 'basico',
      nome: 'Básico',
      icon: <Clock className="h-5 w-5" />,
      funcionarios: 4,
      medicos: 5,
      cor: 'from-blue-500 to-blue-600',
      badge: 'bg-blue-100 text-blue-800'
    },
    {
      tipo: 'intermediario',
      nome: 'Intermediário',
      icon: <Zap className="h-5 w-5" />,
      funcionarios: 8,
      medicos: 10,
      cor: 'from-orange-500 to-orange-600',
      badge: 'bg-orange-100 text-orange-800'
    },
    {
      tipo: 'premium',
      nome: 'Premium',
      icon: <Crown className="h-5 w-5" />,
      funcionarios: 12,
      medicos: 15,
      cor: 'from-purple-500 to-purple-600',
      badge: 'bg-purple-100 text-purple-800'
    }
  ];

  const planoAtualIndex = planos.findIndex(p => p.tipo === tipoAtual);
  const proximosPlanos = planos.slice(planoAtualIndex + 1);

  const handleUpgrade = () => {
    setShowPagamento(true);
  };

  if (showPagamento) {
    return (
      <PagamentoModal
        isOpen={true}
        onClose={() => {
          setShowPagamento(false);
          onClose();
        }}
        onSuccess={() => {
          setShowPagamento(false);
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-blue-50">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Limite de {tipoLimite === 'funcionarios' ? 'Funcionários' : 'Médicos'} Atingido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Atual */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3 text-red-800">
              <Users className="h-5 w-5" />
              <div>
                <p className="font-medium">Limite atual atingido</p>
                <p className="text-sm">
                  {tipoLimite === 'funcionarios' 
                    ? `${funcionariosAtivos} de ${limiteFuncionarios} funcionários`
                    : `${medicosAtivos} de ${limiteMedicos} médicos`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Comparação de Planos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Faça upgrade do seu plano</h3>
            
            <div className="grid gap-3">
              {proximosPlanos.map((plano) => (
                <div 
                  key={plano.tipo}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-gradient-to-br ${plano.cor} text-white`}>
                        {plano.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Plano {plano.nome}</h4>
                          <Badge className={plano.badge}>Recomendado</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Até {plano.funcionarios} funcionários</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserPlus className="h-3 w-3" />
                            <span>Até {plano.medicos} médicos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-2"
            >
              Fazer Upgrade Agora
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full border-gray-300 hover:bg-gray-50 py-2"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
