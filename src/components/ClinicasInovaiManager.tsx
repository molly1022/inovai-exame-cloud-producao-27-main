import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Eye, Building2, Mail, Phone, Globe, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { useQuery } from "@tanstack/react-query";

interface ClinicaInovai {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cnpj?: string;
  endereco?: string;
  subdominio: string;
  plano: string;
  ativo: boolean;
  observacoes?: string;
  data_contratacao?: string;
  valor_plano?: number;
  responsavel_comercial?: string;
  status_implementacao: string;
  created_at: string;
  updated_at: string;
}

interface ClinicaInovaiFormData {
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  endereco: string;
  subdominio: string;
  plano: string;
  ativo: boolean;
  observacoes: string;
  valor_plano: string;
  responsavel_comercial: string;
  status_implementacao: string;
}

export const ClinicasInovaiManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingClinica, setEditingClinica] = useState<ClinicaInovai | null>(null);
  const [formData, setFormData] = useState<ClinicaInovaiFormData>({
    nome: '',
    email: '',
    telefone: '',
    cnpj: '',
    endereco: '',
    subdominio: '',
    plano: 'basico',
    ativo: true,
    observacoes: '',
    valor_plano: '125.00',
    responsavel_comercial: '',
    status_implementacao: 'pendente'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar clínicas Inovai
  const { data: clinicas, isLoading, refetch } = useQuery({
    queryKey: ['clinicas-inovai'],
    queryFn: async () => {
      console.log('🔍 Buscando clínicas Inovai no banco administrativo central...');
      
      const { data, error } = await (adminSupabase as any)
        .from('clinicas_inovai')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('✅ Clínicas Inovai carregadas:', data?.length);
      return data as ClinicaInovai[];
    }
  });

  const handleInputChange = (field: keyof ClinicaInovaiFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-gerar subdomínio baseado no nome
    if (field === 'nome' && typeof value === 'string' && value) {
      const subdominioSugerido = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 30);

      setFormData(prev => ({
        ...prev,
        subdominio: subdominioSugerido
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.subdominio) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e subdomínio.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const dados = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        cnpj: formData.cnpj || null,
        endereco: formData.endereco || null,
        subdominio: formData.subdominio,
        plano: formData.plano,
        ativo: formData.ativo,
        observacoes: formData.observacoes || null,
        valor_plano: parseFloat(formData.valor_plano) || 0,
        responsavel_comercial: formData.responsavel_comercial || null,
        status_implementacao: formData.status_implementacao
      };

      if (editingClinica) {
        // Atualizar
        console.log('📝 Atualizando clínica Inovai no banco administrativo central...');
        
        const { error } = await (adminSupabase as any)
          .from('clinicas_inovai')
          .update(dados)
          .eq('id', editingClinica.id);

        if (error) throw error;

        toast({
          title: "Clínica atualizada",
          description: "As informações foram atualizadas com sucesso."
        });
      } else {
        // Criar nova
        console.log('📝 Criando clínica Inovai no banco administrativo central...');
        
        const { error } = await (adminSupabase as any)
          .from('clinicas_inovai')
          .insert(dados);

        if (error) throw error;

        toast({
          title: "Clínica cadastrada",
          description: "Nova clínica foi adicionada ao sistema Inovai."
        });
      }

      handleCloseModal();
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (clinica: ClinicaInovai) => {
    setEditingClinica(clinica);
    setFormData({
      nome: clinica.nome,
      email: clinica.email,
      telefone: clinica.telefone || '',
      cnpj: clinica.cnpj || '',
      endereco: clinica.endereco || '',
      subdominio: clinica.subdominio,
      plano: clinica.plano,
      ativo: clinica.ativo,
      observacoes: clinica.observacoes || '',
      valor_plano: clinica.valor_plano?.toString() || '125.00',
      responsavel_comercial: clinica.responsavel_comercial || '',
      status_implementacao: clinica.status_implementacao
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClinica(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cnpj: '',
      endereco: '',
      subdominio: '',
      plano: 'basico',
      ativo: true,
      observacoes: '',
      valor_plano: '125.00',
      responsavel_comercial: '',
      status_implementacao: 'pendente'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: "secondary",
      em_andamento: "default",
      concluida: "outline"
    } as const;

    const colors = {
      pendente: "🔄",
      em_andamento: "⚡",
      concluida: "✅"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {colors[status as keyof typeof colors]} {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPlanoBadge = (plano: string) => {
    const colors = {
      basico: "bg-blue-100 text-blue-800",
      intermediario: "bg-purple-100 text-purple-800", 
      avancado: "bg-gold-100 text-gold-800",
      enterprise: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={colors[plano as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {plano.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clínicas Inovai</h2>
          <p className="text-muted-foreground">Gerenciar informações básicas das clínicas cadastradas</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Clínica Inovai
        </Button>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cadastradas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicas?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clinicas?.filter(c => c.ativo).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {clinicas?.filter(c => c.status_implementacao === 'concluida').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {clinicas?.filter(c => c.ativo)
                .reduce((acc, c) => acc + (c.valor_plano || 0), 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clínicas */}
      <Card>
        <CardHeader>
          <CardTitle>Clínicas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {clinicas?.map((clinica) => (
                <div key={clinica.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{clinica.nome}</h3>
                      <Badge variant={clinica.ativo ? "default" : "secondary"}>
                        {clinica.ativo ? "ATIVA" : "INATIVA"}
                      </Badge>
                      {getPlanoBadge(clinica.plano)}
                      {getStatusBadge(clinica.status_implementacao)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{clinica.email}</span>
                      </div>
                      {clinica.telefone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{clinica.telefone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{clinica.subdominio}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>R$ {clinica.valor_plano?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Cadastrada: {new Date(clinica.created_at).toLocaleDateString()}
                      {clinica.responsavel_comercial && (
                        <span className="ml-2">• Responsável: {clinica.responsavel_comercial}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(clinica)}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}

              {clinicas?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma clínica Inovai cadastrada ainda.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClinica ? 'Editar Clínica' : 'Nova Clínica Inovai'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Clínica *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Nome da clínica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@clinica.com"
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

            <div className="space-y-2">
              <Label htmlFor="subdominio">Subdomínio *</Label>
              <Input
                id="subdominio"
                value={formData.subdominio}
                onChange={(e) => handleInputChange('subdominio', e.target.value)}
                placeholder="nome-clinica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plano">Plano</Label>
              <Select value={formData.plano} onValueChange={(value) => handleInputChange('plano', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_plano">Valor Mensal (R$)</Label>
              <Input
                id="valor_plano"
                type="number"
                step="0.01"
                value={formData.valor_plano}
                onChange={(e) => handleInputChange('valor_plano', e.target.value)}
                placeholder="125.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_comercial">Responsável Comercial</Label>
              <Input
                id="responsavel_comercial"
                value={formData.responsavel_comercial}
                onChange={(e) => handleInputChange('responsavel_comercial', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_implementacao">Status Implementação</Label>
              <Select value={formData.status_implementacao} onValueChange={(value) => handleInputChange('status_implementacao', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ativo">Status</Label>
              <Select 
                value={formData.ativo ? "true" : "false"} 
                onValueChange={(value) => handleInputChange('ativo', value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativa</SelectItem>
                  <SelectItem value="false">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder="Endereço completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};