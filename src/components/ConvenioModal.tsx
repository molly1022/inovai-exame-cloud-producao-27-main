import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { X, Percent, Database } from "lucide-react";
import { useTenantId } from '@/hooks/useTenantId';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConvenioModalProps {
  isOpen: boolean;
  onClose: () => void;
  convenio?: any;
}

const ConvenioModal = ({ isOpen, onClose, convenio }: ConvenioModalProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <ConvenioModalContent 
        isOpen={isOpen}
        onClose={onClose}
        convenio={convenio}
      />
    </TenantGuard>
  );
};

const ConvenioModalContent = ({ isOpen, onClose, convenio }: ConvenioModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {convenio ? 'Editar Convênio' : 'Novo Convênio'}
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Demonstração de Convênio</strong> - Funcionalidade completa estará disponível quando acessada via subdomínio da clínica específica.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 opacity-75">
          <div className="space-y-2">
            <Label>Nome do Convênio</Label>
            <Input placeholder="Unimed" disabled />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea placeholder="Convênio médico Unimed" disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-green-500"></div>
                <Input type="color" value="#22C55E" disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Desconto (%)</Label>
              <Input type="number" placeholder="15" disabled />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Convênio Ativo</Label>
            <Switch checked={true} disabled />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled>
            {convenio ? 'Salvar Alterações (Demo)' : 'Criar Convênio (Demo)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvenioModal;