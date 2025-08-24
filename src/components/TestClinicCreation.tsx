import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { dbConnectionFactory } from '@/services/databaseConnectionFactory';

/**
 * Componente de teste para criação automática de clínicas via Management API
 */
export function TestClinicCreation() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomeClinica: '',
    emailResponsavel: '',
    subdominio: '',
    cnpj: '',
    telefone: '',
    planoContratado: 'basico'
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-gerar subdomínio baseado no nome
    if (field === 'nomeClinica') {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
      setFormData(prev => ({ ...prev, subdominio: subdomain }));
    }
  };

  const handleCreateClinic = async () => {
    if (!formData.nomeClinica || !formData.emailResponsavel || !formData.subdominio) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Iniciando criação de clínica via Management API...');
      
      const result = await dbConnectionFactory.createClinicaWithDatabase(
        formData.nomeClinica,
        formData.emailResponsavel,
        formData.subdominio,
        formData.cnpj || undefined,
        formData.telefone || undefined,
        formData.planoContratado
      );

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        
        console.log('🎉 Clínica criada:', result);
        
        // Limpar formulário
        setFormData({
          nomeClinica: '',
          emailResponsavel: '',
          subdominio: '',
          cnpj: '',
          telefone: '',
          planoContratado: 'basico'
        });
        
        // Mostrar informações do projeto criado
        if (result.supabaseProject) {
          toast({
            title: "Database Criado",
            description: `Projeto: ${result.supabaseProject.ref}\nURL: ${result.supabaseProject.endpoint}`,
          });
        }
      } else {
        toast({
          title: "Erro",
          description: result.message || 'Erro desconhecido',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar clínica:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro interno',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Teste: Criação Automática de Clínica</CardTitle>
        <p className="text-sm text-muted-foreground">
          Teste da criação de clínicas com databases isolados via Supabase Management API
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nomeClinica">Nome da Clínica *</Label>
            <Input
              id="nomeClinica"
              value={formData.nomeClinica}
              onChange={(e) => handleInputChange('nomeClinica', e.target.value)}
              placeholder="Ex: Clínica São José"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subdominio">Subdomínio *</Label>
            <Input
              id="subdominio"
              value={formData.subdominio}
              onChange={(e) => handleInputChange('subdominio', e.target.value)}
              placeholder="Ex: clinica-sao-jose"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailResponsavel">Email do Responsável *</Label>
          <Input
            id="emailResponsavel"
            type="email"
            value={formData.emailResponsavel}
            onChange={(e) => handleInputChange('emailResponsavel', e.target.value)}
            placeholder="admin@clinica.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plano">Plano</Label>
          <select
            id="plano"
            value={formData.planoContratado}
            onChange={(e) => handleInputChange('planoContratado', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="basico">Básico</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleCreateClinic}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Criando Clínica e Database...' : 'Criar Clínica com Database Isolado'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <strong>Processo:</strong><br/>
          1. Criar registro na central administrativa<br/>
          2. Criar projeto Supabase via Management API<br/>
          3. Configurar credenciais e conexões<br/>
          4. Executar migrations iniciais<br/>
          5. Configurar RLS e dados iniciais
        </div>
      </CardContent>
    </Card>
  );
}