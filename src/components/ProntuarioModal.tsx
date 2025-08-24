
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar, Stethoscope, ClipboardList, Download } from "lucide-react";
import ProntuarioDadosPessoais from '@/components/prontuario/ProntuarioDadosPessoais';
import ProntuarioTimeline from '@/components/prontuario/ProntuarioTimeline';
import ProntuarioExames from '@/components/prontuario/ProntuarioExames';
import ProntuarioReceitas from '@/components/prontuario/ProntuarioReceitas';
import ProntuarioAnotacoes from '@/components/prontuario/ProntuarioAnotacoes';
import ProntuarioAtestados from '@/components/prontuario/ProntuarioAtestados';

interface ProntuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: any;
  showAddReceitaButton?: boolean;
  onAddReceita?: () => void;
}

const ProntuarioModal = ({ isOpen, onClose, paciente, showAddReceitaButton = false, onAddReceita }: ProntuarioModalProps) => {
  const [activeTab, setActiveTab] = useState('dados-pessoais');

  if (!paciente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário - {paciente.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
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
              <TabsTrigger value="atestados" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Atestados
              </TabsTrigger>
              <TabsTrigger value="anotacoes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Anotações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dados-pessoais" className="space-y-6">
              <ProntuarioDadosPessoais paciente={paciente} />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <ProntuarioTimeline pacienteId={paciente.id} />
            </TabsContent>

            <TabsContent value="exames" className="space-y-6">
              <ProntuarioExames pacienteId={paciente.id} />
            </TabsContent>

            <TabsContent value="receitas" className="space-y-6">
              <ProntuarioReceitas 
                pacienteId={paciente.id} 
                showAddButton={showAddReceitaButton}
                onAddReceita={onAddReceita}
              />
            </TabsContent>

            <TabsContent value="atestados" className="space-y-6">
              <ProntuarioAtestados pacienteId={paciente.id} showAddButton={true} />
            </TabsContent>

            <TabsContent value="anotacoes" className="space-y-6">
              <ProntuarioAnotacoes pacienteId={paciente.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProntuarioModal;
