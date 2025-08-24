import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building, Database, Globe, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CriarClinicaCompletaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CriarClinicaCompleta = ({ open, onOpenChange, onSuccess }: CriarClinicaCompletaProps) => {
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<'formulario' | 'processando' | 'concluido'>('formulario');
  const [progresso, setProgresso] = useState({
    validacao: false,
    banco: false,
    dns: false,
    configuracao: false
  });
  const [clinicaCriada, setClinicaCriada] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cnpj: '',
    subdominio: '',
    senha: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEtapa('processando');

    try {
      // 1. Validação inicial
      setProgresso(prev => ({ ...prev, validacao: true }));
      
      if (!formData.nome || !formData.email || !formData.subdominio || !formData.senha) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      // Validar subdomínio (apenas letras, números e hífens)
      const subdomainRegex = /^[a-z0-9-]+$/;
      if (!subdomainRegex.test(formData.subdominio)) {
        throw new Error('Subdomínio deve conter apenas letras minúsculas, números e hífens');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Criar clínica completa via edge function
      setProgresso(prev => ({ ...prev, banco: true }));
      
      const { data, error } = await supabase.functions.invoke('criar-clinica-automatico', {
        body: formData
      });

      if (error) throw error;

      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Configurar DNS
      setProgresso(prev => ({ ...prev, dns: true }));
      
      try {
        await supabase.functions.invoke('configurar-dns-hostinger', {
          body: {
            subdominio: formData.subdominio,
            acao: 'criar'
          }
        });
      } catch (dnsError) {
        console.warn('⚠️ Erro ao configurar DNS:', dnsError);
        // Não falhar por causa do DNS, apenas avisar
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Configurações finais
      setProgresso(prev => ({ ...prev, configuracao: true }));
      
      await new Promise(resolve => setTimeout(resolve, 500));

      setClinicaCriada({
        ...data,
        subdominio: formData.subdominio,
        senha: formData.senha,
        url: `https://${formData.subdominio}.somosinovai.com`
      });
      
      setEtapa('concluido');
      toast.success('Clínica criada com sucesso!');
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }

    } catch (error: any) {
      console.error('Erro ao criar clínica:', error);
      toast.error(error.message || 'Erro ao criar clínica');
      setEtapa('formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      // Reset apenas se não estiver processando
      setTimeout(() => {
        setEtapa('formulario');
        setProgresso({ validacao: false, banco: false, dns: false, configuracao: false });
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          endereco: '',
          cnpj: '',
          subdominio: '',
          senha: ''
        });
        setClinicaCriada(null);
      }, 300);
    }
  };

  const gerarSenhaAleatoria = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
      senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, senha }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Criar Nova Clínica
          </DialogTitle>
          <DialogDescription>
            Criação completa com banco de dados e subdomínio automático
          </DialogDescription>
        </DialogHeader>

        {etapa === 'formulario' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Clínica *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Clínica Exemplo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subdominio">Subdomínio *</Label>
                <div className="flex">
                  <Input
                    id="subdominio"
                    value={formData.subdominio}
                    onChange={(e) => setFormData(prev => ({ ...prev, subdominio: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="clinica-exemplo"
                    required
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted border border-l-0 rounded-r-md">
                    .somosinovai.com
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@clinica.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="12.345.678/0001-90"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha">Senha Administrador *</Label>
                <div className="flex gap-2">
                  <Input
                    id="senha"
                    type="text"
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                    placeholder="Senha do primeiro acesso"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={gerarSenhaAleatoria}
                    className="shrink-0"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Clínica'
                )}
              </Button>
            </div>
          </form>
        )}

        {etapa === 'processando' && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold">Criando Clínica...</h3>
              <p className="text-muted-foreground">Este processo pode levar alguns minutos</p>
            </div>

            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${progresso.validacao ? 'bg-green-50 text-green-700' : 'bg-muted'}`}>
                <div className={`w-2 h-2 rounded-full ${progresso.validacao ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Validando dados da clínica</span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${progresso.banco ? 'bg-green-50 text-green-700' : 'bg-muted'}`}>
                <Database className="h-4 w-4" />
                <span className="text-sm">Criando banco de dados exclusivo</span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${progresso.dns ? 'bg-green-50 text-green-700' : 'bg-muted'}`}>
                <Globe className="h-4 w-4" />
                <span className="text-sm">Configurando subdomínio DNS</span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${progresso.configuracao ? 'bg-green-50 text-green-700' : 'bg-muted'}`}>
                <Building className="h-4 w-4" />
                <span className="text-sm">Finalizando configurações</span>
              </div>
            </div>
          </div>
        )}

        {etapa === 'concluido' && clinicaCriada && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-700">Clínica Criada com Sucesso!</h3>
              <p className="text-muted-foreground">Todos os serviços foram configurados automaticamente</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações de Acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">URL da Clínica</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={clinicaCriada.url} readOnly className="text-sm" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(clinicaCriada.url, '_blank')}
                    >
                      Abrir
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Email de Login</Label>
                  <Input value={formData.email} readOnly className="text-sm mt-1" />
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Senha Administrador</Label>
                  <Input value={formData.senha} readOnly className="text-sm mt-1" />
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Próximos Passos:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• O DNS pode levar até 15 minutos para propagar</li>
                <li>• Use as credenciais acima para fazer o primeiro login</li>
                <li>• Configure médicos, funcionários e horários</li>
                <li>• O sistema já está pronto para receber pacientes</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Finalizar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};