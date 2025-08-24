import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';
import { getPatientAvatar } from "@/utils/getPatientAvatar";

interface PatientFormData {
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  genero: string;
  email: string;
  telefone: string;
  telefone_urgencia: string;
  endereco_completo: string;
  cep: string;
  cidade: string;
  bairro: string;
  numero: string;
  nome_mae: string;
  nome_pai: string;
  altura: string;
  peso: string;
  senha_acesso: string;
  foto_perfil_url: string;
  convenio_id: string;
  numero_convenio: string;
}

interface UsePatientFormProps {
  patient?: any;
  mode?: 'create' | 'edit' | 'view';
  onSuccess: () => void;
  onClose: () => void;
}

export const usePatientForm = ({ patient, mode = 'create', onSuccess, onClose }: UsePatientFormProps) => {
  const { toast } = useToast();
  const { tenantId } = useClinica();

  // Gerar senha apenas uma vez na inicialização
  const generatePassword = useCallback(() => {
    return Math.random().toString(36).slice(-8);
  }, []);

  // Função para criar dados iniciais
  const createInitialData = useCallback((patientData?: any): PatientFormData => {
    if (patientData) {
      console.log('Inicializando formulário com dados do paciente:', patientData.nome);
      return {
        nome: patientData.nome || '',
        cpf: patientData.cpf || '',
        rg: patientData.rg || '',
        data_nascimento: patientData.data_nascimento || '',
        genero: patientData.genero || '',
        email: patientData.email || '',
        telefone: patientData.telefone || '',
        telefone_urgencia: patientData.telefone_urgencia || '',
        endereco_completo: patientData.endereco_completo || '',
        cep: patientData.cep || '',
        cidade: patientData.cidade || '',
        bairro: patientData.bairro || '',
        numero: patientData.numero || '',
        nome_mae: patientData.nome_mae || '',
        nome_pai: patientData.nome_pai || '',
        altura: patientData.altura ? patientData.altura.toString() : '',
        peso: patientData.peso ? patientData.peso.toString() : '',
        senha_acesso: patientData.senha_acesso || '',
        foto_perfil_url: patientData.foto_perfil_url || '',
        convenio_id: patientData.convenio_id || '',
        numero_convenio: patientData.numero_convenio || ''
      };
    }
    
    return {
      nome: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      genero: '',
      email: '',
      telefone: '',
      telefone_urgencia: '',
      endereco_completo: '',
      cep: '',
      cidade: '',
      bairro: '',
      numero: '',
      nome_mae: '',
      nome_pai: '',
      altura: '',
      peso: '',
      senha_acesso: generatePassword(),
      foto_perfil_url: '',
      convenio_id: '',
      numero_convenio: ''
    };
  }, [generatePassword]);

  // Dados iniciais do formulário
  const initialData = useMemo(() => createInitialData(patient), [patient, createInitialData]);

  const [formData, setFormData] = useState<PatientFormData>(initialData);
  const [loading, setLoading] = useState(false);

  // Sincronizar dados quando o paciente muda
  useEffect(() => {
    console.log('useEffect: Paciente mudou:', patient?.nome || 'novo paciente');
    const newData = createInitialData(patient);
    setFormData(newData);
  }, [patient, createInitialData]);

  // Atualizar avatar quando nome ou gênero mudam
  const updateAvatar = useCallback(() => {
    if (!formData.nome && !formData.genero) return;
    
    const currentAvatar = formData.foto_perfil_url;
    const newAvatar = getPatientAvatar({ nome: formData.nome, genero: formData.genero });
    
    // Só atualizar se não há avatar customizado
    if (!currentAvatar || currentAvatar.includes('api.dicebear.com') || currentAvatar.includes('images.unsplash.com')) {
      setFormData(prev => ({
        ...prev,
        foto_perfil_url: newAvatar
      }));
    }
  }, [formData.nome, formData.genero, formData.foto_perfil_url]);

  // Formatar CPF
  const formatCPF = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }, []);

  // Handlers
  const updateField = useCallback((field: keyof PatientFormData, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Se mudou o convênio para "sem convênio" ou vazio, limpar número do convênio
      if (field === 'convenio_id' && (!value || value === 'sem-convenio')) {
        newData.numero_convenio = '';
      }

      return newData;
    });
  }, []);

  const handleCPFChange = useCallback((value: string) => {
    const formattedCPF = formatCPF(value);
    updateField('cpf', formattedCPF);
  }, [formatCPF, updateField]);

  const calculateAge = useCallback((birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantId) {
      toast({
        title: "Erro",
        description: "Clínica não encontrada. Tente recarregar a página.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.nome || !formData.cpf) {
      toast({
        title: "Erro",
        description: "Nome e CPF são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validação de convênio corrigida - só exigir número se tiver convênio selecionado
    if (formData.convenio_id && formData.convenio_id !== 'sem-convenio' && !formData.numero_convenio) {
      toast({
        title: "Erro",
        description: "Número do convênio é obrigatório quando um convênio é selecionado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const age = calculateAge(formData.data_nascimento);
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      
      const patientData = {
        ...formData,
        cpf: cpfLimpo,
        clinica_id: tenantId,
        idade: age,
        data_nascimento: formData.data_nascimento || null,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        // Corrigir salvamento do convênio - salvar null se for "sem convênio"
        convenio_id: (formData.convenio_id && formData.convenio_id !== 'sem-convenio') ? formData.convenio_id : null,
        numero_convenio: (formData.convenio_id && formData.convenio_id !== 'sem-convenio') ? formData.numero_convenio : null,
      };

      if (patient) {
        // Demo: simular atualização
        console.log('Demo: Atualizando paciente:', patient.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({ title: "Paciente demo atualizado com sucesso!" });
      } else {
        // Demo: simular inserção
        console.log('Demo: Inserindo novo paciente');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({ 
          title: "Paciente demo cadastrado com sucesso!",
          description: `Login: ${cpfLimpo} | Senha: ${formData.senha_acesso}`
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar paciente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, tenantId, patient, calculateAge, toast, onSuccess, onClose]);

  return {
    formData,
    loading,
    updateField,
    handleCPFChange,
    updateAvatar,
    handleSubmit,
    formatCPF
  };
};
