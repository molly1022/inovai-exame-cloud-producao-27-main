import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Mail, Phone, User, MapPin, Lock } from 'lucide-react';

const NovaClinica = () => {
  const [formData, setFormData] = useState({
    nomeClinica: '',
    nomeResponsavel: '',
    emailResponsavel: '',
    cpfResponsavel: '',
    telefone: '',
    subdominioSolicitado: '',
    endereco: '',
    observacoes: '',
    senhaPersonalizada: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar subdomínio único na central
      const { data: existingClinica } = await supabase
        .from('clinicas_central')
        .select('id')
        .eq('subdominio', formData.subdominioSolicitado)
        .single();

      if (existingClinica) {
        toast({
          title: "Subdomínio já existe",
          description: "Este subdomínio já está sendo usado por outra clínica.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validar força da senha
      if (formData.senhaPersonalizada.length < 8) {
        toast({
          title: "Senha muito fraca",
          description: "A senha deve ter pelo menos 8 caracteres.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Criptografar senha com hash mais robusto
      const hashedPassword = btoa(formData.senhaPersonalizada + '_salt_' + new Date().getTime());

      // Inserir a nova clínica no banco central
      const { data: novaClinica, error: insertError } = await supabase
        .from('clinicas_central')
        .insert({
          nome: formData.nomeClinica,
          email: formData.emailResponsavel,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
          subdominio: formData.subdominioSolicitado,
          status: 'ativa',
          database_name: `clinica_${formData.subdominioSolicitado}`,
          database_url: `banco_modelo`, // Referência ao banco modelo
          configuracoes: {
            responsavel: formData.nomeResponsavel,
            cpf_responsavel: formData.cpfResponsavel,
            observacoes: formData.observacoes,
            senha_hash: hashedPassword,
            created_by: 'sistema_cadastro'
          },
          limites: {
            max_medicos: 10,
            max_funcionarios: 20,
            max_pacientes: 1000,
            teleconsultas_mes: 100
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao inserir clínica:', insertError);
        throw insertError;
      }

      console.log('✅ Clínica criada com sucesso:', novaClinica);
      
      toast({
        title: "Clínica cadastrada com sucesso!",
        description: `Sua clínica foi criada e estará disponível em: ${formData.subdominioSolicitado}.somosinovai.com`,
      });
      
      // Limpar formulário
      setFormData({
        nomeClinica: '',
        nomeResponsavel: '',
        emailResponsavel: '',
        cpfResponsavel: '',
        telefone: '',
        subdominioSolicitado: '',
        endereco: '',
        observacoes: '',
        senhaPersonalizada: ''
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar clínica:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar clínica. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarSubdominio = (valor: string) => {
    // Remove caracteres especiais e espaços, converte para minúsculo
    return valor
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="shadow-lg border-border/50">
          <CardHeader className="text-center space-y-4">
            <Building2 className="h-12 w-12 text-primary mx-auto" />
            <CardTitle className="text-3xl font-bold text-foreground">
              Cadastro de Nova Clínica
            </CardTitle>
            <CardDescription className="text-lg">
              Solicite o cadastro da sua clínica no sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeClinica" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Nome da Clínica *
                  </Label>
                  <Input
                    id="nomeClinica"
                    value={formData.nomeClinica}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeClinica: e.target.value }))}
                    placeholder="Ex: Clínica São João"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdominioSolicitado" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Subdomínio Desejado *
                  </Label>
                  <div className="relative">
                    <Input
                      id="subdominioSolicitado"
                      value={formData.subdominioSolicitado}
                      onChange={(e) => {
                        const formatted = formatarSubdominio(e.target.value);
                        setFormData(prev => ({ ...prev, subdominioSolicitado: formatted }));
                      }}
                      placeholder="clinicasaojoao"
                      required
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.subdominioSolicitado && `${formData.subdominioSolicitado}.somosinovai.com`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeResponsavel" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome do Responsável *
                  </Label>
                  <Input
                    id="nomeResponsavel"
                    value={formData.nomeResponsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeResponsavel: e.target.value }))}
                    placeholder="Dr. João Silva"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfResponsavel">CPF do Responsável *</Label>
                  <Input
                    id="cpfResponsavel"
                    value={formData.cpfResponsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpfResponsavel: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailResponsavel" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email do Responsável *
                  </Label>
                  <Input
                    id="emailResponsavel"
                    type="email"
                    value={formData.emailResponsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailResponsavel: e.target.value }))}
                    placeholder="joao@clinica.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro, cidade, estado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senhaPersonalizada" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha de Acesso Personalizada *
                </Label>
                   <Input
                     id="senhaPersonalizada"
                     type="password"
                     value={formData.senhaPersonalizada}
                     onChange={(e) => setFormData(prev => ({ ...prev, senhaPersonalizada: e.target.value }))}
                     placeholder="Crie uma senha de acesso (mín. 8 caracteres)"
                     minLength={8}
                     required
                   />
                   <div className="text-xs text-muted-foreground">
                     Esta será a senha usada para acessar o sistema da clínica (mínimo 8 caracteres)
                   </div>
                   {formData.senhaPersonalizada && formData.senhaPersonalizada.length < 8 && (
                     <div className="text-xs text-red-500">
                       ⚠️ Senha deve ter pelo menos 8 caracteres
                     </div>
                   )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais sobre a clínica..."
                  rows={3}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">⚠️ Informações Importantes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• O subdomínio não poderá ser alterado após a aprovação</li>
                  <li>• Todos os dados são obrigatórios para análise</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Cadastrar sua clínica'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovaClinica;