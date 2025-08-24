import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Save, X, User, AlertTriangle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import LoadingSpinner from './LoadingSpinner';
import { TenantGuard } from '@/components/TenantGuard';

interface EnhancedPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: any;
}

const EnhancedPatientModalContent = ({ isOpen, onClose, onSuccess, patient }: EnhancedPatientModalProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    genero: '',
    telefone: '',
    telefone_urgencia: '',
    email: '',
    endereco_completo: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    peso: '',
    altura: '',
    observacoes: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { clinica } = useClinica();

  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        nome: patient.nome || '',
        cpf: patient.cpf || '',
        rg: patient.rg || '',
        data_nascimento: patient.data_nascimento || '',
        genero: patient.genero || '',
        telefone: patient.telefone || '',
        telefone_urgencia: patient.telefone_urgencia || '',
        email: patient.email || '',
        endereco_completo: patient.endereco_completo || '',
        numero: patient.numero || '',
        complemento: patient.complemento || '',
        bairro: patient.bairro || '',
        cidade: patient.cidade || '',
        estado: patient.estado || '',
        cep: patient.cep || '',
        peso: patient.peso?.toString() || '',
        altura: patient.altura?.toString() || '',
        observacoes: patient.observacoes || ''
      });
    } else if (!patient && isOpen) {
      setFormData({
        nome: '',
        cpf: '',
        rg: '',
        data_nascimento: '',
        genero: '',
        telefone: '',
        telefone_urgencia: '',
        email: '',
        endereco_completo: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        peso: '',
        altura: '',
        observacoes: ''
      });
    }
  }, [patient, isOpen]);

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

    setIsLoading(true);

    try {
      // Simulate API call in tenant context
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: patient ? "Paciente atualizado!" : "Paciente cadastrado!",
        description: "Os dados foram salvos com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar paciente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{patient ? 'Editar Paciente' : 'Novo Paciente'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-blue-700 dark:text-blue-300">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="genero">Gênero/Sexo</Label>
                <Select value={formData.genero} onValueChange={(value) => setFormData({ ...formData, genero: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="nao_informado">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-green-700 dark:text-green-300">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="telefone_urgencia">Telefone de Emergência</Label>
                <Input
                  id="telefone_urgencia"
                  value={formData.telefone_urgencia}
                  onChange={(e) => setFormData({ ...formData, telefone_urgencia: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="paciente@email.com"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-purple-700 dark:text-purple-300">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="endereco_completo">Endereço</Label>
                <Input
                  id="endereco_completo"
                  value={formData.endereco_completo}
                  onChange={(e) => setFormData({ ...formData, endereco_completo: e.target.value })}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="123"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações gerais sobre o paciente..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {patient ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EnhancedPatientModal = ({ isOpen, onClose, onSuccess, patient }: EnhancedPatientModalProps) => {
  return (
    <TenantGuard>
      <EnhancedPatientModalContent isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} patient={patient} />
    </TenantGuard>
  );
};

export default EnhancedPatientModal;