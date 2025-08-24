import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Plus, 
  Settings, 
  BarChart3, 
  Shield, 
  Database,
  Activity,
  Users,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CriarClinicaCentralModal } from '@/components/CriarClinicaCentralModal';
import { ClinicasTable } from '@/components/ClinicasTable';
import { MetricasSistema } from '@/components/MetricasSistema';
import { LogsSistema } from '@/components/LogsSistema';
import { ConfiguracoesSistema } from '@/components/ConfiguracoesSistema';
import { useToast } from '@/hooks/use-toast';

interface ClinicaCentral {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string;
  telefone: string | null;
  endereco: string | null;
  subdominio: string;
  status: 'ativa' | 'inativa' | 'suspensa' | 'bloqueada';
  plano_id: string | null;
  database_url: string | null;
  database_name: string | null;
  configuracoes: any;
  limites: any;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  last_access: string | null;
}

interface PlanoSistema {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  periodicidade: 'mensal' | 'anual' | 'lifetime';
  limites: any;
  recursos: any;
  ativo: boolean;
  ordem: number;
}

export default function AdminCentral() {
  const [clinicas, setClinicas] = useState<ClinicaCentral[]>([]);
  const [planos, setPlanos] = useState<PlanoSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const fetchClinicas = async () => {
    try {
      // Dados demo para single-tenant
      const clinicasDemo = [
        {
          id: 'single-tenant-id',
          nome_clinica: 'Clínica Modelo',
          subdominio: 'clinica-modelo',
          status: 'ativa',
          plano_contratado: 'basico',
          email_responsavel: 'admin@clinica-modelo.com'
        }
      ];
      setClinicas(clinicasDemo as any);
    } catch (error: any) {
      console.error('Erro ao buscar clínicas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as clínicas",
        variant: "destructive"
      });
    }
  };

  const fetchPlanos = async () => {
    try {
      // Dados demo para single-tenant
      const planosDemo: PlanoSistema[] = [
        {
          id: '1',
          nome: 'Básico',
          descricao: 'Plano básico para clínicas pequenas',
          preco: 125.00,
          periodicidade: 'mensal',
          limites: { medicos: 5, funcionarios: 4 },
          recursos: { telemedicina: true },
          ativo: true,
          ordem: 1
        }
      ];
      setPlanos(planosDemo);
    } catch (error: any) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro", 
        description: "Não foi possível carregar os planos",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchClinicas(), fetchPlanos()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleClinicaCriada = () => {
    setModalOpen(false);
    fetchClinicas();
    toast({
      title: "Sucesso",
      description: "Clínica criada com sucesso!"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'inativa': return 'bg-gray-500'; 
      case 'suspensa': return 'bg-yellow-500';
      case 'bloqueada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const stats = {
    totalClinicas: clinicas.length,
    clinicasAtivas: clinicas.filter(c => c.status === 'ativa').length,
    clinicasInativas: clinicas.filter(c => c.status === 'inativa').length,
    clinicasSuspensas: clinicas.filter(c => c.status === 'suspensa').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Painel Administrativo Central</h1>
                <p className="text-sm text-muted-foreground">Gerenciamento do sistema multi-clínicas</p>
              </div>
            </div>
            <Button onClick={() => setModalOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nova Clínica</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="clinicas" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Clínicas</span>
            </TabsTrigger>
            <TabsTrigger value="metricas" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clínicas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClinicas}</div>
                  <p className="text-xs text-muted-foreground">Todas as clínicas registradas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clínicas Ativas</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.clinicasAtivas}</div>
                  <p className="text-xs text-muted-foreground">Em funcionamento normal</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suspensas/Bloqueadas</CardTitle>
                  <Shield className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.clinicasSuspensas}</div>
                  <p className="text-xs text-muted-foreground">Requerem atenção</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Planos Disponíveis</CardTitle>
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{planos.length}</div>
                  <p className="text-xs text-muted-foreground">Opções de planos</p>
                </CardContent>
              </Card>
            </div>

            {/* Visão geral das clínicas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Clínicas Criadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clinicas.slice(0, 5).map((clinica) => (
                      <div key={clinica.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{clinica.nome}</p>
                          <p className="text-sm text-muted-foreground">{clinica.subdominio}.somosinovai.com</p>
                        </div>
                        <Badge className={`text-white ${getStatusColor(clinica.status)}`}>
                          {clinica.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Planos do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {planos.map((plano) => (
                      <div key={plano.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{plano.nome}</p>
                          <p className="text-sm text-muted-foreground">{plano.descricao}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">R$ {plano.preco.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{plano.periodicidade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clinicas">
            <ClinicasTable 
              clinicas={clinicas} 
              planos={planos}
              onRefresh={fetchClinicas}
            />
          </TabsContent>

          <TabsContent value="metricas">
            <MetricasSistema />
          </TabsContent>

          <TabsContent value="logs">
            <LogsSistema />
          </TabsContent>

          <TabsContent value="configuracoes">
            <ConfiguracoesSistema />
          </TabsContent>
        </Tabs>
      </div>

      <CriarClinicaCentralModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleClinicaCriada}
        planos={planos}
      />
    </div>
  );
}