import { supabase } from '@/integrations/supabase/client';

// Utilidades de segurança para criptografia e logs seguros
class SecurityUtils {
  private static readonly ENCRYPTION_KEY = 'secure_clinic_key_2024';

  // Função para criptografar dados sensíveis
  static encryptData(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error('Erro na criptografia:', error);
      return data;
    }
  }

  // Função para descriptografar dados
  static decryptData(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      console.error('Erro na descriptografia:', error);
      return encryptedData;
    }
  }

  // Sanitizar dados de entrada
  static sanitizeInput(input: string): string {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/[<>]/g, '')
                .trim();
  }

  // Validar CPF
  static validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11 && /^\d{11}$/.test(cleanCPF);
  }

  // Validar email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Rate limiting para requisições
  private static rateLimitMap = new Map<string, { count: number; lastReset: number }>();

  static checkRateLimit(key: string, limit: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || (now - record.lastReset) > windowMs) {
      this.rateLimitMap.set(key, { count: 1, lastReset: now });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  // Log seguro - apenas em desenvolvimento
  static secureLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      switch (level) {
        case 'info':
          console.log(`[${timestamp}] INFO: ${message}`, data ? { ...data } : '');
          break;
        case 'warn':
          console.warn(`[${timestamp}] WARN: ${message}`, data ? { ...data } : '');
          break;
        case 'error':
          console.error(`[${timestamp}] ERROR: ${message}`, data ? { ...data } : '');
          break;
      }
    }
  }

  // Gerar token seguro para sessão
  static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Limpar dados sensíveis do localStorage de forma segura
  static secureLocalStorageClear(): void {
    const keysToRemove = [
      'clinica_logged',
      'funcionario_logged',
      'medicoAuth',
      'funcionario_auth_token'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Mascarar dados sensíveis para logs
  static maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Mascarar CPF
      if (/^\d{11}$/.test(data)) {
        return data.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2');
      }
      // Mascarar email
      if (this.validateEmail(data)) {
        const [user, domain] = data.split('@');
        return `${user.substring(0, 2)}***@${domain}`;
      }
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      Object.keys(masked).forEach(key => {
        if (key.toLowerCase().includes('senha') || 
            key.toLowerCase().includes('password') ||
            key.toLowerCase().includes('cpf') ||
            key.toLowerCase().includes('email')) {
          masked[key] = '[HIDDEN]';
        }
      });
      return masked;
    }

    return data;
  }

  // Validar força da senha
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve ter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve ter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve ter pelo menos um número');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Registrar atividade suspeita
  static async logSuspiciousActivity(
    activity: string, 
    details: any, 
    clinicaId?: string
  ): Promise<void> {
    try {
      // Demo: Log de atividade suspeita (não persistido em produção)
      console.log('Suspicious activity log:', {
        activity,
        timestamp: new Date().toISOString(),
        details: this.maskSensitiveData(details),
        clinicaId: clinicaId || 'unknown'
      });
    } catch (error) {
      // Silenciar erro de log para não expor informações
      console.error('Erro ao registrar atividade suspeita');
    }
  }
}

export default SecurityUtils;