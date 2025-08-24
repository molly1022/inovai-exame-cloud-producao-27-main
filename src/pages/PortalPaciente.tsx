
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Calendar, FileText, LogOut, Heart } from "lucide-react";
import { usePatientAuth } from '@/hooks/usePatientAuth';
import PatientLoginForm from '@/components/patient/PatientLoginForm';
import { PatientLoginData } from '@/schemas/patient';

const PortalPaciente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, paciente, loading: authLoading, logout } = usePatientAuth();
  const [clinica, setClinica] = useState<any>(null);
  const [clinicaLoading, setClinicaLoading] = useState(true);

  useEffect(() => {
    loadClinicaInfo();
  }, []);

  const loadClinicaInfo = async () => {
    try {
      // Detectar subdomínio para identificar a clínica
      const hostname = window.location.hostname;
      let subdominio = 'clinica-1'; // padrão para desenvolvimento
      
      console.log('🔍 PortalPaciente - Detectando subdomínio do hostname:', hostname);
      
      if (!hostname.includes('localhost') && 
          !hostname.includes('127.0.0.1') && 
          !hostname.includes('lovable')) {
        const parts = hostname.split('.');
        if (parts.length >= 3 && parts[0] !== 'www') {
          subdominio = parts[0];
        }
      }

      console.log('🏥 Buscando clínica pelo subdomínio:', subdominio);

      // Buscar clínica pelo subdomínio na tabela central
      const { data, error } = await supabase
        .from('clinicas_central')
        .select('id, nome, email, telefone')
        .eq('subdominio', subdominio)
        .eq('status', 'ativa')
        .single();

      if (!error && data) {
        console.log('✅ Clínica encontrada:', data.nome);
        const clinicaInfo = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone
        };
        setClinica(clinicaInfo);
        
        // Configurar contexto da clínica
        localStorage.setItem('tenant_id', data.id);
        localStorage.setItem('clinica_id', data.id);
        localStorage.setItem('tenant_subdominio', subdominio);
      } else {
        console.error('❌ Erro ao carregar clínica ou clínica não encontrada:', error);
        setClinica({
          id: 'demo',
          nome: 'Clínica Demonstração',
          email: 'demo@clinica.com',
          telefone: '(11) 99999-9999'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar clínica:', error);
      setClinica({
        id: 'demo',
        nome: 'Clínica Demonstração',
        email: 'demo@clinica.com',
        telefone: '(11) 99999-9999'
      });
    } finally {
      setClinicaLoading(false);
    }
  };

  const handleLogin = async (data: PatientLoginData) => {
    // A lógica de login está no PatientLoginForm
    // Este handler é mantido para compatibilidade com a interface
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || clinicaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Carregando Portal</h3>
            <p className="text-sm text-muted-foreground text-center">
              Aguarde enquanto carregamos suas informações...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl w-16 h-16 flex items-center justify-center">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Portal do Paciente
              </h1>
              <p className="text-gray-600">
                {clinica ? `${clinica.nome}` : 'Acesse seus dados médicos'}
              </p>
            </div>
          </div>

          <PatientLoginForm
            onSubmit={handleLogin}
            loading={false}
            clinica={clinica}
            clinicaLoading={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bem-vindo(a), {paciente?.nome}
                </h1>
                <p className="text-gray-600">
                  {clinica?.nome}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Meus Agendamentos
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Próximas consultas e exames
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Meus Exames
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Resultados disponíveis
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Histórico Médico
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Receitas e atestados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Clínica */}
        {clinica && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
              <CardDescription>
                Dados para contato e localização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {clinica.telefone && (
                  <div>
                    <h4 className="font-medium">Telefone</h4>
                    <p className="text-sm text-muted-foreground">{clinica.telefone}</p>
                  </div>
                )}
                {clinica.email && (
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">{clinica.email}</p>
                  </div>
                )}
                {clinica.endereco && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium">Endereço</h4>
                    <p className="text-sm text-muted-foreground">{clinica.endereco}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PortalPaciente;
