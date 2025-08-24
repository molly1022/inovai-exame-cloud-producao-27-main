
import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Calendar, Stethoscope, ClipboardList, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProntuarioDadosPessoais from '@/components/prontuario/ProntuarioDadosPessoais';
import ProntuarioTimeline from '@/components/prontuario/ProntuarioTimeline';
import ProntuarioExames from '@/components/prontuario/ProntuarioExames';
import ProntuarioReceitas from '@/components/prontuario/ProntuarioReceitas';
import ProntuarioAnotacoes from '@/components/prontuario/ProntuarioAnotacoes';
import ProntuarioRelatorios from '@/components/prontuario/ProntuarioRelatorios';
import AtestadosTable from '@/components/AtestadosTable';

const ProntuarioPaciente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dados-pessoais');

  // Detectar se estamos no contexto do funcionário ou admin
  const isFuncionarioContext = location.pathname.includes('/funcionario-dashboard');

  // Mock patient data since we don't have operational tables in central DB
  const { data: paciente, isLoading } = useQuery({
    queryKey: ['paciente-prontuario', id],
    queryFn: async () => {
      // Mock patient data for demonstration
      return {
        id,
        nome: 'Paciente Demo',
        idade: 35,
        cpf: '123.456.789-10',
        telefone: '(11) 99999-9999',
        convenios: { nome: 'Plano Demo', cor: '#2563eb' }
      };
    },
  });

  const handleBack = () => {
    if (isFuncionarioContext) {
      navigate('/funcionario-dashboard/prontuarios');
    } else {
      navigate('/pacientes');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando prontuário...</span>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Paciente não encontrado</p>
        <Button onClick={handleBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Prontuário do Paciente</h1>
            <p className="text-gray-600">{paciente.nome}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('relatorios')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo do Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Idade</p>
              <p className="text-lg font-bold text-blue-900">{paciente.idade || 'N/A'} anos</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Convênio</p>
              <p className="text-lg font-bold text-green-900">
                {paciente.convenios?.nome || 'Particular'}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">CPF</p>
              <p className="text-lg font-bold text-purple-900">{paciente.cpf}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Telefone</p>
              <p className="text-lg font-bold text-orange-900">{paciente.telefone || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs do Prontuário */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dados-pessoais" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="exames" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Exames
          </TabsTrigger>
          <TabsTrigger value="receitas" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="anotacoes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Anotações
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados-pessoais" className="space-y-6">
          <ProntuarioDadosPessoais paciente={paciente} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <ProntuarioTimeline pacienteId={id!} />
        </TabsContent>

        <TabsContent value="exames" className="space-y-6">
          <ProntuarioExames pacienteId={id!} />
        </TabsContent>

        <TabsContent value="receitas" className="space-y-6">
          <ProntuarioReceitas pacienteId={id!} />
        </TabsContent>

        <TabsContent value="anotacoes" className="space-y-6">
          <ProntuarioAnotacoes pacienteId={id!} />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <ProntuarioRelatorios paciente={paciente} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProntuarioPaciente;
