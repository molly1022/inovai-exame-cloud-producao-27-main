
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff, Phone, Mail, ArrowLeft } from "lucide-react";
import { patientLoginSchema, PatientLoginData } from "@/schemas/patient";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PatientLoginFormProps {
  onSubmit: (data: PatientLoginData) => Promise<void>;
  loading: boolean;
  clinica: any;
  clinicaLoading: boolean;
}

const PatientLoginForm = ({ 
  onSubmit, 
  loading, 
  clinica, 
  clinicaLoading 
}: PatientLoginFormProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { login: patientLogin } = usePatientAuth();
  const [loginData, setLoginData] = useState<PatientLoginData>({
    cpf: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = patientLoginSchema.parse(loginData);
      setErrors({});
      
      if (!clinica?.id) {
        setErrors({ general: 'Clínica não encontrada' });
        return;
      }

      const success = await patientLogin(validatedData.cpf, validatedData.senha);
      
      if (success) {
        navigate('/portal-paciente');
      }
    } catch (error: any) {
      if (error.errors) {
        const validationErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      }
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className={cn("text-center", isMobile ? "pb-2" : "pb-4")}>
        <div className={cn("flex items-center justify-between", isMobile ? "mb-2" : "mb-4")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            className={cn(
              "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
              isMobile ? "text-sm px-2" : ""
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Início
          </Button>
        </div>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Faça seu Login</CardTitle>
        <CardDescription className={isMobile ? "text-sm" : ""}>
          Entre com seu CPF e senha de acesso
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "space-y-3" : "space-y-4"}>
        <form onSubmit={handleSubmit} className={isMobile ? "space-y-3" : "space-y-4"}>
          <div className="space-y-2">
            <Label htmlFor="cpf" className={isMobile ? "text-sm" : ""}>CPF</Label>
            <div className="relative">
              <User className={cn(
                "absolute text-gray-400 z-10",
                isMobile ? "left-2 top-3 h-4 w-4" : "left-3 top-3 h-4 w-4"
              )} />
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={loginData.cpf}
                onChange={(e) => setLoginData(prev => ({ 
                  ...prev, 
                  cpf: formatCPF(e.target.value)
                }))}
                className={cn(
                  isMobile ? "pl-8 h-12" : "pl-10"
                )}
                maxLength={14}
                autoComplete="username"
                required
              />
            </div>
            {errors.cpf && <p className="text-sm text-red-600">{errors.cpf}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha" className={isMobile ? "text-sm" : ""}>Senha de Acesso</Label>
            <div className="relative">
              <Lock className={cn(
                "absolute text-gray-400 z-10",
                isMobile ? "left-2 top-3 h-4 w-4" : "left-3 top-3 h-4 w-4"
              )} />
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={loginData.senha}
                onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                className={cn(
                  "pr-10",
                  isMobile ? "pl-8 h-12" : "pl-10"
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
            {errors.senha && <p className="text-sm text-red-600">{errors.senha}</p>}
          </div>

          <Button 
            type="submit" 
            className={cn(
              "w-full bg-blue-600 hover:bg-blue-700",
              isMobile ? "h-12 text-base" : ""
            )}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className={cn("text-center text-gray-600", isMobile ? "mt-4 text-sm" : "mt-6 text-sm")}>
          <p>Não tem acesso? Entre em contato com a clínica.</p>
          <div className={cn(
            "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg",
            isMobile ? "mt-2" : "mt-4"
          )}>
            {clinicaLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-blue-700 dark:text-blue-300">Carregando informações...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {clinica?.telefone && (
                  <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Phone className="h-4 w-4" />
                    <span className={isMobile ? "text-sm" : ""}>{clinica.telefone}</span>
                  </div>
                )}
                {clinica?.email && (
                  <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Mail className="h-4 w-4" />
                    <span className={isMobile ? "text-sm" : ""}>{clinica.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientLoginForm;
