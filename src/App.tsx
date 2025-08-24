import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { TenantRouter } from "@/components/TenantRouter";
import { SubdomainGuard } from "@/components/SubdomainGuard";
import { TenantSystemTest } from "@/components/TenantSystemTest";
import { SystemStatusTest } from "@/components/SystemStatusTest";
import { DatabaseProvider } from "@/hooks/useDatabasePerTenant";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedFuncionarioRoute from "@/components/ProtectedFuncionarioRoute";
import ProtectedMedicoRoute from "@/components/ProtectedMedicoRoute";
import ProtectedSubscriptionRoute from "@/components/ProtectedSubscriptionRoute";
import DashboardLayout from "@/components/DashboardLayout";

// Importações de páginas
import EnhancedIndex from "./pages/EnhancedIndex";
import JuvonnoLanding from "./pages/JuvonnoLanding";
import PricingPage from "./pages/PricingPage";
import ProprietariosClinica from "./pages/ProprietariosClinica";
import AgendamentoPage from "./pages/AgendamentoPage";
import FaturamentoPage from "./pages/FaturamentoPage";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import ProntuarioPaciente from "./pages/ProntuarioPaciente";
import Exames from "./pages/Exames";
import Receitas from "./pages/Receitas";
import AtestadosMedicos from "./pages/AtestadosMedicos";
import Medicos from "./pages/Medicos";
import Funcionarios from "./pages/Funcionarios";
import Categorias from "./pages/Categorias";
import Convenios from "./pages/Convenios";
import Agenda from "./pages/Agenda";
import Relatorios from "./pages/Relatorios";
import Pagamentos from "./pages/Pagamentos";
import ConfiguracoesClinica from "./pages/ConfiguracoesClinica";
import PerfilClinica from "./pages/PerfilClinica";
import MonitoramentoFuncionarios from "./pages/MonitoramentoFuncionarios";
import CentralExames from "./pages/CentralExames";
import ConfiguracaoEmails from "./pages/ConfiguracaoEmails";
import ClinicaLogin from "./pages/ClinicaLogin";
import FuncionarioLogin from "./pages/FuncionarioLogin";
import MedicoLogin from "./pages/MedicoLogin";
import FuncionarioDashboard from "./pages/FuncionarioDashboard";
import FuncionarioPacientes from "./pages/FuncionarioPacientes";
import FuncionarioProntuarios from "./pages/FuncionarioProntuarios";
import FuncionarioExames from "./pages/FuncionarioExames";
import FuncionarioAgenda from "./pages/FuncionarioAgenda";
import FuncionarioPerfil from "./pages/FuncionarioPerfil";
import PortalPaciente from "./pages/PortalPaciente";
import PortalMedico from "./pages/PortalMedico";
import NovaClinica from "./pages/NovaClinica";
import AdminCentral from "./pages/AdminCentral";
import AdminAccess from "./pages/AdminAccess";
import NotFound from "./pages/NotFound";
import DashboardFinanceiro from "./pages/DashboardFinanceiro";
import Telemedicina from "./pages/Telemedicina";
import MedicoTelemedicina from "./pages/MedicoTelemedicina";
import PacienteTelemedicina from "./pages/PacienteTelemedicina";
import Repasses from "./pages/Repasses";
import TeleconsultaTester from "./components/TeleconsultaTester";
import EscalaMedicos from "./pages/EscalaMedicos";
import FilaEspera from "./pages/FilaEspera";
import AdminGerenciarClinicas from "./pages/AdminGerenciarClinicas";
import ContatoComercial from "./pages/ContatoComercial";
import Prontuarios from "./pages/Prontuarios";
import TesteDatabasePerTenant from "./pages/TesteDatabasePerTenant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Rotas públicas - sem multi-tenant */}
            <Route path="/" element={<JuvonnoLanding />} />
            <Route path="/enhanced" element={<EnhancedIndex />} />
            <Route path="/precos" element={<PricingPage />} />
            <Route path="/proprietarios-clinica" element={<ProprietariosClinica />} />
            <Route path="/agendamento" element={<AgendamentoPage />} />
            <Route path="/faturamento" element={<FaturamentoPage />} />
            <Route path="/contato-comercial" element={<ContatoComercial />} />
            
            {/* Rotas administrativas - sem multi-tenant */}
            <Route path="/admin-access" element={<AdminAccess />} />
            <Route path="/admin" element={<AdminGerenciarClinicas />} />
            <Route path="/admin/inscricoes" element={<AdminCentral />} />
            <Route path="/admin/gerenciar-clinicas" element={<AdminGerenciarClinicas />} />
            
            {/* Testes do sistema */}
            <Route path="/tenant-test" element={<TenantSystemTest />} />
            <Route path="/system-test" element={<div className="container mx-auto p-6 flex justify-center"><SystemStatusTest /></div>} />
            
            <Route path="/teste-database" element={<TesteDatabasePerTenant />} />
            <Route path="/nova-clinica" element={
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <h1 className="text-2xl font-bold text-foreground">Cadastro de Clínicas Restrito</h1>
                  <p className="text-muted-foreground">O cadastro de novas clínicas agora é feito apenas pelo administrador do sistema.</p>
                  <p className="text-sm text-muted-foreground">Entre em contato comercial para solicitar sua clínica.</p>
                  <Button onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de cadastrar minha clínica no sistema', '_blank')}>
                    Contato Comercial
                  </Button>
                </div>
              </div>
            } />

            {/* Login pages - COM multi-tenant */}
            <Route path="/clinica-login" element={
              <TenantRouter>
                <ClinicaLogin />
              </TenantRouter>
            } />
            <Route path="/funcionario-login" element={
              <TenantRouter>
                <FuncionarioLogin />
              </TenantRouter>
            } />
            <Route path="/medico-login" element={
              <TenantRouter>
                <MedicoLogin />
              </TenantRouter>
            } />
            
            {/* Portais - COM multi-tenant */}
            <Route path="/portal-paciente" element={
              <TenantRouter>
                <PortalPaciente />
              </TenantRouter>
            } />
            <Route path="/portal-paciente/:cpf/:senha" element={
              <TenantRouter>
                <PortalPaciente />
              </TenantRouter>
            } />
            <Route path="/portal-medico" element={
              <TenantRouter>
                <PortalMedico />
              </TenantRouter>
            } />
            <Route path="/portal-medico/:cpf/:senha" element={
              <TenantRouter>
                <PortalMedico />
              </TenantRouter>
            } />
            
            {/* Telemedicina - COM multi-tenant */}
            <Route path="/medico-telemedicina/:agendamento_id" element={
              <TenantRouter>
                <MedicoTelemedicina />
              </TenantRouter>
            } />
            <Route path="/paciente-telemedicina/:agendamento_id" element={
              <TenantRouter>
                <PacienteTelemedicina />
              </TenantRouter>
            } />
            
            {/* Rotas operacionais da clínica - COM multi-tenant */}
            <Route path="/dashboard" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <ProtectedSubscriptionRoute>
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </ProtectedSubscriptionRoute>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/pacientes" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <ProtectedSubscriptionRoute>
                      <DashboardLayout>
                        <Pacientes />
                      </DashboardLayout>
                    </ProtectedSubscriptionRoute>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/prontuarios" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Prontuarios />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/prontuarios/:id" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProntuarioPaciente />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/exames" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CentralExames />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/receitas" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Receitas />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/atestados-medicos" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AtestadosMedicos />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/medicos" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Medicos />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/funcionarios" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Funcionarios />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/categorias" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Categorias />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/convenios" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Convenios />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/agenda" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <ProtectedSubscriptionRoute>
                      <DashboardLayout>
                        <Agenda />
                      </DashboardLayout>
                    </ProtectedSubscriptionRoute>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/escala-medicos" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EscalaMedicos />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/fila-espera" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <FilaEspera />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/relatorios" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Relatorios />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/pagamentos" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Pagamentos />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/configuracoes" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ConfiguracoesClinica />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/configuracao-emails" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ConfiguracaoEmails />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/perfil-clinica" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PerfilClinica />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/monitoramento-funcionarios" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MonitoramentoFuncionarios />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/central-exames" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CentralExames />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/dashboard-financeiro" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardFinanceiro />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/telemedicina" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Telemedicina />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/telemedicina-diagnostico" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TeleconsultaTester />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            <Route path="/repasses" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Repasses />
                    </DashboardLayout>
                  </ProtectedRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            
            {/* Rotas aninhadas do funcionário - COM multi-tenant */}
            <Route path="/funcionario-dashboard" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedFuncionarioRoute>
                    <FuncionarioDashboard />
                  </ProtectedFuncionarioRoute>
                </DatabaseProvider>
              </TenantRouter>
            }>
              <Route path="agenda" element={<FuncionarioAgenda />} />
              <Route path="pacientes" element={<FuncionarioPacientes />} />
              <Route path="prontuarios" element={<FuncionarioProntuarios />} />
              <Route path="exames" element={<FuncionarioExames />} />
              <Route path="perfil" element={<FuncionarioPerfil />} />
            </Route>
            
            <Route path="/funcionario-dashboard/prontuarios/:id" element={
              <TenantRouter>
                <DatabaseProvider>
                  <ProtectedFuncionarioRoute>
                    <ProntuarioPaciente />
                  </ProtectedFuncionarioRoute>
                </DatabaseProvider>
              </TenantRouter>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;