import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Loader2, Plus, Database, Globe, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClinicData {
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  subdominio: string;
  plano_contratado: string;
  observacoes: string;
}

export const ManualClinicCreation = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClinicData>({
    nome: '',
    email: '',
    telefone: '',
    cnpj: '',
    subdominio: '',
    plano_contratado: 'basico',
    observacoes: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof ClinicData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-gerar subdomínio baseado no nome
    if (field === 'nome' && value) {
      const subdominioSugerido = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 30);

      setFormData(prev => ({ ...prev, subdominio: subdominioSugerido }));
    }
  };

  const validateForm = () => {
    const required = ['nome', 'email', 'subdominio'];
    return required.every(field => formData[field as keyof ClinicData]);
  };

  const handleCreateClinic = async () => {
    if (!validateForm()) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha nome, email e subdomínio.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🏗️ Criando clínica manualmente:', formData.nome);

      // Verificar se subdomínio já existe
      const { data: existente } = await adminSupabase
        .from('clinicas_central')
        .select('id, subdominio')
        .eq('subdominio', formData.subdominio)
        .single();

      if (existente) {
        throw new Error(`Subdomínio "${formData.subdominio}" já existe!`);
      }

      // Inserir nova clínica no banco central
      const { data, error } = await adminSupabase
        .from('clinicas_central')
        .insert({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          cnpj: formData.cnpj || null,
          subdominio: formData.subdominio,
          status: 'ativa',
          database_name: `clinica_${formData.subdominio.replace(/-/g, '_')}`,
          configuracoes: {
            plano_contratado: formData.plano_contratado,
            tipo: 'manual',
            criado_via: 'admin_panel',
            observacoes: formData.observacoes || null
          },
          limites: {
            medicos: formData.plano_contratado === 'basico' ? 5 : 
                    formData.plano_contratado === 'intermediario' ? 15 : 50,
            pacientes: formData.plano_contratado === 'basico' ? 500 : 
                      formData.plano_contratado === 'intermediario' ? 1500 : 5000,
            agendamentos: formData.plano_contratado === 'basico' ? 200 : 
                         formData.plano_contratado === 'intermediario' ? 500 : 2000
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Registrar log da criação
      await adminSupabase.from('logs_sistema').insert({
        acao: 'criar_clinica_manual',
        tabela: 'clinicas_central',
        registro_id: data.id,
        dados_novos: data,
        usuario_id: 'admin_sistema',
        ip_address: 'admin_panel',
        nivel: 'info'
      });

      toast({
        title: "✅ Clínica Criada!",
        description: `${formData.nome} - Subdomínio: ${formData.subdominio}.somosinovai.com`
      });

      // Reset form
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cnpj: '',
        subdominio: '',
        plano_contratado: 'basico',
        observacoes: ''
      });

      console.log('✅ Clínica criada com sucesso:', {
        id: data.id,
        subdominio: data.subdominio,
        url: `https://${data.subdominio}.somosinovai.com`
      });

    } catch (error: any) {
      console.error('❌ Erro ao criar clínica:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = formData.subdominio 
    ? `${formData.subdominio}.somosinovai.com` 
    : 'subdominio.somosinovai.com';

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Clínica Manualmente
        </CardTitle>
        <CardDescription>
          Criar nova clínica diretamente no banco central
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Esta clínica usará RLS no banco modelo. 
            Para Database-per-Tenant real, use a edge function criar-banco-clinica.
          </AlertDescription>
        </Alert>

        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Clínica *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Clínica Exemplo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="admin@clinica.com"
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
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>
        </div>

        {/* Configurações Técnicas */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Configurações Técnicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subdominio">Subdomínio *</Label>
              <Input
                id="subdominio"
                value={formData.subdominio}
                onChange={(e) => handleInputChange('subdominio', e.target.value.toLowerCase())}
                placeholder="minha-clinica"
              />
              <p className="text-xs text-muted-foreground">
                URL: https://{previewUrl}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plano">Plano</Label>
              <Select 
                value={formData.plano_contratado} 
                onValueChange={(value) => handleInputChange('plano_contratado', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico - 5 médicos</SelectItem>
                  <SelectItem value="intermediario">Intermediário - 15 médicos</SelectItem>
                  <SelectItem value="avancado">Avançado - 50 médicos</SelectItem>
                  <SelectItem value="enterprise">Enterprise - Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre a clínica..."
              rows={3}
            />
          </div>
        </div>

        {/* Preview */}
        {formData.subdominio && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Preview da Configuração:</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>URL: https://{previewUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span>Database: clinica_{formData.subdominio.replace(/-/g, '_')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                <span>Plano: {formData.plano_contratado}</span>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleCreateClinic} 
          disabled={loading || !validateForm()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando Clínica...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Criar Clínica
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};