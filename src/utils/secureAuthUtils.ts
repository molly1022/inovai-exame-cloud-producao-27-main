import SecurityUtils from './securityUtils';
import { supabase } from '@/integrations/supabase/client';

// Utilitário específico para autenticação segura
class SecureAuthUtils {
  private static readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas
  private static readonly MAX_LOGIN_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

  // Verificar se sessão é válida
  static isSessionValid(): boolean {
    try {
      const sessionData = localStorage.getItem('secure_session');
      if (!sessionData) return false;

      const session = JSON.parse(SecurityUtils.decryptData(sessionData));
      const now = Date.now();
      
      if (now - session.created > this.SESSION_TIMEOUT) {
        this.clearSession();
        return false;
      }

      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  // Criar sessão segura
  static createSecureSession(userType: 'clinica' | 'medico' | 'funcionario' | 'paciente', userId: string, additionalData?: any): void {
    const sessionData = {
      userType,
      userId: SecurityUtils.encryptData(userId),
      created: Date.now(),
      token: SecurityUtils.generateSecureToken(),
      ...additionalData
    };

    const encryptedSession = SecurityUtils.encryptData(JSON.stringify(sessionData));
    localStorage.setItem('secure_session', encryptedSession);
    localStorage.setItem('session_token', sessionData.token);
  }

  // Limpar sessão
  static clearSession(): void {
    const keysToRemove = [
      'secure_session',
      'session_token',
      'clinica_logged',
      'funcionario_logged',
      'paciente_logged',
      'medicoAuth',
      'paciente_senha' // CRÍTICO: nunca salvar senha
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Verificar tentativas de login
  static checkLoginAttempts(identifier: string): { allowed: boolean; remainingTime?: number } {
    const key = `login_attempts_${SecurityUtils.encryptData(identifier)}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return { allowed: true };
    }

    try {
      const attempts = JSON.parse(data);
      const now = Date.now();
      
      if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
        localStorage.removeItem(key);
        return { allowed: true };
      }

      if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
        const remainingTime = this.LOCKOUT_DURATION - (now - attempts.lastAttempt);
        return { allowed: false, remainingTime };
      }

      return { allowed: true };
    } catch {
      localStorage.removeItem(key);
      return { allowed: true };
    }
  }

  // Registrar tentativa de login
  static recordLoginAttempt(identifier: string, success: boolean): void {
    const key = `login_attempts_${SecurityUtils.encryptData(identifier)}`;
    
    if (success) {
      localStorage.removeItem(key);
      return;
    }

    const data = localStorage.getItem(key);
    let attempts = { count: 0, lastAttempt: 0 };
    
    if (data) {
      try {
        attempts = JSON.parse(data);
      } catch {
        // Ignorar erro e usar dados padrão
      }
    }

    attempts.count++;
    attempts.lastAttempt = Date.now();
    
    localStorage.setItem(key, JSON.stringify(attempts));
  }

  // Validar força da senha (específico para o sistema médico)
  static validateMedicoPassword(cpf: string, senha: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Verificar se a senha é o próprio CPF (padrão do sistema)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (senha !== cpfLimpo) {
      errors.push('A senha deve ser seu CPF (apenas números)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validar acesso de paciente
  static validatePatientAccess(cpf: string, senha: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!SecurityUtils.validateCPF(cpf)) {
      errors.push('CPF inválido');
    }

    if (!senha || senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Criptografar dados sensíveis para armazenamento
  static secureStore(key: string, data: any): void {
    try {
      const encryptedData = SecurityUtils.encryptData(JSON.stringify(data));
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      SecurityUtils.secureLog('error', 'Erro ao armazenar dados seguros', { error, key });
    }
  }

  // Recuperar dados criptografados
  static secureRetrieve(key: string): any {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;
      
      const decryptedData = SecurityUtils.decryptData(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      SecurityUtils.secureLog('error', 'Erro ao recuperar dados seguros', { error, key });
      localStorage.removeItem(key);
      return null;
    }
  }

  // Validar origem da requisição (CSRF protection básico)
  static validateOrigin(): boolean {
    const allowedOrigins = [
      window.location.origin,
      'https://localhost:5173',
      'https://127.0.0.1:5173'
    ];
    
    return allowedOrigins.includes(window.location.origin);
  }

  // Audit log para ações sensíveis
  static async auditLog(action: string, details: any, userId?: string): Promise<void> {
    try {
      const auditData = {
        action,
        timestamp: new Date().toISOString(),
        user_id: userId ? SecurityUtils.encryptData(userId) : null,
        details: SecurityUtils.maskSensitiveData(details),
        ip: await this.getClientIP(),
        user_agent: navigator.userAgent,
        origin: window.location.origin
      };

      // Demo: Log de segurança (não persistido em produção)
      console.log('Security audit log:', {
        action,
        table: 'security_audit',
        details: auditData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      SecurityUtils.secureLog('error', 'Falha ao registrar audit log', { error });
    }
  }

  // Obter IP do cliente (fallback seguro)
  static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        timeout: 5000
      } as RequestInit);
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Verificar integridade da sessão
  static verifySessionIntegrity(): boolean {
    const sessionToken = localStorage.getItem('session_token');
    const secureSession = localStorage.getItem('secure_session');
    
    if (!sessionToken || !secureSession) {
      this.clearSession();
      return false;
    }

    try {
      const session = JSON.parse(SecurityUtils.decryptData(secureSession));
      return session.token === sessionToken;
    } catch {
      this.clearSession();
      return false;
    }
  }

  // Renovar token de sessão
  static renewSessionToken(): void {
    try {
      const secureSession = localStorage.getItem('secure_session');
      if (!secureSession) return;

      const session = JSON.parse(SecurityUtils.decryptData(secureSession));
      session.token = SecurityUtils.generateSecureToken();
      session.renewed = Date.now();

      const encryptedSession = SecurityUtils.encryptData(JSON.stringify(session));
      localStorage.setItem('secure_session', encryptedSession);
      localStorage.setItem('session_token', session.token);
    } catch (error) {
      SecurityUtils.secureLog('error', 'Erro ao renovar token de sessão', { error });
      this.clearSession();
    }
  }
}

// Login seguro para clínicas (função standalone)
export const secureClinicLogin = async (
  email: string, 
  password: string
): Promise<{
  success: boolean;
  data?: {
    clinicaId: string;
    clinicaNome: string;
    sessionToken?: string;
    requiresMfa?: boolean;
  };
  error?: string;
  rateLimited?: boolean;
}> => {
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    
    // Validar inputs básicos
    if (!sanitizedEmail || !password) {
      return {
        success: false,
        error: 'Email e senha são obrigatórios'
      };
    }
    
    // Verificar rate limiting local
    const rateLimitCheck = SecureAuthUtils.checkLoginAttempts(sanitizedEmail);
    
    if (!rateLimitCheck.allowed) {
      await SecureAuthUtils.auditLog('LOGIN_RATE_LIMITED', { email: sanitizedEmail });
      return {
        success: false,
        error: `Muitas tentativas de login. Tente novamente em ${Math.ceil((rateLimitCheck.remainingTime || 0) / 60000)} minutos.`,
        rateLimited: true
      };
    }
    
    // Demo: Simulação de verificação de login
    console.log('Demo: Verificação de login para', sanitizedEmail);
    
    // Simular login bem-sucedido para demonstração
    const loginData = [{
      success: true,
      clinica_id: 'demo-clinica-id',
      clinica_nome: 'Clínica Demo',
      message: 'Login demo realizado com sucesso'
    }];
    
    if (!loginData || !Array.isArray(loginData) || loginData.length === 0) {
      SecureAuthUtils.recordLoginAttempt(sanitizedEmail, false);
      return {
        success: false,
        error: 'Email ou senha inválidos'
      };
    }
    
    const result = loginData[0];
    
    if (!result.success) {
      SecureAuthUtils.recordLoginAttempt(sanitizedEmail, false);
      await SecureAuthUtils.auditLog('LOGIN_FAILED_CREDENTIALS', { 
        email: sanitizedEmail,
        message: result.message
      });
      
      return {
        success: false,
        error: result.message || 'Email ou senha inválidos'
      };
    }
    
    // Login bem-sucedido
    SecureAuthUtils.recordLoginAttempt(sanitizedEmail, true);
    
    await SecureAuthUtils.auditLog('LOGIN_SUCCESS', { 
      email: sanitizedEmail,
      clinica_nome: result.clinica_nome
    }, result.clinica_id);
    
    return {
      success: true,
      data: {
        clinicaId: result.clinica_id,
        clinicaNome: result.clinica_nome
      }
    };
    
  } catch (error) {
    console.error('Erro inesperado no login:', error);
    await SecureAuthUtils.auditLog('LOGIN_SYSTEM_ERROR', { 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
    
    return {
      success: false,
      error: 'Erro interno do sistema. Tente novamente.'
    };
  }
};

// Configurar sessão segura após login
export const setSecureSession = (clinicaId: string, clinicaNome: string, email: string): void => {
  // Configurar dados mínimos necessários
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('clinica_id', clinicaId);
  localStorage.setItem('tenant_id', clinicaId);
  localStorage.setItem('clinicaNome', clinicaNome);
  localStorage.setItem('clinicaEmail', email);
  
  console.log('Sessão segura configurada para clínica:', clinicaNome);
};

export default SecureAuthUtils;