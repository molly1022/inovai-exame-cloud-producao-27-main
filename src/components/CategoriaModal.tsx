import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from 'lucide-react';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoria?: any;
  mode: 'create' | 'edit';
}

const CategoriaModal = ({ isOpen, onClose, onSuccess, categoria, mode }: CategoriaModalProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <CategoriaModalContent 
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        categoria={categoria}
        mode={mode}
      />
    </TenantGuard>
  );
};

const CategoriaModalContent = ({ isOpen, onClose, onSuccess, categoria, mode }: CategoriaModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Demonstração de Categoria</strong> - Funcionalidade completa estará disponível quando acessada via subdomínio da clínica específica.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 opacity-75">
          <div className="space-y-2">
            <Label>Nome da Categoria</Label>
            <Input placeholder="Exames de Sangue" disabled />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea placeholder="Categoria para exames laboratoriais de sangue" disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-500"></div>
                <Input type="color" value="#3B82F6" disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor Padrão</Label>
              <Input type="number" placeholder="150.00" disabled />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Categoria Ativa</Label>
            <Switch checked={true} disabled />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled>
            {mode === 'create' ? 'Criar Categoria (Demo)' : 'Salvar Alterações (Demo)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriaModal;