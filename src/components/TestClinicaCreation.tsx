import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NovaClinica {
  nome: string;
  subdominio: string;
  email: string;
  telefone: string;
  cnpj: string;
  endereco: string;
}

/**
 * Componente para testar a criação de novas clínicas no sistema multi-tenant
 */
export const TestClinicaCreation = () => {
  const [formData, setFormData] = useState<NovaClinica>({
    nome: 'Clínica Teste',
    subdominio: 'clinica-teste',
    email: 'teste@clinicateste.com',
    telefone: '(11) 99999-9999',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua Teste, 123 - Centro, Cidade - SP'
  });
  const [loading, setLoading] = useState(false);
  const [clinicasCriadas, setClinicasCriadas] = useState<any[]>([]);
  const { toast } = useToast();

  const handleInputChange = (field: keyof NovaClinica, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-gerar subdomínio baseado no nome
    if (field === 'nome') {
      const subdominio = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 20);
      
      setFormData(prev => ({ ...prev, subdominio }));
    }
  };

  const validarFormulario = (): string | null => {
    if (!formData.nome.trim()) return 'Nome da clínica é obrigatório';
    if (!formData.subdominio.trim()) return 'Subdomínio é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!formData.email.includes('@')) return 'Email deve ter formato válido';
    if (formData.subdominio.length < 3) return 'Subdomínio deve ter pelo menos 3 caracteres';
    
    return null;
  };

  const criarClinicaTeste = async () => {
    const erro = validarFormulario();
    if (erro) {
      toast({
        title: "Erro de Validação",
        description: erro,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🏗️ Criando nova clínica de teste:', formData);

      // Verificar se subdomínio já existe
      const { data: existeClinica } = await supabase
        .from('clinicas_central')
        .select('subdominio')
        .eq('subdominio', formData.subdominio)
        .single();

      if (existeClinica) {
        toast({
          title: "Subdomínio já existe",
          description: `O subdomínio "${formData.subdominio}" já está sendo usado`,
          variant: "destructive"
        });
        return;
      }

      // Criar registro na tabela central
      const novaClinica = {
        nome: formData.nome,
        subdominio: formData.subdominio,
        email: formData.email,
        telefone: formData.telefone,
        cnpj: formData.cnpj,
        endereco: formData.endereco,
        status: 'ativa',
        database_name: `clinica_${formData.subdominio.replace('-', '_')}`,
        database_url: null, // Será preenchido quando tivermos bancos separados
        service_role_key: null,
        configuracoes: {
          timezone: 'America/Sao_Paulo',
          tema: 'default',
          idioma: 'pt-BR'
        },
        limites: {
          pacientes: 1000,
          medicos: 10,
          agendamentos_mes: 5000
        }
      };

      const { data, error } = await supabase
        .from('clinicas_central')
        .insert([novaClinica])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar clínica:', error);
        toast({
          title: "Erro ao criar clínica",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Registrar log do sistema
      await supabase.from('logs_sistema').insert([{
        acao: 'criacao_clinica',
        tabela: 'clinicas_central',
        registro_id: data.id,
        dados_novos: novaClinica,
        nivel: 'info',
        clinica_id: data.id
      }]);

      console.log('✅ Clínica criada com sucesso:', data);

      toast({
        title: "Clínica criada com sucesso!",
        description: `Clínica "${formData.nome}" está ativa no subdomínio: ${formData.subdominio}`,
      });

      // Atualizar lista de clínicas criadas
      setClinicasCriadas(prev => [...prev, data]);

      // Limpar formulário para próxima criação
      setFormData({
        nome: '',
        subdominio: '',
        email: '',
        telefone: '',
        cnpj: '',
        endereco: ''
      });

    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar a clínica. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const listarClinicasExistentes = async () => {
    try {
      const { data, error } = await supabase
        .from('clinicas_central')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao listar clínicas:', error);
        return;
      }

      setClinicasCriadas(data || []);
      toast({
        title: "Clínicas carregadas",
        description: `${data?.length || 0} clínicas encontradas`,
      });

    } catch (error) {
      console.error('Erro ao listar clínicas:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Criação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Sistema de Teste - Criar Nova Clínica
          </CardTitle>
          <CardDescription>
            Criar uma clínica de teste no sistema multi-tenant. A clínica será registrada no banco central.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Clínica</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Clínica São João"
              />
            </div>
            <div>
              <Label htmlFor="subdominio">Subdomínio</Label>
              <Input
                id="subdominio"
                value={formData.subdominio}
                onChange={(e) => handleInputChange('subdominio', e.target.value)}
                placeholder="clinica-sao-joao"
                className="font-mono"
              />
              {formData.subdominio && (
                <p className="text-xs text-muted-foreground mt-1">
                  Acesso: {formData.subdominio}.seudominio.com
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@clinica.com"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="12.345.678/0001-90"
              />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua Exemplo, 123 - Centro"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={criarClinicaTeste} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Clínica de Teste
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={listarClinicasExistentes}
            >
              <Database className="h-4 w-4 mr-2" />
              Listar Existentes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clínicas Criadas */}
      {clinicasCriadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clínicas no Sistema</CardTitle>
            <CardDescription>
              Clínicas registradas no banco central
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clinicasCriadas.map((clinica) => (
                <div key={clinica.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
              <h4 className="font-medium">{clinica.nome}</h4>
                      <Badge variant={clinica.status === 'ativa' ? 'default' : 'secondary'}>
                        {clinica.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subdomínio: <code className="bg-muted px-1 rounded">{clinica.subdominio}</code>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email: {clinica.email} | Telefone: {clinica.telefone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(clinica.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};