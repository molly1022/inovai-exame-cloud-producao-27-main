
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X, EyeOff } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import EmailProblemasManager from './EmailProblemasManager';

interface DismissibleProblemsAlertProps {
  lembretes: any[];
  onRecarregar: () => void;
}

const DismissibleProblemsAlert = ({ lembretes, onRecarregar }: DismissibleProblemsAlertProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { preferences, updatePreference } = useUserPreferences();
  
  const emailsAtivos = lembretes.filter(l => l.status_envio !== 'cancelado');
  const emailsComProblema = emailsAtivos.filter(l => l.status_envio === 'erro');
  const emailsPendentes = emailsAtivos.filter(l => l.status_envio === 'pendente');
  const temProblemas = emailsComProblema.length > 0 || emailsPendentes.length > 5;

  // Verificar se o usuário escolheu não mostrar mais os avisos
  const hideProblemsAlert = preferences.hide_problems_alert === true;

  if (!temProblemas || hideProblemsAlert) {
    return null;
  }

  const handleDismissForever = async () => {
    await updatePreference('hide_problems_alert', true);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800">
              Atenção: Problemas Detectados
            </CardTitle>
            <Badge variant="destructive">
              {emailsComProblema.length > 0 ? `${emailsComProblema.length} erros` : `${emailsPendentes.length} pendentes`}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Ver Detalhes'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissForever}
              className="text-orange-600 hover:text-orange-800"
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Não mostrar mais
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Fechar temporariamente */}}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="border-orange-200">
          <AlertDescription className="text-orange-700">
            {emailsComProblema.length > 0 && (
              <span className="block">⚠️ {emailsComProblema.length} email{emailsComProblema.length !== 1 ? 's' : ''} com erro detectado{emailsComProblema.length !== 1 ? 's' : ''}.</span>
            )}
            {emailsPendentes.length > 5 && (
              <span className="block">⏳ {emailsPendentes.length} emails pendentes há muito tempo.</span>
            )}
            <span className="block mt-2">
              💡 <strong>Dica:</strong> Verifique a configuração do Resend e emails inválidos. Você pode ocultar este aviso permanentemente se desejar.
            </span>
          </AlertDescription>
        </Alert>

        {showDetails && (
          <div className="mt-4">
            <EmailProblemasManager 
              lembretes={lembretes} 
              onRecarregar={onRecarregar}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DismissibleProblemsAlert;
