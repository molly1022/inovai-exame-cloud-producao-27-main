// Utilitários para telemedicina
export const validarUrlTeleconsulta = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // Verificar se é uma URL válida
    const urlObj = new URL(url);
    
    // Verificar se é do Daily.co
    if (!urlObj.hostname.includes('daily.co')) {
      console.warn('URL não é do Daily.co:', url);
      return false;
    }
    
    // Tentar fazer uma requisição HEAD para verificar se a URL responde
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Para evitar problemas de CORS
    });
    
    return true; // Se chegou até aqui, URL é válida
  } catch (error) {
    console.error('Erro ao validar URL:', error);
    return false;
  }
};

export const formatarNomeParaUrl = (nome: string): string => {
  return nome
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiais
    .trim()
    .substring(0, 50); // Limitar tamanho
};

export const gerarUrlSegura = (baseUrl: string, userName: string, userRole: 'moderator' | 'participant'): string => {
  const nomeFormatado = formatarNomeParaUrl(userName);
  const params = new URLSearchParams({
    userName: nomeFormatado,
    userRole,
    showLeaveButton: 'true',
    theme: 'light'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const verificarStatusSala = async (salaId: string): Promise<'ativa' | 'expirada' | 'nao_encontrada'> => {
  try {
    // Esta função seria usada com a edge function get-daily-room
    // Por enquanto retorna 'ativa' para não bloquear
    return 'ativa';
  } catch (error) {
    console.error('Erro ao verificar status da sala:', error);
    return 'nao_encontrada';
  }
};