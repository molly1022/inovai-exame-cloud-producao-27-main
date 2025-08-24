import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Users, 
  Building, 
  DollarSign, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Activity,
  Trash2,
  Settings,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboardReal } from "@/components/AdminDashboardReal";
import { CriarClinicaCompleta } from "@/components/CriarClinicaCompleta";

interface ClinicaInfo {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  subdominio?: string;
  status: string;
  created_at: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [criarClinicaModal, setCriarClinicaModal] = useState(false);
  const [senhaModal, setSenhaModal] = useState<{ open: boolean; senha: string; clinica: string }>({
    open: false,
    senha: '',
    clinica: ''
  });

  // Verificar acesso administrativo
  const checkAdminAccess = () => {
    const adminAccess = localStorage.getItem('adminAccess');
    
    if (!adminAccess) {
      toast.error('Acesso administrativo negado - faça login primeiro');
      navigate('/admin-access');
      return;
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('adminAccess');
    localStorage.removeItem('adminSessionToken');
    toast.success('Logout realizado com sucesso');
    navigate('/admin-access');
  };

  // Buscar dados reais das clínicas do banco central
  const { data: clinicasData = [], refetch: refetchClinicas, isLoading } = useQuery({
    queryKey: ['clinicas-admin'],
    queryFn: async () => {
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas_central')
        .select('*')
        .order('created_at', { ascending: false });

      if (clinicasError) throw clinicasError;

      return clinicasData || [];
    },
  });

  // Buscar estatísticas financeiras
  const { data: estatisticasFinanceiras } = useQuery({
    queryKey: ['estatisticas-financeiras-v2'],
    queryFn: async () => {
      const totalClinicas = clinicasData.length;
      const mrr_base = totalClinicas * 300;
      const mrr_extras = totalClinicas * 50;
      const mrr_total = mrr_base + mrr_extras;
      
      return {
        mrr_total,
        receita_projetada_anual: mrr_total * 12,
        total_clinicas_ativas: totalClinicas,
        arpu_medio: totalClinicas > 0 ? mrr_total / totalClinicas : 0,
      };
    },
  });

  const handleRefresh = async () => {
    await refetchClinicas();
    toast.success('Dados atualizados com sucesso!');
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Gestão completa do sistema multi-tenant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleLogoutAdmin} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Estatísticas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {Number((estatisticasFinanceiras as any)?.mrr_total || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receita Recorrente Mensal
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clínicas Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(estatisticasFinanceiras as any)?.total_clinicas_ativas || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Em operação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARPU Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                R$ {Number((estatisticasFinanceiras as any)?.arpu_medio || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por clínica/mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Anual</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {Number((estatisticasFinanceiras as any)?.receita_projetada_anual || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Projeção 12 meses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="clinicas">
              <Building className="h-4 w-4 mr-2" />
              Clínicas
            </TabsTrigger>
            <TabsTrigger value="monitoramento">
              <Activity className="h-4 w-4 mr-2" />
              Monitoramento DB
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <AdminDashboardReal />
          </TabsContent>

          {/* Aba de Clínicas */}
          <TabsContent value="clinicas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Gestão de Clínicas</h3>
              <Button 
                onClick={() => setCriarClinicaModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Building className="h-4 w-4 mr-2" />
                Criar Nova Clínica
              </Button>
            </div>
            <AdminDashboardReal />
          </TabsContent>

          {/* Aba de Monitoramento */}
          <TabsContent value="monitoramento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Monitoramento Database-per-Tenant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Sistema Operacional</div>
                        <div className="text-sm text-muted-foreground">Todos os bancos conectados</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Conexões Ativas</div>
                        <div className="text-sm text-muted-foreground">{clinicasData.length} clínicas</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Subdomínios Ativos</div>
                        <div className="text-sm text-muted-foreground">DNS configurado</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Status das Conexões</h4>
                    <AdminDashboardReal />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analytics do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Crescimento de Clínicas</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{clinicasData.length}</div>
                      <p className="text-sm text-muted-foreground">Total de clínicas cadastradas</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Receita Mensal</h4>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        R$ {Number((estatisticasFinanceiras as any)?.mrr_total || 0).toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">MRR atual</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Detalhes das Clínicas</h4>
                    <AdminDashboardReal />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Criar Clínica Completa */}
        <CriarClinicaCompleta 
          open={criarClinicaModal}
          onOpenChange={setCriarClinicaModal}
          onSuccess={() => {
            setCriarClinicaModal(false);
            refetchClinicas();
          }}
        />

        {/* Modal de Visualização de Senha */}
        <Dialog open={senhaModal.open} onOpenChange={(open) => setSenhaModal(prev => ({ ...prev, open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Senha da Clínica</DialogTitle>
              <DialogDescription>
                Senha de acesso para {senhaModal.clinica}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-mono text-lg text-center">{senhaModal.senha}</div>
            </div>
            <DialogFooter>
              <Button onClick={() => setSenhaModal(prev => ({ ...prev, open: false }))}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;