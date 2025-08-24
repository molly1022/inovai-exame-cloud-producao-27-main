
import { useEffect, useRef } from 'react';
import { useFuncionarioLogger } from '@/hooks/useFuncionarioLogger';

interface FuncionarioActionLoggerProps {
  children: React.ReactNode;
}

export const FuncionarioActionLogger: React.FC<FuncionarioActionLoggerProps> = ({ children }) => {
  const { logAction } = useFuncionarioLogger();
  const originalFetchRef = useRef<typeof window.fetch>();

  useEffect(() => {
    // Salvar referência original do fetch
    originalFetchRef.current = window.fetch;
    
    // Interceptar operações do Supabase para logging automático
    window.fetch = async (...args) => {
      const response = await originalFetchRef.current!(...args);
      const url = args[0] as string;
      const requestInit = args[1] as RequestInit;
      
      // Verificar se é uma operação do Supabase
      if (url.includes('supabase') && url.includes('/rest/v1/')) {
        const method = requestInit?.method || 'GET';
        
        // Extrair tabela da URL
        const tableMatch = url.match(/\/rest\/v1\/([^?]+)/);
        const table = tableMatch ? tableMatch[1] : '';
        
        // Só registrar operações de escrita (POST, PATCH, PUT, DELETE)
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
          console.log('🔍 Detectada operação Supabase:', { method, table, url: url.substring(0, 100) + '...' });
          
          // Verificar se a resposta foi bem-sucedida antes de logar
          if (response.ok) {
            try {
              // Clone da response para poder ler o body
              const responseClone = response.clone();
              const responseData = await responseClone.json();
              
              // Mapear operações para ações de log
              if (method === 'POST' && table === 'pacientes' && Array.isArray(responseData) && responseData.length > 0) {
                const patientData = responseData[0];
                await logAction({
                  acao: 'CREATE_PATIENT',
                  descricao: `Paciente criado: ${patientData.nome || 'Nome não disponível'}`,
                  tabelaAfetada: 'pacientes',
                  registroId: patientData.id,
                  detalhes: { nome: patientData.nome, cpf: patientData.cpf }
                });
                console.log('✅ Log automático de paciente registrado');
                
              } else if (method === 'POST' && table === 'exames' && Array.isArray(responseData) && responseData.length > 0) {
                const examData = responseData[0];
                await logAction({
                  acao: 'CREATE_EXAM',
                  descricao: `Exame criado: ${examData.tipo || 'Tipo não disponível'}`,
                  tabelaAfetada: 'exames',
                  registroId: examData.id,
                  detalhes: { tipo: examData.tipo, paciente_id: examData.paciente_id }
                });
                console.log('✅ Log automático de exame registrado');
                
              } else if (method === 'POST' && table === 'agendamentos' && Array.isArray(responseData) && responseData.length > 0) {
                const appointmentData = responseData[0];
                await logAction({
                  acao: 'CREATE_APPOINTMENT',
                  descricao: `Agendamento criado: ${appointmentData.tipo_exame || 'Tipo não disponível'}`,
                  tabelaAfetada: 'agendamentos',
                  registroId: appointmentData.id,
                  detalhes: { 
                    tipo_exame: appointmentData.tipo_exame, 
                    paciente_id: appointmentData.paciente_id,
                    data_agendamento: appointmentData.data_agendamento 
                  }
                });
                console.log('✅ Log automático de agendamento registrado');
                
              } else if (method === 'PATCH' && table === 'pacientes') {
                await logAction({
                  acao: 'UPDATE_PATIENT',
                  descricao: 'Paciente atualizado',
                  tabelaAfetada: 'pacientes'
                });
                console.log('✅ Log automático de atualização de paciente registrado');
                
              } else if (method === 'PATCH' && table === 'exames') {
                await logAction({
                  acao: 'UPDATE_EXAM',
                  descricao: 'Exame atualizado',
                  tabelaAfetada: 'exames'
                });
                console.log('✅ Log automático de atualização de exame registrado');
                
              } else if (method === 'PATCH' && table === 'agendamentos') {
                await logAction({
                  acao: 'UPDATE_APPOINTMENT',
                  descricao: 'Agendamento atualizado',
                  tabelaAfetada: 'agendamentos'
                });
                console.log('✅ Log automático de atualização de agendamento registrado');
                
              } else if (method === 'DELETE') {
                const actionMap: Record<string, any> = {
                  'pacientes': { acao: 'DELETE_PATIENT', descricao: 'Paciente excluído' },
                  'exames': { acao: 'DELETE_EXAM', descricao: 'Exame excluído' },
                  'agendamentos': { acao: 'DELETE_APPOINTMENT', descricao: 'Agendamento excluído' }
                };
                
                if (actionMap[table]) {
                  await logAction({
                    acao: actionMap[table].acao,
                    descricao: actionMap[table].descricao,
                    tabelaAfetada: table
                  });
                  console.log(`✅ Log automático de exclusão de ${table} registrado`);
                }
              }
            } catch (error) {
              console.error('❌ Erro ao registrar ação automática:', error);
            }
          } else {
            console.log('⚠️ Operação falhou, não registrando log automático');
          }
        }
      }
      
      return response;
    };

    // Cleanup: restaurar fetch original
    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
    };
  }, [logAction]);

  return <>{children}</>;
};
