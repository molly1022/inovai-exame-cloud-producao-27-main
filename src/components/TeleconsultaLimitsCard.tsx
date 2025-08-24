import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Video, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useTeleconsultaLimits } from '@/hooks/useTeleconsultaLimits';
import { useToast } from '@/components/ui/use-toast';

export const TeleconsultaLimitsCard = () => {
  const { toast } = useToast();
  const {
    limiteGratuitas,
    utilizadas,
    pacotesComprados,
    totalDisponivel,
    podecriar,
    restantes,
    valorPacoteAdicional,
    consultasPorPacote,
    loading,
    comprarPacoteAdicional
  } = useTeleconsultaLimits();

  const percentualUsado = totalDisponivel > 0 ? (utilizadas / totalDisponivel) * 100 : 0;
  const isNearLimit = percentualUsado >= 80;
  const isAtLimit = !podecriar;

  const handleComprarPacote = async () => {
    const success = await comprarPacoteAdicional();
    if (success) {
      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para finalizar a compra do pacote adicional.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de compra. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Limites de Teleconsulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isAtLimit ? 'border-destructive' : isNearLimit ? 'border-warning' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Limites de Teleconsulta
          {isAtLimit && <AlertTriangle className="h-4 w-4 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uso Atual */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilizadas este mês</span>
            <span className="font-medium">{utilizadas} / {totalDisponivel}</span>
          </div>
          <Progress 
            value={percentualUsado} 
            className={`h-2 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-warning' : ''}`}
          />
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Gratuitas:</span>
            <div className="font-medium">{limiteGratuitas}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Restantes:</span>
            <div className={`font-medium ${restantes === 0 ? 'text-destructive' : ''}`}>
              {restantes}
            </div>
          </div>
        </div>

        {/* Pacotes Adicionais */}
        {pacotesComprados > 0 && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <Badge variant="secondary">
                {pacotesComprados} pacote{pacotesComprados > 1 ? 's' : ''} adicional{pacotesComprados > 1 ? 'is' : ''}
              </Badge>
            </span>
          </div>
        )}

        {/* Status e Ações */}
        <div className="space-y-3">
          {isAtLimit ? (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Limite atingido
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Compre um pacote adicional para continuar usando teleconsultas
              </p>
            </div>
          ) : isNearLimit ? (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 text-warning text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Próximo do limite
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Considere comprar um pacote adicional
              </p>
            </div>
          ) : (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="text-sm text-primary font-medium">
                Você tem {restantes} teleconsultas disponíveis
              </div>
            </div>
          )}

          <Button 
            onClick={handleComprarPacote}
            variant={isAtLimit ? "default" : "outline"}
            size="sm"
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar {consultasPorPacote} consultas por R$ {valorPacoteAdicional}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};