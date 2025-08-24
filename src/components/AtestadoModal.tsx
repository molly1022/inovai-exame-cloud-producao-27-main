import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FileText, User, Stethoscope, Printer, Database } from 'lucide-react';
import PatientSelect from '@/components/PatientSelect';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTenantId } from '@/hooks/useTenantId';
import { useAtestadoPDF } from '@/hooks/useAtestadoPDF';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AtestadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pacienteId?: string;
  medicoId?: string;
  atestado?: any;
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
}

interface Medico {
  id: string;
  nome_completo: string;
  crm?: string;
  coren?: string;
  especialidade?: string;
}

const AtestadoModal = ({ isOpen, onClose, onSuccess, pacienteId, medicoId, atestado }: AtestadoModalProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <AtestadoModalContent
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        pacienteId={pacienteId}
        medicoId={medicoId}
        atestado={atestado}
      />
    </TenantGuard>
  );
};

const AtestadoModalContent = ({ isOpen, onClose, onSuccess, pacienteId, medicoId, atestado }: AtestadoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Novo Atestado Médico
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Demonstração de Atestado</strong> - Funcionalidade completa estará disponível quando acessada via subdomínio da clínica específica.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 opacity-75">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="João Silva - 123.456.789-00" />
                </SelectTrigger>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Médico *</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Dr. Maria Santos - CRM 12345" />
                </SelectTrigger>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CID (Opcional)</Label>
              <Input placeholder="Z76.3" disabled />
            </div>

            <div className="space-y-2">
              <Label>Dias de Afastamento *</Label>
              <Input type="number" value="3" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações/Justificativa *</Label>
            <Textarea 
              placeholder="Necessário afastamento para repouso médico devido a quadro gripal..."
              rows={4}
              disabled
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button disabled>
            Criar Atestado (Demo)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AtestadoModal;