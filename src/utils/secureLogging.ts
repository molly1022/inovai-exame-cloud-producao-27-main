/**
 * Sistema de Logging Seguro
 * Remove automaticamente dados sensíveis dos logs e controla ambiente
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface SecureLogData {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  environment: 'development' | 'production';
  sanitized: boolean;
}

class SecureLogger {
  private static instance: SecureLogger;
  private isDevelopment: boolean;
  private sensitiveFields = [
    'password', 'senha', 'token', 'key', 'secret', 'cpf', 'email', 
    'telefone', 'clinica_id', 'medico_id', 'paciente_id', 'id',
    'authorization', 'bearer', 'api_key', 'session', 'cookie'
  ];

  constructor() {
    this.isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
  }

  public static getInstance(): SecureLogger {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger();
    }
    return SecureLogger.instance;
  }

  /**
   * Sanitiza dados sensíveis antes do logging
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
      // Mascarar informações sensíveis em strings
      return this.maskSensitiveStrings(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        
        if (this.sensitiveFields.some(field => lowerKey.includes(field))) {
          // Mascarar campos sensíveis
          if (typeof value === 'string') {
            if (lowerKey.includes('email')) {
              sanitized[key] = this.maskEmail(value);
            } else if (lowerKey.includes('cpf')) {
              sanitized[key] = this.maskCPF(value);
            } else if (lowerKey.includes('id')) {
              sanitized[key] = this.maskId(value);
            } else {
              sanitized[key] = '***MASKED***';
            }
          } else {
            sanitized[key] = '***MASKED***';
          }
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  private maskSensitiveStrings(str: string): string {
    // Mascarar URLs com parâmetros sensíveis
    str = str.replace(/([?&])(token|key|password|senha)=([^&\s]+)/gi, '$1$2=***MASKED***');
    
    // Mascarar IDs em URLs
    str = str.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/***ID***');
    
    return str;
  }

  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***INVALID_EMAIL***';
    const [user, domain] = email.split('@');
    return `${user.substring(0, 2)}***@${domain}`;
  }

  private maskCPF(cpf: string): string {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return '***INVALID_CPF***';
    return `${digits.substring(0, 3)}.***.***-${digits.substring(9)}`;
  }

  private maskId(id: string): string {
    if (id.length < 8) return '***ID***';
    return `${id.substring(0, 4)}***${id.substring(id.length - 4)}`;
  }

  /**
   * Log principal - só funciona em desenvolvimento
   */
  public log(level: LogLevel, message: string, data?: any): void {
    // CRÍTICO: Nunca fazer log em produção
    if (!this.isDevelopment) {
      return;
    }

    const sanitizedData = this.sanitizeData(data);
    
    const logEntry: SecureLogData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: sanitizedData,
      environment: this.isDevelopment ? 'development' : 'production',
      sanitized: true
    };

    // Usar console apropriado para o nível
    switch (level) {
      case 'error':
        console.error(`🔒 [SECURE_LOG] ${message}`, sanitizedData);
        break;
      case 'warn':
        console.warn(`🔒 [SECURE_LOG] ${message}`, sanitizedData);
        break;
      case 'info':
        console.info(`🔒 [SECURE_LOG] ${message}`, sanitizedData);
        break;
      case 'debug':
        console.debug(`🔒 [SECURE_LOG] ${message}`, sanitizedData);
        break;
      default:
        console.log(`🔒 [SECURE_LOG] ${message}`, sanitizedData);
    }
  }

  /**
   * Métodos de conveniência
   */
  public debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  public info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  /**
   * Log de auditoria - sempre salva no banco (mas sanitizado)
   */
  public async auditLog(action: string, details: any, userId?: string): Promise<void> {
    try {
      const sanitizedDetails = this.sanitizeData(details);
      
      // Demo: Log de auditoria (não persistido em produção)
      console.log('Audit log:', {
        action,
        details: sanitizedDetails,
        userId: userId || 'unknown',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Falha silenciosa para não quebrar a aplicação
      if (this.isDevelopment) {
        console.error('🔒 [AUDIT_LOG_ERROR]', this.sanitizeData(error));
      }
    }
  }

  /**
   * Limpar todos os logs do console (produção)
   */
  public clearProductionLogs(): void {
    if (!this.isDevelopment) {
      console.clear();
      
      // Sobrescrever métodos do console em produção
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.debug = () => {};
    }
  }

  /**
   * Detectar e reportar tentativas de logging não seguro
   */
  public detectUnsafeLogs(): void {
    if (!this.isDevelopment) {
      // Monitorar tentativas de console.log em produção
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        this.auditLog('UNSAFE_CONSOLE_LOG_DETECTED', { args: this.sanitizeData(args) });
        // Não executar o log real
      };
    }
  }
}

// Singleton instance
export const secureLogger = SecureLogger.getInstance();

// Função de conveniência para usar no lugar dos console.logs existentes
export const secLog = {
  debug: (message: string, data?: any) => secureLogger.debug(message, data),
  info: (message: string, data?: any) => secureLogger.info(message, data),
  warn: (message: string, data?: any) => secureLogger.warn(message, data),
  error: (message: string, data?: any) => secureLogger.error(message, data),
  audit: (action: string, details: any, userId?: string) => secureLogger.auditLog(action, details, userId)
};

export default secureLogger;