import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReagendamento } from '@/hooks/useReagendamento';

interface ReagendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: any;
  onSuccess: () => void;
}

const ReagendarModal = ({ isOpen, onClose, agendamento, onSuccess }: ReagendarModalProps) => {
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const { reagendarConsulta, loading } = useReagendamento();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaData || !novoHorario || !motivo) {
      return;
    }

    const success = await reagendarConsulta(
      agendamento.id,
      novaData,
      novoHorario,
      motivo,
      observacoes
    );

    if (success) {
      setNovaData('');
      setNovoHorario('');
      setMotivo('');
      setObservacoes('');
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    setNovaData('');
    setNovoHorario('');
    setMotivo('');
    setObservacoes('');
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reagendar Consulta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nova-data">Nova Data</Label>
              <Input
                id="nova-data"
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                min={today}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="novo-horario">Novo Horário</Label>
              <Select value={novoHorario} onValueChange={setNovoHorario} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar horário" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 18 }, (_, i) => {
                    const hour = Math.floor(i / 2) + 7;
                    const minutes = i % 2 === 0 ? '00' : '30';
                    const time = `${hour.toString().padStart(2, '0')}:${minutes}`;
                    return (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="motivo">Motivo do Reagendamento</Label>
            <Select value={motivo} onValueChange={setMotivo} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solicitacao_paciente">Solicitação do paciente</SelectItem>
                <SelectItem value="solicitacao_medico">Solicitação do médico</SelectItem>
                <SelectItem value="indisponibilidade_clinica">Indisponibilidade da clínica</SelectItem>
                <SelectItem value="emergencia">Emergência</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o reagendamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Reagendando...' : 'Reagendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReagendarModal;