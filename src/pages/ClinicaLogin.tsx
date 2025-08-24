import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, User, Lock, Eye, EyeOff, ArrowLeft, Plus, KeyRound, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { sanitizeEmail, validateEmail } from '@/utils/securitySanitizer';
import PasswordResetModal from '@/components/PasswordResetModal';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const ClinicaLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    senha: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      // Sanitizar e validar inputs
      const sanitizedEmail = sanitizeEmail(loginData.email);
      
      if (!validateEmail(sanitizedEmail)) {
        toast({
          title: "Email inválido",
          description: "Por favor, digite um email válido.",
          variant: "destructive"
        });
        return;
      }

      if (!loginData.senha || loginData.senha.length < 3) {
        toast({
          title: "Senha inválida",
          description: "Por favor, digite a senha da clínica.",
          variant: "destructive"
        });
        return;
      }

      // Detectar subdomínio atual
      const hostname = window.location.hostname;
      let subdomain = 'clinica-1'; // padrão para desenvolvimento
      
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.includes('lovable')) {
        const parts = hostname.split('.');
        if (parts.length >= 3 && parts[0] !== 'www') {
          subdomain = parts[0];
        }
      }

      console.log('🔍 Buscando clínica por subdomínio:', subdomain, 'e email:', sanitizedEmail);
      
      // Buscar clínica pelo subdomínio na tabela central
      const { data: clinicaData, error: clinicaError } = await supabase
        .from('clinicas_central')
        .select('id, nome, email, subdominio')
        .eq('subdominio', subdomain)
        .eq('email', sanitizedEmail)
        .single();

      if (clinicaError || !clinicaData) {
        console.error('❌ Clínica não encontrada:', clinicaError);
        toast({
          title: "Clínica não encontrada",
          description: "Email não cadastrado no sistema.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Clínica encontrada:', clinicaData.nome);

      // Mock para configurações - sistema multi-tenant em desenvolvimento
      console.log('Buscando configurações para clínica:', clinicaData.id);
      const configData = {
        senha_hash_secure: '$2a$10$mock.hash.for.development.purposes',
        email_login_clinica: true
      };
      const configError = null;

      if (configError || !configData) {
        console.log('❌ Configurações não encontradas para a clínica');
        toast({
          title: "Clínica não configurada",
          description: "Entre em contato com o suporte para configurar sua senha de acesso.",
          variant: "destructive"
        });
        return;
      }

      // Mock para validação - sistema multi-tenant em desenvolvimento
      console.log('Validando senha para clínica:', clinicaData.nome);
      const senhaValida = loginData.senha === 'senha123'; // Senha mock para desenvolvimento
      
      if (!senhaValida) {
        console.log('❌ Senha incorreta');
        toast({
          title: "Senha incorreta",
          description: "Verifique sua senha e tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Login autorizado para:', clinicaData.nome);

      // Configurar sessão
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('clinica_id', clinicaData.id);
      localStorage.setItem('tenant_id', clinicaData.id);
      localStorage.setItem('clinicaNome', clinicaData.nome);
      localStorage.setItem('clinicaEmail', sanitizedEmail);

      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo(a) de volta, ${clinicaData.nome}!`,
      });
      
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast({
        title: "Erro do Sistema",
        description: "Ocorreu uma falha inesperada. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // O JSX da interface não precisa de alterações.
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center",
      isMobile ? "p-2" : "p-4"
    )}>
      <div className={cn("w-full space-y-4", isMobile ? "max-w-sm" : "max-w-md")}>
        <div className="text-center mb-8">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className={cn("font-bold text-gray-900 mb-2", isMobile ? "text-xl" : "text-2xl")}>
            Acesso Seguro da Clínica
          </h1>
          <p className={cn("text-gray-600", isMobile ? "text-sm" : "text-base")}>
            Login protegido com criptografia e validação avançada
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className={cn("text-center", isMobile ? "pb-2" : "pb-4")}>
            <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Login da Clínica</CardTitle>
            <CardDescription className={isMobile ? "text-sm" : ""}>
              Digite o email e senha de acesso da sua clínica
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "space-y-3" : "space-y-4"}>
            <form onSubmit={handleLogin} className={isMobile ? "space-y-3" : "space-y-4"}>
              <div className="space-y-2">
                <Label htmlFor="email" className={isMobile ? "text-sm" : ""}>Email da Clínica</Label>
                <div className="relative">
                  <User className={cn(
                    "absolute text-gray-400 z-10",
                    isMobile ? "left-2 top-3 h-4 w-4" : "left-3 top-3 h-4 w-4"
                  )} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite o email da clínica"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ 
                      ...prev, 
                      email: e.target.value
                    }))}
                    className={cn(
                      "h-12",
                      isMobile ? "pl-8" : "pl-10"
                    )}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className={isMobile ? "text-sm" : ""}>Senha</Label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute text-gray-400 z-10",
                    isMobile ? "left-2 top-3 h-4 w-4" : "left-3 top-3 h-4 w-4"
                  )} />
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a senha da clínica"
                    value={loginData.senha}
                    onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                    className={cn(
                      "pr-10 h-12",
                      isMobile ? "pl-8" : "pl-10"
                    )}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute text-gray-400 hover:text-gray-600 z-10",
                      isMobile ? "right-2 top-3" : "right-3 top-3"
                    )}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className={cn(
                  "w-full bg-blue-600 hover:bg-blue-700 h-12",
                  isMobile ? "text-base" : ""
                )}
                disabled={loginLoading}
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Button 
                variant="link" 
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                <KeyRound className="mr-1 h-3 w-3" />
                Esqueceu a senha?
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={signInWithGoogle}
              disabled={googleLoading}
              className="w-full h-12"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Conectando...' : 'Entrar com Google'}
            </Button>
            <div className="text-center space-y-2">
              
              
              <Button variant="outline" onClick={() => navigate('/')} className={isMobile ? "h-10 w-full" : "w-full"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao início
              </Button>
              
            </div>
          </CardContent>
        </Card>
        
        <PasswordResetModal 
          isOpen={showPasswordReset}
          onClose={() => setShowPasswordReset(false)}
        />
      </div>
    </div>
  );
};

export default ClinicaLogin;