import { useCallback } from 'react';
import { useFuncionarioLogger } from './useFuncionarioLogger';
import { useToast } from './use-toast';

export const useManualLogger = () => {
  const { logCreatePatient, logCreateExam, logCreateAppointment } = useFuncionarioLogger();
  const { toast } = useToast();

  const logPatientCreation = useCallback(async (patientData: any) => {
    try {
      console.log('Registrando criação de paciente:', patientData);
      const result = await logCreatePatient(patientData);
      
      if (!result.success) {
        console.error('Falha ao registrar log de paciente');
        toast({
          title: "Aviso",
          description: "Ação registrada localmente. Log pode ter falhado.",
          variant: "default"
        });
      } else {
        console.log('Log de paciente registrado com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao registrar log de paciente:', error);
      return { success: false, data: null };
    }
  }, [logCreatePatient, toast]);

  const logExamCreation = useCallback(async (examData: any) => {
    try {
      console.log('Registrando criação de exame:', examData);
      const result = await logCreateExam(examData);
      
      if (!result.success) {
        console.error('Falha ao registrar log de exame');
        toast({
          title: "Aviso",
          description: "Ação registrada localmente. Log pode ter falhado.",
          variant: "default"
        });
      } else {
        console.log('Log de exame registrado com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao registrar log de exame:', error);
      return { success: false, data: null };
    }
  }, [logCreateExam, toast]);

  const logAppointmentCreation = useCallback(async (appointmentData: any) => {
    try {
      console.log('Registrando criação de agendamento:', appointmentData);
      const result = await logCreateAppointment(appointmentData);
      
      if (!result.success) {
        console.error('Falha ao registrar log de agendamento');
        toast({
          title: "Aviso", 
          description: "Ação registrada localmente. Log pode ter falhado.",
          variant: "default"
        });
      } else {
        console.log('Log de agendamento registrado com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao registrar log de agendamento:', error);
      return { success: false, data: null };
    }
  }, [logCreateAppointment, toast]);

  // Função genérica para garantir accountability
  const ensureActionLogged = useCallback(async (actionType: 'patient' | 'exam' | 'appointment', data: any) => {
    const timestamp = new Date().toISOString();
    const actionData = { ...data, logged_at: timestamp };
    
    // Salvar no localStorage como backup
    const backupKey = `action_backup_${actionType}_${timestamp}`;
    localStorage.setItem(backupKey, JSON.stringify(actionData));
    
    let result;
    switch (actionType) {
      case 'patient':
        result = await logPatientCreation(actionData);
        break;
      case 'exam':
        result = await logExamCreation(actionData);
        break;
      case 'appointment':
        result = await logAppointmentCreation(actionData);
        break;
    }
    
    // Se o log foi bem-sucedido, remover backup
    if (result.success) {
      localStorage.removeItem(backupKey);
    }
    
    return result;
  }, [logPatientCreation, logExamCreation, logAppointmentCreation]);

  return {
    logPatientCreation,
    logExamCreation,
    logAppointmentCreation,
    ensureActionLogged
  };
};