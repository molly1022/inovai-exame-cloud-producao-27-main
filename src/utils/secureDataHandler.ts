/**
 * Handler de Dados Seguros
 * Garante que dados sensíveis não sejam expostos no frontend
 */

import { dataSanitizer } from './secureDataSanitizer';

class SecureDataHandler {
  
  // Filtrar dados de resposta para frontend
  static filterResponseData(data: any, context: 'clinica' | 'medico' | 'funcionario' | 'paciente'): any {
    if (!data) return data;
    
    // Campos específicos por contexto que NUNCA devem ir para o frontend
    const forbiddenFields = {
      clinica: ['senha_hash', 'senha_acesso_clinica', 'codigo_acesso_admin', 'stripe_customer_id'],
      medico: ['senha', 'senha_hash', 'token_acesso'],
      funcionario: ['senha', 'senha_hash', 'token_acesso'],
      paciente: ['senha_acesso', 'senha_hash', 'numero_convenio']
    };

    const contextForbidden = forbiddenFields[context] || [];
    
    // Remover campos proibidos
    const filtered = { ...data };
    contextForbidden.forEach(field => {
      delete filtered[field];
    });

    // Aplicar sanitização geral
    return dataSanitizer.sanitizeForFrontend(filtered);
  }

  // Mascarar dados para logs
  static maskForLogs(data: any): any {
    return dataSanitizer.sanitizeForLogs(data);
  }

  // Verificar se dados contêm informações sensíveis
  static containsSensitiveData(data: any): boolean {
    return dataSanitizer.containsSensitiveData(data);
  }

  // Limpeza segura de variáveis
  static secureCleanup(): void {
    // Limpar variáveis globais que possam conter dados sensíveis
    if (typeof window !== 'undefined') {
      // Limpar propriedades do window que possam ter sido criadas acidentalmente
      const sensitiveProps = ['senha', 'password', 'cpf', 'email', 'token'];
      sensitiveProps.forEach(prop => {
        if ((window as any)[prop]) {
          delete (window as any)[prop];
        }
      });
    }
  }

  // Validar estrutura de dados antes de envio
  static validateDataStructure(data: any, expectedFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('Dados devem ser um objeto válido');
      return { valid: false, errors };
    }

    // Verificar campos obrigatórios
    expectedFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Campo obrigatório ausente: ${field}`);
      }
    });

    // Verificar se há campos proibidos
    if (this.containsSensitiveData(data)) {
      errors.push('Dados contêm informações sensíveis não permitidas');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Criar versão segura para armazenamento local
  static createSecureLocalVersion(data: any, context: string): any {
    const filtered = this.filterResponseData(data, context as any);
    return dataSanitizer.createSecureVersion(filtered);
  }

  // Validar acesso a dados (compatibilidade)
  static validateDataAccess(data: any): { valid: boolean; message?: string } {
    if (!data) {
      return { valid: false, message: 'Dados não fornecidos' };
    }

    if (this.containsSensitiveData(data)) {
      return { valid: false, message: 'Dados contêm informações sensíveis' };
    }

    return { valid: true };
  }

  // Sanitizar entrada do usuário (compatibilidade)
  static sanitizeUserInput(input: string): string {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>"';&|`]/g, '') // Remove caracteres perigosos
      .trim();
  }

  // Validar dados de formulário (compatibilidade)
  static validateFormData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('Dados de formulário inválidos');
      return { valid: false, errors };
    }

    // Verificar se há campos sensíveis expostos
    if (this.containsSensitiveData(data)) {
      errors.push('Formulário contém dados sensíveis não permitidos');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default SecureDataHandler;