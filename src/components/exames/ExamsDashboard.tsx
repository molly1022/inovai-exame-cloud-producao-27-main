import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Activity, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ExamsDashboardProps {
  exames: any[];
}

const ExamsDashboard = ({ exames }: ExamsDashboardProps) => {
  const today = new Date().toDateString();
  
  const stats = {
    total: exames.length,
    hoje: exames.filter(e => new Date(e.data_exame).toDateString() === today).length,
    disponiveis: exames.filter(e => e.status === 'disponivel').length,
    pendentes: exames.filter(e => e.status === 'pendente').length,
    entregues: exames.filter(e => e.status === 'entregue').length,
    emAnalise: exames.filter(e => e.status === 'em_analise').length,
  };

  const dashboardCards = [
    {
      title: "Total de Exames",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Exames Hoje",
      value: stats.hoje,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Disponíveis",
      value: stats.disponiveis,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950"
    },
    {
      title: "Pendentes",
      value: stats.pendentes,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950"
    },
    {
      title: "Em Análise",
      value: stats.emAnalise,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "Entregues",
      value: stats.entregues,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {dashboardCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ExamsDashboard;