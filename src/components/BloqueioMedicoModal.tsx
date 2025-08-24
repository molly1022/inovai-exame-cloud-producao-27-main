import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from 'lucide-react';

interface BloqueioMedicoModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clinicaId: string;
  medicos: { id: string; nome_completo: string }[];
  onSaved: () => void;
  editingBloqueio?: any;
}

const BloqueioMedicoModal: React.FC<BloqueioMedicoModalProps> = ({ open, onOpenChange, clinicaId, medicos, onSaved, editingBloqueio }) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <BloqueioMedicoModalContent 
        open={open}
        onOpenChange={onOpenChange}
        clinicaId={clinicaId}
        medicos={medicos}
        onSaved={onSaved}
        editingBloqueio={editingBloqueio}
      />
    </TenantGuard>
  );
};

const BloqueioMedicoModalContent: React.FC<BloqueioMedicoModalProps> = ({ open, onOpenChange, clinicaId, medicos, onSaved, editingBloqueio }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bloqueio de Médico</DialogTitle>
        </DialogHeader>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Demonstração de Bloqueio</strong> - Funcionalidade completa estará disponível quando acessada via subdomínio da clínica específica.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 opacity-75">
          <div className="space-y-2">
            <Label>Médico</Label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Dr. João Silva" />
              </SelectTrigger>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Bloqueio</Label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Dia completo" />
              </SelectTrigger>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input type="date" disabled />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input type="date" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Input placeholder="Férias programadas" disabled />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled>
            Salvar (Demo)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BloqueioMedicoModal;
