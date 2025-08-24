/**
 * Utilitários de sanitização e segurança para prevenção de ataques
 * Implementa sanitização de dados e validações de segurança
 */

// Sanitização de texto para prevenir XSS
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"';&|`]/g, '') // Remove caracteres perigosos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
};

// Sanitização de email
export const sanitizeEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>"';&|`]/g, '');
};

// Validação de CPF
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica sequências inválidas
  const invalidSequences = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];
  
  if (invalidSequences.includes(cleanCPF)) return false;
  
  // Cálculo dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  return parseInt(cleanCPF.charAt(9)) === digit1 && 
         parseInt(cleanCPF.charAt(10)) === digit2;
};

// Normalização de CPF
export const normalizeCPF = (cpf: string): string => {
  return cpf.replace(/[^\d]/g, '');
};

// Validação de força de senha
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitização de inputs de formulário
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data } as any;
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('cpf')) {
        sanitized[key] = normalizeCPF(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    }
  });
  
  return sanitized as T;
};

// Validação de formato de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Rate limiting local (client-side)
const attempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkRateLimit = (identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const userAttempts = attempts.get(identifier);
  
  if (!userAttempts) {
    attempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset se passou da janela de tempo
  if (now - userAttempts.lastAttempt > windowMs) {
    attempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Incrementar tentativas
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  
  return userAttempts.count <= maxAttempts;
};

// Limpar rate limit para um identifier
export const clearRateLimit = (identifier: string): void => {
  attempts.delete(identifier);
};

// Obter IP do cliente (usando serviço público)
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Erro ao obter IP:', error);
    return 'unknown';
  }
};

// Headers de segurança para requests
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
  };
};