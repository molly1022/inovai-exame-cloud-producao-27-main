import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lock, Crown, Zap, ArrowUp } from 'lucide-react';
import { useFeatureControl } from '@/hooks/useFeatureControl';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export const FeatureGate = ({ feature, children, fallback, showUpgrade = true }: FeatureGateProps) => {
  const { isFeatureBlocked, planoFeatures } = useFeatureControl();
  const navigate = useNavigate();

  const isBlocked = isFeatureBlocked(feature);

  if (!isBlocked) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getFeatureName = (feature: string) => {
    const names: Record<string, string> = {
      emails: 'Sistema de E-mails',
      relatorios: 'Relatórios Avançados',
      monitoramento: 'Monitoramento de Funcionários',
      telemedicina: 'Telemedicina',
      usuarios_multiplos: 'Múltiplos Usuários'
    };
    return names[feature] || feature;
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'emails': return '📧';
      case 'relatorios': return '📊';
      case 'monitoramento': return '👥';
      case 'telemedicina': return '📹';
      default: return '🔒';
    }
  };

  const getRecommendedPlan = (feature: string) => {
    if (['emails', 'relatorios'].includes(feature)) {
      return 'intermediario';
    }
    return 'premium';
  };

  const recommendedPlan = getRecommendedPlan(feature);
  
  return (
    <div className="relative">
      {/* Overlay bloqueado */}
      <div className="relative opacity-30 pointer-events-none">
        {children}
      </div>
      
      {/* Card de upgrade */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-lg">
        <Card className="w-full max-w-md mx-4 border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-3 w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-2xl">
              {getFeatureIcon(feature)}
            </div>
            <CardTitle className="text-lg text-orange-800 flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Funcionalidade Bloqueada
            </CardTitle>
            <CardDescription className="text-orange-700">
              <span className="font-semibold">{getFeatureName(feature)}</span> está disponível apenas em planos superiores
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                {recommendedPlan === 'intermediario' ? (
                  <><Zap className="h-3 w-3 mr-1" /> Plano Intermediário</>
                ) : (
                  <><Crown className="h-3 w-3 mr-1" /> Plano Premium</>
                )}
              </Badge>
              
              <p className="text-sm text-gray-600 mb-4">
                {recommendedPlan === 'intermediario' 
                  ? 'Desbloqueie emails e relatórios básicos'
                  : 'Acesso completo a todas as funcionalidades'
                }
              </p>
            </div>

            {showUpgrade && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/pagamentos')}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  size="sm"
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Fazer Upgrade
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://wa.me/53999428130', '_blank')}
                >
                  Falar com Suporte
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Wrapper para páginas inteiras
export const FeaturePageGate = ({ feature, children }: { feature: string; children: React.ReactNode }) => {
  const { isFeatureBlocked } = useFeatureControl();
  
  if (isFeatureBlocked(feature)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <FeatureGate feature={feature} showUpgrade={true}>
          <div />
        </FeatureGate>
      </div>
    );
  }
  
  return <>{children}</>;
};