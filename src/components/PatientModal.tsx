
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, User } from "lucide-react";
import { usePatientForm } from '@/hooks/usePatientForm';
import { useConvenios } from '@/hooks/useConvenios';
import PatientFormFields from './PatientFormFields';
import { getPatientAvatar } from "@/utils/getPatientAvatar";

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: any;
  mode?: 'create' | 'edit' | 'view';
}

const PatientModal = ({ isOpen, onClose, onSuccess, patient, mode = 'create' }: PatientModalProps) => {
  const { 
    formData, 
    loading, 
    updateField, 
    handleCPFChange, 
    updateAvatar, 
    handleSubmit 
  } = usePatientForm({ patient, mode, onSuccess, onClose });

  const { convenios, loading: conveniosLoading } = useConvenios();

  const getDisplayAvatar = () => {
    return formData.foto_perfil_url || getPatientAvatar({ nome: formData.nome, genero: formData.genero });
  };

  // Log para debug
  console.log('PatientModal renderizando:', { 
    mode, 
    patientName: patient?.nome, 
    formDataName: formData.nome,
    isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto px-0 py-0 rounded-3xl shadow-2xl border-0">
        <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-[#1a1d2a] dark:via-gray-900 dark:to-[#232142] rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl font-bold text-blue-800 dark:text-white mb-2">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-200" />
              <span>
                {mode === 'view' ? 'Visualizar Paciente' : 
                 mode === 'edit' ? 'Editar Paciente' : 'Novo Paciente'}
              </span>
            </DialogTitle>
          </DialogHeader>
      
          <form onSubmit={handleSubmit} className="space-y-7 mt-4">
            {/* Avatar Preview */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <img
                  src={getDisplayAvatar()}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-xl transition-all duration-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";
                  }}
                />
                {mode !== 'view' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-1 right-1 border border-blue-200 rounded-full bg-white shadow text-blue-700 hover:bg-blue-50"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
      
            <PatientFormFields
              formData={formData}
              updateField={updateField}
              handleCPFChange={handleCPFChange}
              convenios={convenios}
              conveniosLoading={conveniosLoading}
              mode={mode}
            />
      
            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-6 border-t border-blue-100 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                {mode === 'view' ? 'Fechar' : 'Cancelar'}
              </Button>
              {mode !== 'view' && (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (patient ? 'Atualizar' : 'Cadastrar')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientModal;
