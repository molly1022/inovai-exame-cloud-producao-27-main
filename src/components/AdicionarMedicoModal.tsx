import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calculator, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdicionarMedicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planoAtual: string;
  valorPorMedico: number;
  medicosAtuais: number;
  loading?: boolean;
}

const AdicionarMedicoModal = ({
  isOpen,
  onClose,
  onConfirm,
  planoAtual,
  valorPorMedico,
  medicosAtuais,
  loading = false
}: AdicionarMedicoModalProps) => {
  const novoTotal = medicosAtuais + 1;
  const valorAdicional = valorPorMedico;
  const novoValorMensal = novoTotal * valorPorMedico;
  const valorAtualMensal = medicosAtuais * valorPorMedico;

  const getPlanDisplayName = (plano: string) => {
    switch (plano) {
      case 'basico_medico': return 'Básico';
      case 'intermediario_medico': return 'Intermediário';
      case 'avancado_medico': return 'Avançado';
      default: return plano;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Adicionar Médico
          </DialogTitle>
          <DialogDescription>
            Confirme a adição de um novo médico ao seu plano
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Plano Atual */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Plano Atual</span>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {getPlanDisplayName(planoAtual)}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                R$ {valorPorMedico.toFixed(2)}
                <span className="text-sm font-normal text-blue-600 ml-1">por médico/mês</span>
              </div>
            </CardContent>
          </Card>

          {/* Cálculo do Impacto */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Cálculo do Impacto</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-600">
                <div>Médicos atuais:</div>
                <div className="font-semibold">{medicosAtuais} médico(s)</div>
              </div>
              <div className="text-gray-600">
                <div>Após adição:</div>
                <div className="font-semibold text-green-600">{novoTotal} médico(s)</div>
              </div>
              
              <div className="text-gray-600">
                <div>Valor atual:</div>
                <div className="font-semibold">R$ {valorAtualMensal.toFixed(2)}/mês</div>
              </div>
              <div className="text-gray-600">
                <div>Novo valor:</div>
                <div className="font-semibold text-green-600">R$ {novoValorMensal.toFixed(2)}/mês</div>
              </div>
            </div>

            {/* Destaque do Valor Adicional */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-center">
                <div className="text-sm text-green-700 mb-1">Custo adicional mensal</div>
                <div className="text-2xl font-bold text-green-800">
                  +R$ {valorAdicional.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Aviso Importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <div className="font-medium mb-1">Importante:</div>
                <ul className="space-y-1 text-xs">
                  <li>• O valor será cobrado proporcionalmente na próxima fatura</li>
                  <li>• A cobrança é recorrente enquanto o médico estiver ativo</li>
                  <li>• Você pode desativar médicos a qualquer momento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Adicionando...' : `Adicionar por +R$ ${valorAdicional.toFixed(2)}/mês`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarMedicoModal;