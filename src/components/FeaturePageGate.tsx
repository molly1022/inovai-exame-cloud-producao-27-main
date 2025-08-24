import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react';
import { useFeatureControl } from '@/hooks/useFeatureControl';
import { useNavigate } from 'react-router-dom';

interface FeaturePageGateProps {
  children: React.ReactNode;
  feature: string;
  featureName: string;
  description: string;
  requiredPlan: string;
  showUpgradeButton?: boolean;
}

export const FeaturePageGate: React.FC<FeaturePageGateProps> = ({
  children,
  feature,
  featureName,
  description,
  requiredPlan,
  showUpgradeButton = true
}) => {
  const { isFeatureBlocked, assinatura, getPlanName } = useFeatureControl();
  const navigate = useNavigate();

  if (!isFeatureBlocked(feature)) {
    return <>{children}</>;
  }

  const getRequiredPlanName = (plan: string) => {
    switch (plan) {
      case 'intermediario_medico': return 'Intermediário';
      case 'avancado_medico': return 'Avançado';
      default: return plan;
    }
  };

  const getUpgradeIcon = () => {
    switch (requiredPlan) {
      case 'intermediario_medico': return <Zap className="h-5 w-5" />;
      case 'avancado_medico': return <Crown className="h-5 w-5" />;
      default: return <ArrowRight className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto border-2 border-dashed border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-gray-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            {featureName}
          </CardTitle>
          <p className="text-gray-600">
            {description}
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {/* Status Atual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Plano Atual:</span>
              <Badge variant="outline">
                {assinatura ? getPlanName(assinatura.tipo_plano) : 'Carregando...'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Esta funcionalidade não está disponível no seu plano atual
            </p>
          </div>

          {/* Plano Necessário */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-800">Necessário:</span>
              <Badge className="bg-blue-600 hover:bg-blue-700">
                Plano {getRequiredPlanName(requiredPlan)}
              </Badge>
            </div>
            <p className="text-xs text-blue-700">
              Faça upgrade para acessar esta funcionalidade
            </p>
          </div>

          {/* Botão de Upgrade */}
          {showUpgradeButton && (
            <Button
              onClick={() => navigate('/pagamentos')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {getUpgradeIcon()}
              <span className="ml-2">Fazer Upgrade para {getRequiredPlanName(requiredPlan)}</span>
            </Button>
          )}

          {/* Link para voltar */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};