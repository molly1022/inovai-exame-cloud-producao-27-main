
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  Calendar,
  Tag,
  UserCheck,
  Briefcase
} from "lucide-react";
import { useClinica } from "@/hooks/useClinica";
import { supabase } from '@/integrations/supabase/client';
import DashboardStatsCards from "@/components/DashboardStatsCards";
import AgendaSemanalDashboard from "@/components/AgendaSemanalDashboard";
import UltimosPacientes from "@/components/UltimosPacientes";
import UltimosExames from "@/components/UltimosExames";
import UltimosPagamentos from "@/components/UltimosPagamentos";
import { useNavigate } from 'react-router-dom';
import ProtectedSubscriptionRoute from '@/components/ProtectedSubscriptionRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {
  const [examesToday, setExamesToday] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Usar sistema otimizado apenas para verificar se está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação simples
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const tenantId = localStorage.getItem('tenant_id') || localStorage.getItem('clinica_id');
    
    if (!authStatus || !tenantId) {
      navigate('/clinica-login');
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [navigate]);

  const handleExamesTodayChange = (examesToday: number) => {
    setExamesToday(examesToday);
  };

  const isDashboardHome = location.pathname === '/dashboard';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado
  }

  return (
    <ProtectedSubscriptionRoute>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Bem-vindo ao painel de controle da sua clínica
            </p>
          </div>
        </div>
        
        <DashboardStatsCards onExamesTodayChange={handleExamesTodayChange} />
        
        <AgendaSemanalDashboard />
        
        <div className="grid gap-6 md:grid-cols-3">
          <UltimosPacientes />
          <UltimosExames />
          <UltimosPagamentos />
        </div>
      </div>
    </ProtectedSubscriptionRoute>
  );
};

export default Dashboard;
