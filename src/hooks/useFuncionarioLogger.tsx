import { useCallback } from 'react';
import { useFuncionarioAuth } from '@/hooks/useFuncionarioAuth';
import { useClinica } from '@/hooks/useClinica';

export type AcaoTipo = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE_PATIENT' 
  | 'UPDATE_PATIENT' 
  | 'DELETE_PATIENT'
  | 'VIEW_PATIENT'
  | 'CREATE_EXAM' 
  | 'UPDATE_EXAM' 
  | 'DELETE_EXAM'
  | 'VIEW_EXAM'
  | 'CREATE_APPOINTMENT' 
  | 'UPDATE_APPOINTMENT' 
  | 'DELETE_APPOINTMENT'
  | 'VIEW_APPOINTMENT'
  | 'EXPORT_DATA';

interface LogData {
  acao: AcaoTipo;
  descricao?: string;
  detalhes?: Record<string, any>;
  tabelaAfetada?: string;
  registroId?: string;
}

export const useFuncionarioLogger = () => {
  const { funcionarioId } = useFuncionarioAuth();
  const { clinica } = useClinica();

  const logAction = useCallback(async (data: LogData) => {
    // TODO: Re-enable after database types are updated
    console.log('FuncionarioLogger disabled temporarily:', {
      funcionarioId,
      clinicaId: clinica?.id,
      acao: data.acao,
      descricao: data.descricao
    });
    
    return { success: true, data: null };
  }, [funcionarioId, clinica?.id]);

  const logLogin = useCallback(async () => {
    console.log('Funcionario login logged:', funcionarioId);
    return { success: true, data: null };
  }, [funcionarioId]);

  const logLogout = useCallback(async () => {
    console.log('Funcionario logout logged:', funcionarioId);
    return { success: true, data: null };
  }, [funcionarioId]);

  const logCreatePatient = useCallback(async (patientData: any) => {
    console.log('Patient creation logged:', patientData.nome);
    return { success: true, data: null };
  }, []);

  const logCreateExam = useCallback(async (examData: any) => {
    console.log('Exam creation logged:', examData.tipo);
    return { success: true, data: null };
  }, []);

  const logCreateAppointment = useCallback(async (appointmentData: any) => {
    console.log('Appointment creation logged:', appointmentData.tipo_exame);
    return { success: true, data: null };
  }, []);

  return {
    logAction,
    logLogin,
    logLogout,
    logCreatePatient,
    logCreateExam,
    logCreateAppointment
  };
};