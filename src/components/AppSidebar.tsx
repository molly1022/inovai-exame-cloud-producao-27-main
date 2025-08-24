
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Heart, 
  LogOut, 
  Sun,
  Moon,
  Calendar,
  Settings,
  CreditCard,
  Home,
  Tag,
  UserCheck,
  Activity,
  Folder,
  Building,
  Pill,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Mail,
  Crown,
  ArrowRight,
  Zap,
  UserMinus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ui/theme-provider";
import { useClinica } from "@/hooks/useClinica";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useFeatureControl } from "@/hooks/useFeatureControl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { clinica } = useClinica();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();
  const [dashboardOpen, setDashboardOpen] = useState(
    location.pathname === '/dashboard' || location.pathname === '/dashboard-financeiro'
  );
  const { isFeatureBlocked, getPlanName, assinatura } = useFeatureControl();

  const isDark = theme === 'dark';
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/');
  };

  const handleMenuItemClick = () => {
    setOpenMobile(false);
  };

  const dashboardItems = [
    { icon: Home, label: 'Dashboard Principal', path: '/dashboard' },
    { icon: TrendingUp, label: 'Dashboard Financeiro', path: '/dashboard-financeiro' },
  ];

  const menuItems = [
    { icon: Calendar, label: 'Agendamentos', path: '/agenda' },
    { icon: Calendar, label: 'Escala Médicos', path: '/escala-medicos' },
    { icon: ClipboardList, label: 'Fila de Espera', path: '/fila-espera' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: ClipboardList, label: 'Prontuários', path: '/prontuarios' },
    { icon: Activity, label: 'Central de Exames', path: '/exames' },
    { icon: Pill, label: 'Receitas', path: '/receitas' },
    { icon: Heart, label: 'Médicos', path: '/medicos' },
    { icon: Users, label: 'Usuarios', path: '/funcionarios' },
    { icon: Users, label: 'Telemedicina', path: '/telemedicina', feature: 'telemedicina', requiredPlan: 'avancado_medico' },
    { icon: Activity, label: 'Monitoramento', path: '/monitoramento-funcionarios', feature: 'monitoramento', requiredPlan: 'avancado_medico' },
    { icon: UserMinus, label: 'Repasses', path: '/repasses', feature: 'repasses', requiredPlan: 'intermediario_medico' },
    { icon: FileText, label: 'Relatórios', path: '/relatorios', feature: 'relatorios', requiredPlan: 'intermediario_medico' },
    { icon: CreditCard, label: 'Pagamentos', path: '/pagamentos' },
    { icon: CreditCard, label: 'Convênios', path: '/convenios' },
    { icon: Folder, label: 'Categorias', path: '/categorias' },
    { icon: Mail, label: 'Configuração de Emails', path: '/configuracao-emails', feature: 'emails', requiredPlan: 'intermediario_medico' },
    { icon: Building, label: 'Perfil da Clínica', path: '/perfil-clinica' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const getUpgradeIcon = (plan: string) => {
    switch (plan) {
      case 'intermediario_medico': return <Zap className="h-3 w-3" />;
      case 'avancado_medico': return <Crown className="h-3 w-3" />;
      default: return <ArrowRight className="h-3 w-3" />;
    }
  };

  const getRequiredPlanName = (plan: string) => {
    switch (plan) {
      case 'intermediario_medico': return 'Intermediário';
      case 'avancado_medico': return 'Avançado';
      default: return plan;
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isDashboardActive = dashboardItems.some(item => isActive(item.path));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center space-x-3 p-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
            <Heart className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-bold truncate text-sidebar-foreground">
              {clinica?.nome || 'Inovai Pro'}
            </h1>
            <p className="text-sm text-sidebar-foreground/70">
              Dashboard
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard com submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  isActive={isDashboardActive}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center space-x-3">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </div>
                  {dashboardOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </SidebarMenuButton>
                
                {dashboardOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {dashboardItems.map((item) => (
                      <SidebarMenuButton key={item.path} asChild isActive={isActive(item.path)}>
                        <Link 
                          to={item.path} 
                          className="flex items-center space-x-3 text-sm"
                          onClick={handleMenuItemClick}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>

              {/* Outros itens do menu */}
              {menuItems.map((item) => {
                const isBlocked = item.feature && isFeatureBlocked(item.feature);
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <div className={`flex items-center ${isBlocked ? 'opacity-50' : ''}`}>
                      <SidebarMenuButton 
                        asChild={!isBlocked} 
                        isActive={isActive(item.path)}
                        className={`flex-1 ${isBlocked ? 'pointer-events-none' : ''}`}
                      >
                        {isBlocked ? (
                          <div className="flex items-center space-x-3 cursor-not-allowed">
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </div>
                        ) : (
                          <Link 
                            to={item.path} 
                            className="flex items-center space-x-3"
                            onClick={handleMenuItemClick}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                      
                      {isBlocked && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate('/pagamentos')}
                          className="ml-2 p-1 h-auto min-w-0 hover:bg-blue-100 group-data-[collapsible=icon]:hidden"
                          title={`Upgrade para ${getRequiredPlanName(item.requiredPlan || '')}`}
                        >
                          {getUpgradeIcon(item.requiredPlan || '')}
                        </Button>
                      )}
                    </div>
                  </SidebarMenuItem>
                );
              })}

              {/* DESATIVADO: Prontuários - Temporariamente comentado */}
              {/* 
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/prontuarios')}
                  className="opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="flex items-center space-x-3 text-gray-400">
                    <ClipboardList className="h-5 w-5" />
                    <span>Prontuários (Em desenvolvimento)</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 space-y-2">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="w-full flex items-center space-x-2 group-data-[collapsible=icon]:hidden"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </Button>
          
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center space-x-2 group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
