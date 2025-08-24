import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, User, Database } from 'lucide-react';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlertaInfo {
  tipo: string;
  quantidade: number;
  cor: string;
  icone: React.ReactNode;
  titulo: string;
}

export const AgendaAlertas: React.FC = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <AlertasContent />
    </TenantGuard>
  );
};

const AlertasContent: React.FC = () => {
  // Dados mockados para demonstração até banco operacional estar configurado
  const alertasMock: AlertaInfo[] = [
    {
      tipo: 'atrasados',
      quantidade: 2,
      cor: 'destructive',
      icone: <AlertTriangle className="h-4 w-4" />,
      titulo: 'Atrasados'
    },
    {
      tipo: 'proximos',
      quantidade: 5,
      cor: 'default',
      icone: <Clock className="h-4 w-4" />,
      titulo: 'Próximos 30min'
    },
    {
      tipo: 'andamento',
      quantidade: 3,
      cor: 'secondary',
      icone: <CheckCircle className="h-4 w-4" />,
      titulo: 'Em Andamento'
    },
    {
      tipo: 'checkin',
      quantidade: 1,
      cor: 'outline',
      icone: <User className="h-4 w-4" />,
      titulo: 'Aguard. Check-in'
    }
  ];

  return (
    <div className="space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Demonstração de Alertas</strong> - Dados reais estarão disponíveis quando acessado via subdomínio da clínica específica.
        </AlertDescription>
      </Alert>

      <Card className="mb-4 border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Status da Agenda - Fluxo Automatizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {alertasMock.map((alerta, index) => (
              <Badge 
                key={index} 
                variant={alerta.cor as any}
                className="flex items-center gap-2 px-3 py-2 text-sm opacity-60"
              >
                {alerta.icone}
                <span className="font-medium">{alerta.quantidade}</span>
                <span>{alerta.titulo}</span>
              </Badge>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            <p>• Check-in disponível 10 min antes da consulta</p>
            <p>• Consultas iniciam automaticamente no horário após check-in</p>
            <p>• Faltas são marcadas após 15 min de tolerância</p>
            <p className="text-primary font-medium">• Dados simulados para demonstração</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaAlertas;