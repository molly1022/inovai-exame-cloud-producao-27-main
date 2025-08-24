
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTenantSystem } from '@/hooks/useTenantSystem';
import { Save, X } from "lucide-react";

interface ExamEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  exame: any;
  onSuccess: () => void;
}

const ExamEditModal = ({ isOpen, onClose, exame, onSuccess }: ExamEditModalProps) => {
  const [comentarios, setComentarios] = useState(exame?.comentarios || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { query } = useTenantSystem();

  const handleSave = async () => {
    if (!exame) return;

    setSaving(true);
    try {
      const { error } = await query('exames')
        .update({ 
          comentarios: comentarios.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', exame.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Comentários salvos com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar comentários:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar comentários",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!exame) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Exame</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Exame</Label>
              <Input value={exame.tipo} disabled className="bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <Label>Data do Exame</Label>
              <Input value={formatDate(exame.data_exame)} disabled className="bg-gray-50 dark:bg-gray-800" />
            </div>
          </div>

          <div>
            <Label>Paciente</Label>
            <Input 
              value={`${exame.pacientes?.nome} - CPF: ${exame.pacientes?.cpf}`} 
              disabled 
              className="bg-gray-50 dark:bg-gray-800" 
            />
          </div>

          <div>
            <Label>Status</Label>
            <Input value={exame.status} disabled className="bg-gray-50 dark:bg-gray-800" />
          </div>

          <div>
            <Label htmlFor="comentarios">Comentários e Observações Médicas</Label>
            <Textarea
              id="comentarios"
              placeholder="Adicione seus comentários, observações ou laudos sobre este exame..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamEditModal;
