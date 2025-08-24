import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Globe, Loader2, Shield } from 'lucide-react';

interface SubdomainGuardProps {
  children: React.ReactNode;
  requireSubdomain?: boolean;
}

/**
 * Componente que força acesso apenas via subdomínio
 * Bloqueia acesso direto sem subdomínio válido
 */
export const SubdomainGuard = ({ children, requireSubdomain = true }: SubdomainGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [hasValidSubdomain, setHasValidSubdomain] = useState(false);
  const [detectedSubdomain, setDetectedSubdomain] = useState<string | null>(null);

  useEffect(() => {
    checkSubdomainAccess();
  }, []);

  const checkSubdomainAccess = () => {
    const hostname = window.location.hostname;
    console.log('🔍 SubdomainGuard - Verificando hostname:', hostname);

    // Desenvolvimento: sempre permitir (para testes)
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      setHasValidSubdomain(true);
      setDetectedSubdomain('bancomodelo');
      setLoading(false);
      return;
    }

    // Preview Lovable: sempre permitir
    if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
      setHasValidSubdomain(true);
      setDetectedSubdomain('bancomodelo');
      setLoading(false);
      return;
    }

    // Produção: verificar subdomínio para somosinovai.com
    const parts = hostname.split('.');
    
    if (!requireSubdomain) {
      setHasValidSubdomain(true);
      setLoading(false);
      return;
    }

    // Verificar se é o domínio correto (somosinovai.com)
    if (hostname.endsWith('.somosinovai.com') || hostname === 'somosinovai.com') {
      if (hostname === 'somosinovai.com') {
        // Acesso direto ao domínio raiz - redirecionar para bancomodelo
        console.log('🔀 Acesso ao domínio raiz - redirecionando para bancomodelo');
        redirectToSubdomain();
        return;
      }
      
      // Extrair subdomínio
      const subdomain = hostname.replace('.somosinovai.com', '');
      if (subdomain && subdomain !== 'www') {
        console.log('✅ Subdomínio válido detectado:', subdomain);
        setHasValidSubdomain(true);
        setDetectedSubdomain(subdomain);
      } else {
        console.log('❌ Subdomínio inválido ou vazio');
        setHasValidSubdomain(false);
      }
    } else {
      console.log('❌ Domínio não é somosinovai.com:', hostname);
      setHasValidSubdomain(false);
    }

    setLoading(false);
  };

  const redirectToSubdomain = () => {
    // Redirecionar para o subdomínio bancomodelo
    const baseUrl = window.location.protocol + '//';
    window.location.href = `${baseUrl}bancomodelo.somosinovai.com`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Verificando Acesso</h2>
                <p className="text-sm text-muted-foreground">
                  Validando subdomínio...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasValidSubdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-destructive/10 text-destructive p-3 rounded-full">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Acesso Restrito</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Este sistema utiliza acesso por subdomínio. Você deve acessar através do subdomínio da sua clínica.
                </p>
                
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Formato correto:</span>
                  </div>
                  <p className="text-sm font-mono text-primary mt-1">
                    sua-clinica.somosinovai.com
                  </p>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Cada clínica possui seu próprio subdomínio</p>
                  <p>• Entre em contato com o suporte se não souber seu subdomínio</p>
                  <p>• Acesso direto não é permitido por motivos de segurança</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={redirectToSubdomain} 
                  className="w-full"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Ir para Subdomínio Principal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Preciso saber o subdomínio da minha clínica', '_blank')}
                  className="w-full"
                >
                  Contatar Suporte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};