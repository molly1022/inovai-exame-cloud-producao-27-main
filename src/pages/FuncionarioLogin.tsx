
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, ArrowLeft } from "lucide-react";
import { useFuncionarioAuth } from "@/hooks/useFuncionarioAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const FuncionarioLogin = () => {
  const { login } = useFuncionarioAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Detectar subdomínio para identificar a clínica
      const hostname = window.location.hostname;
      let subdomain = 'clinica-1';
      
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.includes('lovable')) {
        const parts = hostname.split('.');
        if (parts.length >= 3 && parts[0] !== 'www') {
          subdomain = parts[0];
        }
      }
      
      // Configurar contexto da clínica antes do login
      localStorage.setItem('tenant_subdominio', subdomain);
      
      const result = await login(cpf, senha);
      
      if (result.success) {
        navigate('/funcionario-dashboard');
      }
    } catch (error) {
      console.error('Erro no login do funcionário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800",
      isMobile ? "p-2" : "p-4"
    )}>
      <Card className={cn("w-full", isMobile ? "max-w-sm" : "max-w-md")}>
        <CardHeader className={cn("text-center space-y-4", isMobile ? "space-y-2" : "space-y-4")}>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full">
              <UserCheck className="h-8 w-8" />
            </div>
          </div>
          <div>
            <CardTitle className={cn("font-bold", isMobile ? "text-lg" : "text-2xl")}>
              Acesso do Funcionário
            </CardTitle>
            <CardDescription className={isMobile ? "text-sm" : ""}>
              Entre com seu CPF e senha para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "space-y-3" : "space-y-4"}>
          <form onSubmit={handleSubmit} className={isMobile ? "space-y-3" : "space-y-4"}>
            <div className="space-y-2">
              <Label htmlFor="cpf" className={isMobile ? "text-sm" : ""}>CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className={isMobile ? "h-12" : ""}
                autoComplete="username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha" className={isMobile ? "text-sm" : ""}>Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={isMobile ? "h-12" : ""}
                autoComplete="current-password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className={cn(
                "w-full",
                isMobile ? "h-12 text-base" : ""
              )} 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Button variant="outline" onClick={() => navigate('/')} className={isMobile ? "h-10 w-full" : "w-full"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
          </div>

          
        </CardContent>
      </Card>
    </div>
  );
};

export default FuncionarioLogin;
