import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Loader2, Database, Globe, Building } from "lucide-react";

interface CriarClinicaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  nome_clinica: string;
  cnpj: string;
  email_responsavel: string;
  telefone: string;
  subdominio: string;
  plano_contratado: string;
}

export const CriarClinicaModal = ({ open, onOpenChange, onSuccess }: CriarClinicaModalProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nome_clinica: '',
    cnpj: '',
    email_responsavel: '',
    telefone: '',
    subdominio: '',
    plano_contratado: 'basico'
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-gerar subdomínio baseado no nome da clínica
    if (field === 'nome_clinica' && value) {
      const subdominioSugerido = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .substring(0, 30); // Limita tamanho

      setFormData(prev => ({
        ...prev,
        subdominio: subdominioSugerido
      }));
    }
  };

  const validateStep1 = () => {
    return formData.nome_clinica && formData.email_responsavel && formData.subdominio;
  };

  const validateStep2 = () => {
    return formData.plano_contratado;
  };

  const handleCriarClinica = async () => {
    if (!validateStep1() || !validateStep2()) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🏗️ Iniciando criação da clínica:', formData.nome_clinica);
      
      // Usar o factory de conexões para criar clínica com database
      const { dbConnectionFactory } = await import('@/services/databaseConnectionFactory');
      
      const resultado = await dbConnectionFactory.createClinicaWithDatabase(
        formData.nome_clinica,
        formData.email_responsavel,
        formData.subdominio,
        formData.cnpj || undefined,
        formData.telefone || undefined,
        formData.plano_contratado
      );

      if (resultado.success) {
        // Também salvar na tabela clinicas_inovai no banco administrativo central
        try {
          await (adminSupabase as any).from('clinicas_inovai').insert({
            nome: formData.nome_clinica,
            email: formData.email_responsavel,
            telefone: formData.telefone,
            cnpj: formData.cnpj,
            subdominio: formData.subdominio,
            plano: formData.plano_contratado,
            ativo: true,
            valor_plano: formData.plano_contratado === 'basico' ? 125.00 : 
                        formData.plano_contratado === 'intermediario' ? 190.00 :
                        formData.plano_contratado === 'avancado' ? 299.00 : 125.00,
            status_implementacao: 'pendente',
            responsavel_comercial: 'Sistema Automático'
          });
          
          console.log('✅ Também salvo na tabela clinicas_inovai no banco administrativo central');
        } catch (error) {
          console.warn('⚠️ Erro ao salvar na tabela clinicas_inovai no banco central:', error);
          // Não falha a operação principal
        }

        toast({
          title: "🎉 Clínica Criada com Sucesso!",
          description: `Database isolado: ${resultado.databaseName}
          
Subdomínio: ${formData.subdominio}.sistema.com`,
        });

        console.log('✅ Clínica criada:', {
          id: resultado.clinicaId,
          database: resultado.databaseName,
          subdominio: formData.subdominio
        });

        // Reset form
        setFormData({
          nome_clinica: '',
          cnpj: '',
          email_responsavel: '',
          telefone: '',
          subdominio: '',
          plano_contratado: 'basico'
        });
        setStep(1);
        onSuccess();
      } else {
        throw new Error('Falha na criação da clínica');
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar clínica:', error);
      toast({
        title: "Erro ao Criar Clínica",
        description: error.message || "Erro interno do sistema.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    } else {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-5 w-5 text-primary" />
        <span className="font-medium">Informações da Clínica</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome_clinica">Nome da Clínica *</Label>
        <Input
          id="nome_clinica"
          value={formData.nome_clinica}
          onChange={(e) => handleInputChange('nome_clinica', e.target.value)}
          placeholder="Ex: Clínica Nova Era"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={(e) => handleInputChange('cnpj', e.target.value)}
          placeholder="00.000.000/0000-00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_responsavel">Email do Responsável *</Label>
        <Input
          id="email_responsavel"
          type="email"
          value={formData.email_responsavel}
          onChange={(e) => handleInputChange('email_responsavel', e.target.value)}
          placeholder="responsavel@clinica.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          value={formData.telefone}
          onChange={(e) => handleInputChange('telefone', e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdominio">Subdomínio *</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="subdominio"
            value={formData.subdominio}
            onChange={(e) => handleInputChange('subdominio', e.target.value)}
            placeholder="clinica-nova-era"
          />
          <span className="text-sm text-muted-foreground">.sistema.com</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Este será o endereço de acesso: {formData.subdominio || 'subdominio'}.sistema.com
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <span className="font-medium">Configurações Técnicas</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plano_contratado">Plano Contratado *</Label>
        <Select value={formData.plano_contratado} onValueChange={(value) => handleInputChange('plano_contratado', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basico">Básico - R$ 125/mês</SelectItem>
            <SelectItem value="intermediario">Intermediário - R$ 190/mês</SelectItem>
            <SelectItem value="avancado">Avançado - R$ 299/mês</SelectItem>
            <SelectItem value="enterprise">Enterprise - Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <h4 className="font-medium">Resumo da Configuração:</h4>
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            <span>URL: {formData.subdominio}.sistema.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3" />
            <span>Database: clinica_{formData.subdominio.replace('-', '_')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-3 w-3" />
            <span>Plano: {formData.plano_contratado}</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">⚠️ Importante:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Um banco de dados dedicado será criado automaticamente</li>
          <li>• O subdomínio não poderá ser alterado após a criação</li>
          <li>• Credenciais de acesso serão enviadas por email</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Criar Nova Clínica - Etapa {step} de 2
          </DialogTitle>
        </DialogHeader>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            
            {step === 1 ? (
              <Button onClick={handleNext} disabled={!validateStep1()}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleCriarClinica} disabled={loading || !validateStep2()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Clínica'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};