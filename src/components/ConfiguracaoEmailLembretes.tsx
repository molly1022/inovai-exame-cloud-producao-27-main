
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useEmailLembretes } from '@/hooks/useEmailLembretes';
import { Mail, Send, Clock, Settings, Zap } from 'lucide-react';
import EmailTemplateSelector from './EmailTemplateSelector';

const ConfiguracaoEmailLembretes = () => {
  const [loading, setLoading] = useState(false);
  const [forceSendLoading, setForceSendLoading] = useState(false);
  const { toast } = useToast();
  const { 
    configuracao, 
    loading: configLoading, 
    salvando,
    atualizarConfiguracao, 
    recarregarDados 
  } = useEmailLembretes();

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuracao) return;

    setLoading(true);
    try {
      await atualizarConfiguracao(configuracao);
    } finally {
      setLoading(false);
    }
  };

  const testarEnvioEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('enviar-lembretes-email', {
        body: { 
          teste: true,
          forceTest: true
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Teste de Email",
        description: "Email de teste enviado com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao testar email:', error);
      toast({
        title: "❌ Erro no Teste",
        description: error.message || "Erro ao testar envio de email",
        variant: "destructive"
      });
    }
  };

  const handleForceSend = async () => {
    setForceSendLoading(true);
    
    try {
      console.log('Forçando envio de lembretes...');
      
      const { data, error } = await supabase.functions.invoke('enviar-lembretes-email', {
        body: { 
          manual: true,
          clinica_id: undefined
        }
      });

      if (error) {
        console.error('Erro ao forçar envio:', error);
        throw error;
      }

      console.log('Resposta do envio forçado:', data);
      
      toast({
        title: "✅ Envio Forçado Concluído",
        description: `${data?.emailsEnviados || 0} emails de lembrete foram enviados com sucesso!`,
      });
      
    } catch (error: any) {
      console.error('Erro ao forçar envio de lembretes:', error);
      toast({
        title: "❌ Erro no Envio Forçado",
        description: error.message || "Erro ao enviar lembretes por email",
        variant: "destructive"
      });
    } finally {
      setForceSendLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Mail className="h-8 w-8 text-blue-600" />
                Sistema de Emails Automático
              </h1>
              <p className="text-gray-600 mt-2">
                Configure lembretes automáticos com templates profissionais para os pacientes
              </p>
            </div>
          
          {/* Botão de Forçar Envio */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">Envio Manual</span>
                  </div>
                  <Button
                    onClick={handleForceSend}
                    disabled={forceSendLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    size="sm"
                  >
                    {forceSendLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Forçar Envio
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-orange-700 mt-2 text-center">
                Envia lembretes imediatamente para os agendamentos de amanhã
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status do Sistema */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Status do Sistema de Lembretes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {configuracao?.ativo ? '✅' : '❌'}
                </div>
                <p className="text-sm font-medium">
                  {configuracao?.ativo ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {configuracao?.horas_antecedencia || 24}h
                </div>
                <p className="text-sm font-medium">Antecedência</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  📧
                </div>
                <p className="text-sm font-medium">Email Automático</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <strong>Como funciona:</strong> Todo dia às 09:00, o sistema verifica agendamentos do próximo dia e envia lembretes automaticamente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <form onSubmit={handleSalvar}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações dos Lembretes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ativar/Desativar */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="ativo" className="text-base font-medium">
                    Ativar Lembretes Automáticos
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Enviar emails de lembrete automaticamente para os pacientes
                  </p>
                </div>
                <Switch
                  id="ativo"
                  checked={configuracao?.ativo || false}
                  onCheckedChange={(checked) => {
                    if (configuracao) {
                      Object.assign(configuracao, { ativo: checked });
                    }
                  }}
                />
              </div>

              {/* Antecedência */}
              <div className="space-y-2">
                <Label htmlFor="horas_antes">Antecedência (horas)</Label>
                <Input
                  id="horas_antes"
                  type="number"
                  min="1"
                  max="168"
                  value={configuracao?.horas_antecedencia || 24}
                  onChange={(e) => {
                    if (configuracao) {
                      Object.assign(configuracao, { horas_antecedencia: parseInt(e.target.value) });
                    }
                  }}
                  placeholder="24"
                />
                <p className="text-sm text-gray-600">
                  Quantas horas antes da consulta o lembrete deve ser enviado (padrão: 24 horas)
                </p>
              </div>

              {/* Assunto do Email */}
              <div className="space-y-2">
                <Label htmlFor="assunto_email">Assunto do Email</Label>
                <Input
                  id="assunto_email"
                  value={configuracao?.assunto_email || ''}
                  onChange={(e) => {
                    if (configuracao) {
                      Object.assign(configuracao, { assunto_email: e.target.value });
                    }
                  }}
                  placeholder="Lembrete: Sua consulta está agendada para amanhã"
                />
              </div>

              {/* Seletor de Template */}
              <EmailTemplateSelector
                templatePersonalizado={configuracao?.template_personalizado || ''}
                onTemplateChange={(template) => {
                  if (configuracao) {
                    Object.assign(configuracao, { template_personalizado: template });
                  }
                }}
              />

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || salvando}
                  className="flex-1"
                >
                  {loading || salvando ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={testarEnvioEmail}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Testar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracaoEmailLembretes;
