import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Save, Settings, Shield, Link } from "lucide-react"; // <- Ícone 'Link' importado aqui
import { useTenantId } from '@/hooks/useTenantId';
import bcrypt from 'bcryptjs';

interface ConfiguracaoClinica {
  id: string;
  email_login_clinica: string;
  senha_acesso_clinica: string;
  codigo_acesso_admin: string;
  codigo_acesso_clinica: string;
  codigo_acesso_funcionario: string;
  created_at: string;
  updated_at: string;
}

interface ClinicaInfo {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  cnpj: string;
  plano_atual: string;
}

const ConfiguracoesClinica = () => {
  const [config, setConfig] = useState<Partial<ConfiguracaoClinica>>({
    email_login_clinica: '',
    senha_acesso_clinica: '',
    codigo_acesso_admin: '',
    codigo_acesso_clinica: '',
    codigo_acesso_funcionario: ''
  });
  const [clinicaInfo, setClinicaInfo] = useState<Partial<ClinicaInfo>>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    cnpj: '',
    plano_atual: 'Trial 30 dias'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { clinicaId, isValid } = useTenantId();

  useEffect(() => {
    if (isValid && clinicaId) {
      fetchConfiguracoes();
      fetchClinicaInfo();
    }
  }, [clinicaId, isValid]);

  const fetchConfiguracoes = async () => {
    setLoading(true);
    try {
      // Mock para configurações - sistema multi-tenant em desenvolvimento
      console.log('Carregando configurações da clínica (modo simulação)');
      
      const mockConfig = {
        id: '1',
        email_login_clinica: 'admin@clinicaexemplo.com',
        senha_acesso_clinica: 'mock_password',
        codigo_acesso_admin: '1234',
        codigo_acesso_clinica: '5678',
        codigo_acesso_funcionario: '9999',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setConfig(mockConfig);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações da clínica",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicaInfo = async () => {
    try {
      // Mock para informações da clínica - sistema multi-tenant em desenvolvimento
      console.log('Carregando informações da clínica (modo simulação)');
      
      const mockClinicaData = {
        id: '1',
        nome: 'Clínica Exemplo',
        email: 'contato@clinicaexemplo.com',
        telefone: '(83) 99999-9999',
        endereco: 'Rua Exemplo, 123'
      };

      setClinicaInfo({
        id: mockClinicaData.id,
        nome: mockClinicaData.nome || '',
        email: mockClinicaData.email || '',
        telefone: mockClinicaData.telefone || '',
        endereco: mockClinicaData.endereco || '',
        cidade: 'João Pessoa',
        estado: 'Paraíba',
        cep: '58000-000',
        cnpj: 'XX.XXX.XXX/XXXX-XX',
        plano_atual: 'Trial 30 dias'
      });
    } catch (error) {
      console.error('Erro ao buscar informações da clínica:', error);
    }
  };

  const handleSave = async () => {
    if (!isValid || !clinicaId) {
      toast({
        title: "Erro",
        description: "Clínica não identificada",
        variant: "destructive"
      });
      return;
    }

    if (!config.email_login_clinica || !config.senha_acesso_clinica) {
      toast({
        title: "Erro",
        description: "Email e senha de acesso são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      // Fazer hash da senha usando bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(config.senha_acesso_clinica, saltRounds);

      // Preparar dados para salvar - usar senha_hash_secure ao invés de senha_hash
      const configData = {
        ...config,
        senha_acesso_clinica: null, // Limpar campo de texto plano
        senha_hash_secure: hashedPassword, // Usar campo hash seguro
        updated_at: new Date().toISOString()
      };

      // Mock para salvar configurações - sistema multi-tenant em desenvolvimento  
      console.log('Salvando configurações (modo simulação):', configData);
      
      setConfig(prev => ({ ...prev, ...configData }));

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso.",
      });

      // Recarregar configurações
      await fetchConfiguracoes();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ConfiguracaoClinica, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClinicaInfoChange = (field: keyof ClinicaInfo, value: any) => {
    setClinicaInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveClinicaInfo = async () => {
    if (!isValid || !clinicaId) {
      toast({
        title: "Erro",
        description: "Clínica não identificada",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const clinicaData = {
        nome: clinicaInfo.nome,
        email: clinicaInfo.email,
        telefone: clinicaInfo.telefone,
        endereco: clinicaInfo.endereco,
        updated_at: new Date().toISOString()
      };

      // Mock para salvar informações da clínica - sistema multi-tenant em desenvolvimento
      console.log('Salvando informações da clínica (modo simulação):', clinicaData);
      
      setClinicaInfo(prev => ({ ...prev, ...clinicaData }));

      toast({
        title: "Sucesso!",
        description: "Informações da clínica atualizadas com sucesso.",
      });

      await fetchClinicaInfo();
    } catch (error) {
      console.error('Erro ao salvar informações da clínica:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar informações da clínica",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isValid || !clinicaId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Clínica não identificada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações - Unovai Exame Cloud</h1>
          <p className="text-gray-600">Configure as informações e opções da sua clínica</p>
        </div>
      </div>

      {/* Aviso sobre migração das informações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Settings className="h-5 w-5" />
            <h3 className="font-semibold">Informações da Clínica Migradas</h3>
          </div>
          <p className="text-blue-600 text-sm">
            As informações da clínica foram movidas para a página <strong>Perfil da Clínica</strong> para uma melhor organização. 
            Você pode acessá-la através do menu lateral.
          </p>
        </CardContent>
      </Card>

      {/* Configurações de Acesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Acesso
          </CardTitle>
          <CardDescription>
            Configure as credenciais de login da clínica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email_login">Email de Login *</Label>
              <Input
                id="email_login"
                type="email"
                value={config.email_login_clinica || ''}
                onChange={(e) => handleInputChange('email_login_clinica', e.target.value)}
                placeholder="admin@suaclinica.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha_acesso">Senha de Acesso *</Label>
              <Input
                id="senha_acesso"
                type="password"
                value={config.senha_acesso_clinica || ''}
                onChange={(e) => handleInputChange('senha_acesso_clinica', e.target.value)}
                placeholder="Digite a senha de acesso"
              />
            </div>
          </div>
          
          
        </CardContent>
      </Card>

      {/* NOVO CARD ADICIONADO AQUI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Links de Portais da Clínica
          </CardTitle>
          <CardDescription>
            Acesse os diferentes portais disponíveis para sua clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Portal do Médico</Label>
            <a href="http://www.inovaiexamecloud.pro/portal-medico" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
              http://www.inovaiexamecloud.pro/portal-medico
            </a>
          </div>
          <div className="space-y-2">
            <Label>Portal do Funcionário</Label>
            <a href="http://www.inovaiexamecloud.pro/funcionario-login" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
              http://www.inovaiexamecloud.pro/funcionario-login
            </a>
          </div>
          <div className="space-y-2">
            <Label>Portal do Paciente</Label>
            <p className="text-sm text-gray-800"> http://www.inovaiexamecloud.pro/portal-paciente/:cpf/:senha</p>
            <p className="text-xs text-gray-500">
              O link do portal do paciente é dinâmico e deve ser compartilhado diretamente com o paciente, incluindo seu CPF e a senha do exame.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default ConfiguracoesClinica;