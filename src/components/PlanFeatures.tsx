import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, Zap, Crown, X } from 'lucide-react';

interface PlanFeaturesProps {
  tipo: string;
  className?: string;
}

const PlanFeatures = ({ tipo, className = "" }: PlanFeaturesProps) => {
  const getFeatures = (planType: string) => {
    const commonFeatures = [
      { name: 'Agenda e agendamentos completos', included: true },
      { name: 'Cadastro ilimitado de pacientes', included: true },
      { name: 'Exames básicos e laudos', included: true },
      { name: 'Prontuários eletrônicos', included: true },
      { name: 'Portal do paciente', included: true },
      { name: 'Backup automático', included: true },
      { name: 'Suporte técnico', included: true },
    ];

    const intermediateFeatures = [
      { name: 'Sistema de emails automáticos', included: planType !== 'basico_medico' },
      { name: 'Relatórios básicos de faturamento', included: planType !== 'basico_medico' },
      { name: 'Atestados e receitas médicas', included: planType !== 'basico_medico' },
      { name: 'Controle de convênios', included: planType !== 'basico_medico' },
      { name: 'Dashboard financeiro', included: planType !== 'basico_medico' },
      { name: 'Configurações avançadas', included: planType !== 'basico_medico' },
    ];

    const advancedFeatures = [
      { name: 'Sistema de telemedicina completo', included: planType === 'avancado_medico' },
      { name: 'Relatórios avançados e analytics', included: planType === 'avancado_medico' },
      { name: 'Monitoramento de funcionários', included: planType === 'avancado_medico' },
      { name: 'API para integrações', included: planType === 'avancado_medico' },
      { name: 'Configurações personalizadas', included: planType === 'avancado_medico' },
      { name: 'Suporte prioritário', included: planType === 'avancado_medico' },
    ];

    return [...commonFeatures, ...intermediateFeatures, ...advancedFeatures];
  };

  const getPlanInfo = (planType: string) => {
    switch (planType) {
      case 'basico_medico':
        return {
          name: 'Básico',
          icon: <Clock className="h-5 w-5" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Funcionalidades essenciais para clínicas pequenas'
        };
      case 'intermediario_medico':
        return {
          name: 'Intermediário',
          icon: <Zap className="h-5 w-5" />,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          description: 'Recursos avançados para clínicas em crescimento'
        };
      case 'avancado_medico':
        return {
          name: 'Avançado',
          icon: <Crown className="h-5 w-5" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          description: 'Todas as funcionalidades para clínicas completas'
        };
      default:
        return {
          name: 'Plano',
          icon: <Clock className="h-5 w-5" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: ''
        };
    }
  };

  const features = getFeatures(tipo);
  const planInfo = getPlanInfo(tipo);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {planInfo.icon}
          <span>Plano {planInfo.name}</span>
          <Badge className={planInfo.color}>
            {features.filter(f => f.included).length} recursos
          </Badge>
        </CardTitle>
        {planInfo.description && (
          <p className="text-sm text-gray-600">{planInfo.description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-2 ${
                feature.included ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {feature.included ? (
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <span className={`text-sm ${!feature.included ? 'line-through' : ''}`}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        {/* Informações adicionais do modelo de cobrança */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Modelo de Cobrança:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Cobrança por médico ativo</p>
            <p>• Funcionários sempre inclusos</p>
            <p>• Portal do paciente incluso</p>
            <p>• Sem limite de pacientes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanFeatures;