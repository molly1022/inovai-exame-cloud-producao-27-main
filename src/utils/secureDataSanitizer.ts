/**
 * Sanitizador de Dados Críticos
 * Remove informações sensíveis antes de qualquer operação
 */

interface SanitizationRules {
  removeFields: string[];
  maskFields: string[];
  encryptFields: string[];
}

class SecureDataSanitizer {
  private static instance: SecureDataSanitizer;
  
  // Campos que devem ser REMOVIDOS completamente
  private readonly REMOVE_FIELDS = [
    'password', 'senha', 'token', 'secret', 'key', 'api_key',
    'session_token', 'refresh_token', 'access_token', 'auth_token',
    'stripe_customer_id', 'stripe_subscription_id', 'payment_method_id'
  ];

  // Campos que devem ser MASCARADOS
  private readonly MASK_FIELDS = [
    'cpf', 'email', 'telefone', 'rg', 'numero_convenio',
    'nome_pai', 'nome_mae', 'endereco_completo', 'cep'
  ];

  // Campos que devem ser CRIPTOGRAFADOS
  private readonly ENCRYPT_FIELDS = [
    'clinica_id', 'medico_id', 'paciente_id', 'funcionario_id', 'agendamento_id'
  ];

  public static getInstance(): SecureDataSanitizer {
    if (!SecureDataSanitizer.instance) {
      SecureDataSanitizer.instance = new SecureDataSanitizer();
    }
    return SecureDataSanitizer.instance;
  }

  /**
   * Sanitiza objeto removendo campos sensíveis
   */
  public sanitizeForFrontend(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForFrontend(item));
    }

    if (typeof data !== 'object' || data instanceof Date) {
      return data;
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // REMOVER campos sensíveis completamente
      if (this.REMOVE_FIELDS.some(field => lowerKey.includes(field))) {
        continue; // Não incluir no objeto sanitizado
      }

      // MASCARAR campos pessoais
      if (this.MASK_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = this.maskField(key, value);
        continue;
      }

      // CRIPTOGRAFAR IDs (apenas para logs)
      if (this.ENCRYPT_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = this.hashId(String(value));
        continue;
      }

      // Processar recursivamente objetos nested
      sanitized[key] = this.sanitizeForFrontend(value);
    }

    return sanitized;
  }

  /**
   * Sanitiza para logs (mais restritivo)
   */
  public sanitizeForLogs(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLogs(item));
    }

    if (typeof data !== 'object' || data instanceof Date) {
      return this.maskIfSensitive(data);
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Para logs, ser ainda mais restritivo
      const allSensitiveFields = [
        ...this.REMOVE_FIELDS,
        ...this.MASK_FIELDS,
        ...this.ENCRYPT_FIELDS,
        'id', 'url', 'link', 'path'
      ];

      if (allSensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '***MASKED_FOR_LOG***';
        continue;
      }

      sanitized[key] = this.sanitizeForLogs(value);
    }

    return sanitized;
  }

  /**
   * Remove URLs sensíveis de strings
   */
  public sanitizeUrls(text: string): string {
    if (typeof text !== 'string') return text;

    // Remover parâmetros sensíveis de URLs
    text = text.replace(/([?&])(token|key|id|password|senha|secret)=([^&\s]+)/gi, '$1$2=***MASKED***');
    
    // Mascarar IDs em paths
    text = text.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/***ID***');
    
    // Remover API keys de URLs
    text = text.replace(/(api_key|apikey|access_token)=[\w-]+/gi, '$1=***MASKED***');

    return text;
  }

  /**
   * Verifica se dados contêm informações sensíveis
   */
  public containsSensitiveData(data: any): boolean {
    if (!data) return false;

    const dataStr = JSON.stringify(data).toLowerCase();
    
    const sensitivePatterns = [
      /senha/, /password/, /token/, /secret/, /key/,
      /\d{3}\.\d{3}\.\d{3}-\d{2}/, // CPF pattern
      /\w+@\w+\.\w+/, // Email pattern
      /\(\d{2}\)\s?\d{4,5}-?\d{4}/, // Phone pattern
      /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/ // UUID pattern
    ];

    return sensitivePatterns.some(pattern => pattern.test(dataStr));
  }

  /**
   * Cria versão segura para armazenamento
   */
  public createSecureVersion(data: any): any {
    const sanitized = this.sanitizeForFrontend(data);
    
    // Adicionar metadados de segurança
    return {
      ...sanitized,
      _security: {
        sanitized: true,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  private maskField(fieldName: string, value: any): string {
    if (!value) return value;
    
    const str = String(value);
    const lowerFieldName = fieldName.toLowerCase();

    if (lowerFieldName.includes('email')) {
      return this.maskEmail(str);
    }
    
    if (lowerFieldName.includes('cpf')) {
      return this.maskCPF(str);
    }
    
    if (lowerFieldName.includes('telefone')) {
      return this.maskPhone(str);
    }
    
    // Mascaramento genérico
    if (str.length <= 3) return '***';
    if (str.length <= 6) return str.substring(0, 1) + '***' + str.substring(str.length - 1);
    return str.substring(0, 2) + '***' + str.substring(str.length - 2);
  }

  private maskEmail(email: string): string {
    if (!email.includes('@')) return '***INVALID***';
    const [user, domain] = email.split('@');
    const maskedUser = user.length > 2 ? user.substring(0, 2) + '***' : '***';
    return `${maskedUser}@${domain}`;
  }

  private maskCPF(cpf: string): string {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return '***INVALID***';
    return `${digits.substring(0, 3)}.***.***.${digits.substring(9)}`;
  }

  private maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) return '***INVALID***';
    return `(${digits.substring(0, 2)}) ****-${digits.substring(digits.length - 4)}`;
  }

  private hashId(id: string): string {
    // Simple hash para IDs (não é criptografia real, apenas ofuscação)
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `***${Math.abs(hash).toString(36).toUpperCase()}***`;
  }

  private maskIfSensitive(value: any): any {
    if (typeof value !== 'string') return value;
    
    // Se parece com dados sensíveis, mascarar
    if (this.containsSensitiveData(value)) {
      return '***MASKED***';
    }
    
    return value;
  }
}

// Singleton instance
export const dataSanitizer = SecureDataSanitizer.getInstance();

export default dataSanitizer;