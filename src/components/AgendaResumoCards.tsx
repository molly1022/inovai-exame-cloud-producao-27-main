
import MiniSparkline from "./MiniSparkline";
import { Calendar, Users, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Agendamento {
  id: string;
  data_agendamento: string;
  horario: string;
  tipo_exame: string;
  status: string;
  status_pagamento: string;
  valor_exame: number;
  valor_pago: number;
  observacoes?: string;
  pacientes: {
    nome: string;
    cpf: string;
  };
  medicos?: {
    nome_completo: string;
  };
  convenios?: {
    nome: string;
    cor: string;
  };
}

interface AgendaResumoCardsProps {
  agendamentos: Agendamento[];
  selectedDate: Date;
}

const Item = ({
  icon,
  title,
  value,
  color,
  data,
  bgClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  data: number[];
  bgClass: string;
}) => (
  <Card className={`flex-1 min-w-0 p-0 shadow-md transition border-0 overflow-hidden ${bgClass}`}>
    <CardContent className="flex items-center justify-between p-3 sm:p-4 h-full">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-white/50 p-2">{icon}</div>
        <div>
          <div className="text-xs text-gray-500 font-medium">{title}</div>
          <div className="font-bold text-xl text-gray-900 dark:text-white">{value}</div>
        </div>
      </div>
      <MiniSparkline data={data} color={color} />
    </CardContent>
  </Card>
);

const AgendaResumoCards = ({ agendamentos, selectedDate }: AgendaResumoCardsProps) => {
  // Calcular estatísticas dos agendamentos
  const agendamentosTotais = agendamentos.length;
  const pacientesUnicos = new Set(agendamentos.map(a => a.pacientes?.nome)).size;
  const medicosAtivos = new Set(agendamentos.map(a => a.medicos?.nome_completo).filter(Boolean)).size;
  
  // Gerar dados fictícios para o histórico (sparklines)
  const agendamentosHistorico = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5);
  const pacientesHistorico = Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 3);
  const medicosHistorico = Array.from({ length: 7 }, () => Math.floor(Math.random() * 8) + 2);

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:gap-4 mb-2">
      <Item
        icon={<Calendar className="text-blue-500" size={22} />}
        title="Agendamentos"
        value={agendamentosTotais}
        color="#3B82F6"
        data={agendamentosHistorico}
        bgClass="bg-gradient-to-tr from-blue-50 to-blue-100"
      />
      <Item
        icon={<Users className="text-green-500" size={22} />}
        title="Pacientes Únicos"
        value={pacientesUnicos}
        color="#22C55E"
        data={pacientesHistorico}
        bgClass="bg-gradient-to-tr from-green-50 to-green-100"
      />
      <Item
        icon={<Stethoscope className="text-violet-500" size={22} />}
        title="Médicos Ativos"
        value={medicosAtivos}
        color="#A78BFA"
        data={medicosHistorico}
        bgClass="bg-gradient-to-tr from-violet-50 to-violet-100"
      />
    </div>
  );
};

export default AgendaResumoCards;
