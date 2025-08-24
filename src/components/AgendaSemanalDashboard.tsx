import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from 'lucide-react';
import { cn } from "@/lib/utils";

const diasSemanaPt = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatPtBrDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const AgendaSemanalDashboard = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <DashboardContent />
    </TenantGuard>
  );
};

const DashboardContent = () => {
  const [dias, setDias] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  
  // Dados simulados para demonstração
  const contagemAgendamentos = [3, 8, 5, 12, 7, 9, 4];

  useEffect(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const arrayDias = Array.from({ length: 7 }, (_, i) => addDays(hoje, i));
    setDias(arrayDias);
    setSelectedDay(hoje);
  }, []);

  const handleCardClick = (dia: Date) => {
    console.log('Dia selecionado na agenda semanal (simulação):', dia);
    setSelectedDay(dia);
  };

  const mesAtual = dias[0]?.toLocaleString("pt-BR", { month: "long" }) || "";
  const anoAtual = dias[0]?.getFullYear() || new Date().getFullYear();

  return (
    <div className="mb-6 space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Demonstração da Agenda Semanal</strong> - Dados reais estarão disponíveis quando acessado via subdomínio da clínica específica.
        </AlertDescription>
      </Alert>

      <div className="opacity-75">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Filtro de Agenda
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Visualize os exames e agendamentos da semana. Clique no dia para filtrar detalhes.
            </p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center gap-2">
            <span className="font-semibold capitalize text-blue-700 px-2">
              {mesAtual} {anoAtual}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {dias.map((dia, i) => {
            const isToday = isSameDay(dia, new Date());
            const isSelected = isSameDay(dia, selectedDay);
            const weekdayIndex = dia.getDay();
            return (
              <button
                key={i}
                className={cn(
                  "w-full rounded-2xl border p-3 pb-4 shadow-sm text-left transition-all group hover:scale-105 focus:outline-none relative",
                  isSelected
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white"
                    : "bg-gradient-to-br from-blue-50 to-purple-100 border-blue-200 text-blue-950 dark:text-white",
                  isToday && !isSelected ? "ring-2 ring-blue-400" : ""
                )}
                onClick={() => handleCardClick(dia)}
              >
                <div className="font-semibold text-base flex items-center gap-1">
                  {diasSemanaPt[weekdayIndex]}{" "}
                  <span className="inline-block text-xs px-2 py-0.5 ml-1 rounded bg-white/30 dark:bg-gray-800/30">
                    {formatPtBrDate(dia)}
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-4 text-3xl font-bold tracking-tight",
                    isSelected
                      ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                      : "text-blue-700"
                  )}
                >
                  {contagemAgendamentos[i] ?? 0}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium absolute bottom-1 right-2 bg-white/40 px-2 py-0.5 rounded",
                    isSelected ? "text-purple-700" : "text-blue-800"
                  )}
                > 
                </span>
                {isToday && !isSelected && (
                  <span className="absolute top-2 right-2 bg-blue-400 text-white rounded px-2 py-0.5 text-xs shadow">
                    Hoje
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgendaSemanalDashboard;