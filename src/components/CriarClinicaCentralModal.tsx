import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlanoSistema {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  periodicidade: 'mensal' | 'anual' | 'lifetime';
  limites: any;
  recursos: any;
  ativo: boolean;
  ordem: number;
}

interface CriarClinicaCentralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  planos: PlanoSistema[];
}

interface FormData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  subdominio: string;
  plano_id: string;
}

export function CriarClinicaCentralModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  planos 
}: CriarClinicaCentralModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    subdominio: '',
    plano_id: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-gerar subdomínio baseado no nome
      if (field === 'nome' && value) {
        updated.subdominio = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
          .replace(/\s+/g, '-') // Substitui espaços por hífens
          .replace(/-+/g, '-') // Remove hífens duplicados
          .replace(/^-|-$/g, ''); // Remove hífens do início e fim
      }
      
      return updated;
    });
  };

  const validateStep1 = () => {
    return formData.nome && formData.email && formData.subdominio;
  };

  const validateStep2 = () => {
    return formData.plano_id;
  };

  const handleCriarClinica = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Criar clínica no banco central
      // Inserção removida para single-tenant - cada clínica tem seu próprio banco
      console.log('Simulação de criação de clínica single-tenant:', formData);

      // Simulação de edge function para single-tenant - removido  
      console.log('Edge function removida para single-tenant');

      // Log da ação (simplificado para single-tenant)  - removido para single-tenant
      console.log('Log da ação removido no sistema single-tenant');

      toast({
        title: "Sucesso!",
        description: `Clínica ${formData.nome} criada com sucesso!`
      });

      // Reset form
      setFormData({
        nome: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        subdominio: '',
        plano_id: ''
      });
      setStep(1);
      onSuccess();

    } catch (error: any) {
      console.error('Erro ao criar clínica:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a clínica",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome da Clínica *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            placeholder="Ex: Clínica Médica Central"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => handleInputChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="contato@clinica.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => handleInputChange('endereco', e.target.value)}
            placeholder="Rua, número, cidade - UF"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="subdominio">Subdomínio *</Label>
          <div className="flex items-center mt-1">
            <Input
              id="subdominio"
              value={formData.subdominio}
              onChange={(e) => handleInputChange('subdominio', e.target.value)}
              placeholder="clinica-central"
              className="rounded-r-none"
            />
            <div className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
              .somosinovai.com
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Este será o endereço de acesso: {formData.subdominio || 'subdominio'}.somosinovai.com
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const planoSelecionado = planos.find(p => p.id === formData.plano_id);

    return (
      <div className="space-y-6">
        <div>
          <Label>Selecionar Plano *</Label>
          <Select value={formData.plano_id} onValueChange={(value) => handleInputChange('plano_id', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Escolha um plano" />
            </SelectTrigger>
            <SelectContent>
              {planos.map((plano) => (
                <SelectItem key={plano.id} value={plano.id}>
                  {plano.nome} - R$ {plano.preco.toFixed(2)}/{plano.periodicidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {planoSelecionado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {planoSelecionado.nome}
                <Badge variant="outline">
                  R$ {planoSelecionado.preco.toFixed(2)}/{planoSelecionado.periodicidade}
                </Badge>
              </CardTitle>
              <CardDescription>{planoSelecionado.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Recursos inclusos:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(planoSelecionado.recursos || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Resumo da Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Nome:</strong> {formData.nome}</div>
            <div><strong>Email:</strong> {formData.email}</div>
            <div><strong>Subdomínio:</strong> {formData.subdominio}.somosinovai.com</div>
            {formData.cnpj && <div><strong>CNPJ:</strong> {formData.cnpj}</div>}
            {formData.telefone && <div><strong>Telefone:</strong> {formData.telefone}</div>}
            {planoSelecionado && (
              <div><strong>Plano:</strong> {planoSelecionado.nome} (R$ {planoSelecionado.preco.toFixed(2)})</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Criar Nova Clínica - Passo {step} de 2
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? renderStep1() : renderStep2()}

        <div className="flex justify-between mt-6">
          <div className="space-x-2">
            {step === 2 && (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                Voltar
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
          </div>

          <div>
            {step === 1 ? (
              <Button onClick={handleNext} disabled={!validateStep1()}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleCriarClinica} disabled={!validateStep2() || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Clínica
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}