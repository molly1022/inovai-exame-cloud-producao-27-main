
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, User, Stethoscope, X } from "lucide-react";

const ExamPreviewModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Dados de exemplo para demonstração
  const examData = [
    {
      id: 1,
      tipo: "Ressonância Magnética",
      paciente: "Maria Silva Santos",
      data: "2024-01-15",
      status: "Disponível",
      medico: "Dr. João Carvalho",
      arquivo: "ressonancia_maria_2024.pdf",
      preview: "/lovable-uploads/8ae6b20f-ca92-40cf-a683-5c1e887b6c20.png"
    },
    {
      id: 2,
      tipo: "Ultrassonografia",
      paciente: "Carlos Eduardo Lima",
      data: "2024-01-14",
      status: "Em análise",
      medico: "Dra. Ana Paula",
      arquivo: "ultra_carlos_2024.pdf",
      preview: "/placeholder.svg"
    },
    {
      id: 3,
      tipo: "Tomografia Computadorizada",
      paciente: "Fernanda Costa",
      data: "2024-01-13",
      status: "Disponível",
      medico: "Dr. Roberto Mendes",
      arquivo: "tomo_fernanda_2024.pdf",
      preview: "/placeholder.svg"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível': return 'bg-green-100 text-green-800';
      case 'Em análise': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewExam = (exam: any) => {
    setSelectedExam(exam);
  };

  return (
    <>
      {/* Componente flutuante interativo */}
      <div className="relative">
        <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-xl rounded-3xl border border-purple-500/30 overflow-hidden transform hover:scale-105 transition-all duration-500 shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Central de Exames</h3>
              </div>
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
            </div>

            <div className="space-y-3">
              {examData.slice(0, 3).map((exam) => (
                <div key={exam.id} className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer"
                     onClick={() => handleViewExam(exam)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{exam.tipo}</h4>
                      <p className="text-gray-400 text-xs">{exam.paciente}</p>
                    </div>
                    <Badge className={`${getStatusColor(exam.status)} text-xs`}>
                      {exam.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-purple-300 text-sm">Acesso instantâneo aos resultados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal completo */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <FileText className="h-6 w-6 text-purple-400" />
              Sistema de Exames - Demonstração
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Exames */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">Exames Recentes</h3>
              {examData.map((exam) => (
                <div key={exam.id} 
                     className={`bg-slate-800/50 rounded-xl p-4 border transition-all cursor-pointer hover:scale-105 ${
                       selectedExam?.id === exam.id 
                         ? 'border-purple-400 bg-purple-900/20' 
                         : 'border-slate-700 hover:border-purple-500/50'
                     }`}
                     onClick={() => setSelectedExam(exam)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{exam.tipo}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{exam.paciente}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(exam.status)}>
                      {exam.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(exam.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" />
                        <span>{exam.medico}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detalhes do Exame Selecionado */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              {selectedExam ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{selectedExam.tipo}</h3>
                    <Button
                      onClick={() => setSelectedExam(null)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Preview da imagem/documento */}
                  <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <img 
                      src={selectedExam.preview} 
                      alt="Preview do exame"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-purple-300 text-sm">Preview do documento</p>
                  </div>

                  {/* Informações detalhadas */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Paciente</label>
                        <p className="text-white font-medium">{selectedExam.paciente}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Data</label>
                        <p className="text-white font-medium">
                          {new Date(selectedExam.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Médico</label>
                        <p className="text-white font-medium">{selectedExam.medico}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Status</label>
                        <Badge className={`${getStatusColor(selectedExam.status)} mt-1`}>
                          {selectedExam.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar Completo
                      </Button>
                      <Button variant="outline" className="flex-1 border-purple-500 text-purple-300 hover:bg-purple-900/20">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Selecione um exame para visualizar os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExamPreviewModal;
