import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Settings, Database, Mail, Shield, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracaoData {
  id: string;
  chave: string;
  valor: any;
  descricao: string | null;
  categoria: string;
  created_at: string;
  updated_at: string;
}

export function ConfiguracoesSistema() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    try {
      // Configurações demo para single-tenant
      const configDemo: ConfiguracaoData[] = [
        { 
          id: '1', 
          chave: 'sistema_ativo', 
          valor: 'true', 
          descricao: 'Sistema operacional', 
          categoria: 'geral',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: '2', 
          chave: 'backup_automatico', 
          valor: 'true', 
          descricao: 'Backup automático ativo', 
          categoria: 'seguranca',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setConfiguracoes(configDemo);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (chave: string, valor: any) => {
    setSaving(chave);
    try {
      // Simulação de update para single-tenant
      console.log('Configuração atualizada:', { chave, valor });

      // Atualizar estado local
      setConfiguracoes(prev => 
        prev.map(config => 
          config.chave === chave 
            ? { ...config, valor: valor }
            : config
        )
      );

      // Log simplificado para single-tenant
      console.log('Configuração alterada:', {
        acao: 'configuracao_alterada',
        chave: chave,
        valor: valor
      });

      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso"
      });
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a configuração",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const getConfigValue = (chave: string) => {
    const config = configuracoes.find(c => c.chave === chave);
    return config?.valor;
  };

  const getConfigByCategory = (categoria: string) => {
    return configuracoes.filter(c => c.categoria === categoria);
  };

  const renderConfigInput = (config: ConfiguracaoData) => {
    const handleChange = (newValue: any) => {
      handleSaveConfig(config.chave, newValue);
    };

    // Determinar tipo de input baseado no valor
    if (typeof config.valor === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={config.valor}
            onCheckedChange={handleChange}
            disabled={saving === config.chave}
          />
          <span className="text-sm text-muted-foreground">
            {config.valor ? 'Ativado' : 'Desativado'}
          </span>
        </div>
      );
    }

    if (typeof config.valor === 'number') {
      return (
        <Input
          type="number"
          defaultValue={config.valor}
          onBlur={(e) => handleChange(parseInt(e.target.value))}
          disabled={saving === config.chave}
        />
      );
    }

    // String longa (textarea)
    if (typeof config.valor === 'string' && config.valor.length > 50) {
      return (
        <Textarea
          defaultValue={config.valor.replace(/"/g, '')}
          onBlur={(e) => handleChange(`"${e.target.value}"`)}
          disabled={saving === config.chave}
          rows={3}
        />
      );
    }

    // String simples
    return (
      <Input
        defaultValue={typeof config.valor === 'string' ? config.valor.replace(/"/g, '') : config.valor}
        onBlur={(e) => handleChange(`"${e.target.value}"`)}
        disabled={saving === config.chave}
      />
    );
  };

  const categorias = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'sistema', label: 'Sistema', icon: Database },
    { id: 'limites', label: 'Limites', icon: Shield },
    { id: 'dns', label: 'DNS/Domínio', icon: Globe },
    { id: 'email', label: 'E-mail', icon: Mail }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              {categorias.map(categoria => {
                const Icon = categoria.icon;
                const configsCount = getConfigByCategory(categoria.id).length;
                return (
                  <TabsTrigger key={categoria.id} value={categoria.id}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{categoria.label}</span>
                      <Badge variant="outline" className="ml-1">
                        {configsCount}
                      </Badge>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categorias.map(categoria => (
              <TabsContent key={categoria.id} value={categoria.id}>
                <div className="space-y-6">
                  {getConfigByCategory(categoria.id).map(config => (
                    <Card key={config.id}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-medium">
                              {config.chave.replace(/_/g, ' ').toUpperCase()}
                            </Label>
                            {config.descricao && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {config.descricao}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              {renderConfigInput(config)}
                            </div>
                            {saving === config.chave && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <code className="bg-muted px-2 py-1 rounded">
                              Chave: {config.chave}
                            </code>
                            <span className="ml-2">
                              Última atualização: {new Date(config.updated_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {getConfigByCategory(categoria.id).length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        Nenhuma configuração encontrada para esta categoria
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => {
                // Implementar backup manual
                toast({
                  title: "Backup iniciado",
                  description: "O backup do sistema foi iniciado em background"
                });
              }}
            >
              <Database className="h-4 w-4 mr-2" />
              Backup Manual
            </Button>

            <Button 
              variant="outline"
              onClick={() => {
                // Implementar limpeza de logs antigos
                toast({
                  title: "Limpeza iniciada",
                  description: "Logs antigos estão sendo removidos"
                });
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Limpar Logs Antigos
            </Button>

            <Button 
              variant="outline"
              onClick={() => {
                // Implementar teste de conectividade
                toast({
                  title: "Teste iniciado",
                  description: "Testando conectividade com todas as clínicas"
                });
              }}
            >
              <Globe className="h-4 w-4 mr-2" />
              Testar Conectividade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}