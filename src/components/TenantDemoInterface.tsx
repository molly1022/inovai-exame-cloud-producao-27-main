import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Shield } from 'lucide-react';

interface TenantDemoInterfaceProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

export const TenantDemoInterface: React.FC<TenantDemoInterfaceProps> = ({
  title,
  description = "Este componente requer acesso a dados específicos de uma clínica",
  onBack
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {description}
              <br /><br />
              Para acessar este módulo, você precisa estar logado através do subdomínio de uma clínica específica (ex: clinica.sistema.com).
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Sistema Multi-Tenant Ativo - Acesso via Subdomínio
            </p>
            
            {onBack && (
              <Button variant="outline" onClick={onBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};