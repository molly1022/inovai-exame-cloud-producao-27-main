import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle, Clock, Zap, Crown, CreditCard, Database } from 'lucide-react';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlterarPlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assinatura?: any;
}

const AlterarPlanoModal = ({ isOpen, onClose, onSuccess, assinatura }: AlterarPlanoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 max-h-[90vh] overflow-y-auto">
        <TenantGuard requiresOperationalDB={false}>
          <ModalContent assinatura={assinatura} onClose={onClose} onSuccess={onSuccess} />
        </TenantGuard>
      </DialogContent>
    </Dialog>
  );
};

const ModalContent = ({ assinatura, onClose }: { assinatura?: any; onClose: () => void; onSuccess: () => void }) => {
  // Dados simulados para demonstração
  const planosSimulados = [
    {
      id: '1',
      tipo_plano: 'basico_medico',
      periodo_meses: 1,
      valor_base_clinica: 199.00,
      valor_final: 199.00,
      percentual_desconto: 0,
      valor_por_medico: 199.00,
      ativo: true
    },
    {
      id: '2',
      tipo_plano: 'basico_medico',
      periodo_meses: 12,
      valor_base_clinica: 199.00,
      valor_final: 159.20,
      percentual_desconto: 20,
      valor_por_medico: 159.20,
      ativo: true
    },
    {
      id: '3',
      tipo_plano: 'intermediario_medico',
      periodo_meses: 1,
      valor_base_clinica: 299.00,
      valor_final: 299.00,
      percentual_desconto: 0,
      valor_por_medico: 299.00,
      ativo: true
    },
    {
      id: '4',
      tipo_plano: 'avancado_medico',
      periodo_meses: 1,
      valor_base_clinica: 399.00,
      valor_final: 399.00,
      percentual_desconto: 0,
      valor_por_medico: 399.00,
      ativo: true
    }
  ];

  const formatTipoPlano = (tipo: string) => {
    switch (tipo) {
      case 'basico_medico': return 'Básico';
      case 'intermediario_medico': return 'Intermediário';
      case 'avancado_medico': return 'Avançado';
      default: return tipo;
    }
  };

  const getPlanIcon = (tipo: string) => {
    switch (tipo) {
      case 'basico_medico': return <Clock className="h-5 w-5" />;
      case 'intermediario_medico': return <Zap className="h-5 w-5" />;
      case 'avancado_medico': return <Crown className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getPlanGradient = (tipo: string) => {
    switch (tipo) {
      case 'basico_medico': return 'from-blue-500 to-blue-600';
      case 'intermediario_medico': return 'from-orange-500 to-orange-600';
      case 'avancado_medico': return 'from-purple-500 to-purple-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getPlanFeatures = (tipo: string) => {
    switch (tipo) {
      case 'basico_medico':
        return ['Agenda completa', 'Pacientes ilimitados', 'Exames básicos', 'Prontuários', 'Portal do paciente'];
      case 'intermediario_medico':
        return ['Tudo do Básico', 'Emails automáticos', 'Relatórios financeiros', 'Atestados/Receitas', 'Dashboard avançado'];
      case 'avancado_medico':
        return ['Tudo do Intermediário', 'Telemedicina', 'Relatórios avançados', 'Monitoramento', 'API integração'];
      default:
        return [];
    }
  };

  const isPlanoAtual = (tipo: string) => {
    return assinatura?.tipo_plano === tipo;
  };

  return (
    <>
      <DialogHeader className="text-center pb-2">
        <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
          Alterar Plano
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 p-2">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Demonstração de Planos</strong> - Funcionalidades de pagamento estarão disponíveis no ambiente de produção.
          </AlertDescription>
        </Alert>

        {/* Agrupar planos por tipo */}
        <div className="opacity-75">
          {['basico_medico', 'intermediario_medico', 'avancado_medico'].map((tipoPlan) => {
            const planosDoTipo = planosSimulados.filter(p => p.tipo_plano === tipoPlan);
            if (planosDoTipo.length === 0) return null;

            return (
              <div key={tipoPlan} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Plano {formatTipoPlano(tipoPlan)}
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {planosDoTipo.map((plano) => (
                    <Card 
                      key={plano.id} 
                      className={`relative transition-all duration-200 hover:shadow-lg border-2 ${
                        isPlanoAtual(plano.tipo_plano) 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {isPlanoAtual(plano.tipo_plano) && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-green-600 text-white font-semibold px-3 py-1">
                            PLANO ATUAL
                          </Badge>
                        </div>
                      )}

                      <CardContent className="p-6 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getPlanGradient(plano.tipo_plano)} text-white mb-4`}>
                          {getPlanIcon(plano.tipo_plano)}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {formatTipoPlano(plano.tipo_plano)}
                        </h3>

                        <div className="text-center mb-4">
                          {plano.percentual_desconto > 0 && (
                            <div className="text-xs text-red-600 line-through mb-1">
                              R$ {plano.valor_base_clinica.toFixed(2)}
                            </div>
                          )}
                          <span className="text-3xl font-bold text-gray-900">
                            R$ {plano.valor_final.toFixed(2)}
                          </span>
                          <div className="text-sm text-gray-600">
                            por médico/{plano.periodo_meses === 1 ? 'mês' : plano.periodo_meses === 3 ? 'trimestre' : 'ano'}
                          </div>
                          {plano.percentual_desconto > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              {plano.percentual_desconto}% de desconto
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2 mb-6 text-sm text-gray-600">
                          {getPlanFeatures(plano.tipo_plano).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {isPlanoAtual(plano.tipo_plano) ? (
                          <Button 
                            disabled
                            className="w-full bg-green-600 text-white cursor-not-allowed"
                          >
                            Plano Atual
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className={`w-full bg-gradient-to-r ${getPlanGradient(plano.tipo_plano)} hover:opacity-90 text-white font-semibold py-2 shadow-lg hover:shadow-xl transition-all duration-200 opacity-50 cursor-not-allowed`}
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Indisponível (Demo)
                            </div>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="px-8 py-2 border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </>
  );
};

export default AlterarPlanoModal;