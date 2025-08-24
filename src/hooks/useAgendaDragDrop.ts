import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSensor, useSensors, MouseSensor, TouchSensor, type DragEndEvent } from "@dnd-kit/core";
import { useTenantConnection } from "@/hooks/useTenantConnection";

function toYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildLocalDate(selectedDate: Date, timeSlot: string) {
  const [h, m] = timeSlot.split(":").map(Number);
  const local = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  local.setHours(h || 0, m || 0, 0, 0);
  return local;
}

function addMinutesToTimeSlot(timeSlot: string, minutesToAdd: number | null | undefined) {
  if (!minutesToAdd) return null;
  const [h, m] = timeSlot.split(":").map(Number);
  const base = new Date();
  base.setHours(h || 0, m || 0, 0, 0);
  base.setMinutes(base.getMinutes() + minutesToAdd);
  const hh = String(base.getHours()).padStart(2, "0");
  const mm = String(base.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export const useAgendaDragDrop = (selectedDate: Date, onUpdate: () => void) => {
  const { toast } = useToast();
  const { query, isConnected } = useTenantConnection();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor)
  );

  const onDragEnd = async (event: DragEndEvent) => {
    if (!isConnected) {
      toast({
        title: "Sistema não conectado",
        description: "Não é possível mover agendamentos sem conexão com o banco operacional.",
        variant: "destructive",
      });
      return;
    }

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id || "");
    const overId = String(over.id || "");

    if (!activeId.startsWith("agendamento-") || !overId.startsWith("slot-")) return;

    const agendamentoId = activeId.replace("agendamento-", "");
    const newTimeSlot = overId.replace("slot-", "");

    const currentTimeSlot = active.data?.current?.timeSlot as string | undefined;
    if (currentTimeSlot === newTimeSlot) return; // nothing to do

    try {
      // Fetch required fields
      const { data, error: fetchErr } = await query("agendamentos")
        .select("id, medico_id, duracao_minutos")
        .eq("id", agendamentoId)
        .single();

      if (fetchErr) throw fetchErr;

      const existing: any = data;

      const ymd = toYmd(selectedDate);
      const duracao = typeof existing?.duracao_minutos === 'number' ? existing.duracao_minutos : undefined;
      const horarioFim = addMinutesToTimeSlot(newTimeSlot, duracao);

      // Validations
      if (existing?.medico_id) {
        const { data: disponivel, error: dispError } = await (supabase as any).rpc(
          "verificar_disponibilidade_medico",
          {
            p_medico_id: existing.medico_id,
            p_data: ymd,
            p_horario: newTimeSlot,
          }
        );
        if (dispError) throw dispError;
        if (disponivel === false) {
          toast({
            title: "Médico indisponível",
            description: "Há um bloqueio na escala do médico para este horário.",
            variant: "destructive",
          });
          return;
        }

        const { data: conflito, error: conflitoError } = await (supabase as any).rpc(
          "verificar_conflitos_agendamento",
          {
            p_medico_id: existing.medico_id,
            p_data_agendamento: ymd,
            p_horario_inicio: newTimeSlot,
            p_horario_fim: horarioFim,
            p_agendamento_excluir: agendamentoId,
          }
        );
        if (conflitoError) throw conflitoError;
        if (conflito?.conflito) {
          toast({
            title: "Conflito de horário",
            description: `Já existe consulta neste horário (${conflito.primeiro_conflito?.horario_inicio || ""} - ${
              conflito.primeiro_conflito?.horario_fim || ""
            }).`,
            variant: "destructive",
          });
          return;
        }
      }

      // Build final date
      const finalDate = buildLocalDate(selectedDate, newTimeSlot);

      const { error: updErr } = await query("agendamentos")
        .update({
          data_agendamento: finalDate.toISOString(),
          horario: newTimeSlot,
          horario_fim: horarioFim,
        })
        .eq("id", agendamentoId);

      if (updErr) throw updErr;

      toast({ title: "Agendamento movido", description: `Novo horário: ${newTimeSlot}` });
      onUpdate();
    } catch (error: any) {
      console.error("Erro ao mover agendamento:", error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível mover o agendamento.",
        variant: "destructive",
      });
    }
  };

  return { sensors, onDragEnd };
};
