
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTenantSystem } from '@/hooks/useTenantSystem';
import { useToast } from '@/hooks/use-toast';
import { useClinica } from '@/hooks/useClinica';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exam?: any;
}

const ExamModal = ({ isOpen, onClose, onSuccess, exam }: ExamModalProps) => {
  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo: '',
    data_exame: '',
    comentarios: '',
    status: 'disponivel'
  });
  const [pacientes, setPacientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { clinica } = useClinica();
  const { query } = useTenantSystem();

  useEffect(() => {
    if (isOpen && clinica?.id) {
      fetchPacientes();
      fetchCategorias();
      if (exam) {
        setFormData({
          paciente_id: exam.paciente_id,
          tipo: exam.tipo,
          data_exame: exam.data_exame,
          comentarios: exam.comentarios || '',
          status: exam.status
        });
      }
    }
  }, [isOpen, exam, clinica]);

  const fetchPacientes = async () => {
    if (!clinica?.id) return;

    const { data } = await query('pacientes')
      .select('id, nome')
      .eq('clinica_id', clinica.id)
      .order('nome');
    setPacientes(data || []);
  };

  const fetchCategorias = async () => {
    if (!clinica?.id) return;

    const { data } = await query('categorias_exames')
      .select('id, nome')
      .eq('clinica_id', clinica.id)
      .eq('ativo', true)
      .order('nome');
    setCategorias(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clinica?.id) {
      toast({
        title: "Erro",
        description: "Clínica não encontrada. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const examData = {
        ...formData,
        clinica_id: clinica.id
      };

      if (exam) {
        const { error } = await query('exames')
          .update(examData)
          .eq('id', exam.id);
        if (error) throw error;
        toast({ title: "Exame atualizado com sucesso!" });
      } else {
        const { error } = await query('exames')
          .insert([examData]);
        if (error) throw error;
        toast({ title: "Exame criado com sucesso!" });
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar exame:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar exame",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      tipo: '',
      data_exame: '',
      comentarios: '',
      status: 'disponivel'
    });
  };

  if (!clinica) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Clínica não encontrada. Faça login novamente.</p>
            <Button onClick={onClose} className="mt-4">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{exam ? 'Editar Exame' : 'Novo Exame'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="paciente_id">Paciente *</Label>
            <Select value={formData.paciente_id} onValueChange={(value) => setFormData({...formData, paciente_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((paciente: any) => (
                  <SelectItem key={paciente.id} value={paciente.id}>
                    {paciente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Exame/Consulta *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria: any) => (
                  <SelectItem key={categoria.id} value={categoria.nome}>
                    {categoria.nome}
                  </SelectItem>
                ))}
                {categorias.length === 0 && (
                  <SelectItem value="Exame Geral">Exame Geral</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_exame">Data do Exame *</Label>
            <Input
              id="data_exame"
              type="date"
              value={formData.data_exame}
              onChange={(e) => setFormData({...formData, data_exame: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="revisao">Em Revisão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="comentarios">Comentários</Label>
            <Textarea
              id="comentarios"
              value={formData.comentarios}
              onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (exam ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamModal;
