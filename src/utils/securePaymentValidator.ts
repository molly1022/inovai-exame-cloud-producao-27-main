/**
 * Validador de Segurança para Sistema de Pagamentos
 * Garante que nenhum dado sensível seja exposto no frontend
 */

import { secLog } from './secureLogging';
import dataSanitizer from './secureDataSanitizer';

interface PaymentSecurityCheck {
  isSecure: boolean;
  violations: string[];
  recommendations: string[];
}

interface SecurePaymentData {
  displayAmount: number;
  planName: string;
  currency: string;
  isValid: boolean;
}

class SecurePaymentValidator {
  private static instance: SecurePaymentValidator;
  
  // Campos que NUNCA devem aparecer no frontend de pagamentos
  private readonly FORBIDDEN_PAYMENT_FIELDS = [
    'stripe_secret_key', 'mercadopago_access_token', 'payment_gateway_secret',
    'customer_id', 'subscription_id', 'payment_method_id', 'bank_account',
    'credit_card_number', 'cvv', 'expiry_date', 'billing_address',
    'internal_price_calculation', 'cost_breakdown', 'margin',
    'commission_rate', 'gateway_response', 'transaction_id'
  ];

  // URLs que não devem ser expostas
  private readonly FORBIDDEN_URLS = [
    'webhook_url', 'callback_url', 'notification_url',
    'admin_dashboard_url', 'internal_api_url'
  ];

  public static getInstance(): SecurePaymentValidator {
    if (!SecurePaymentValidator.instance) {
      SecurePaymentValidator.instance = new SecurePaymentValidator();
    }
    return SecurePaymentValidator.instance;
  }

  /**
   * Valida se dados de pagamento são seguros para exibição
   */
  public validatePaymentDisplay(data: any): PaymentSecurityCheck {
    const violations: string[] = [];
    const recommendations: string[] = [];

    if (!data) {
      return {
        isSecure: false,
        violations: ['Dados de pagamento não fornecidos'],
        recommendations: ['Implementar validação de dados obrigatórios']
      };
    }

    // Verificar campos proibidos
    this.checkForbiddenFields(data, violations);
    
    // Verificar URLs expostas
    this.checkExposedUrls(data, violations);
    
    // Verificar IDs sensíveis
    this.checkSensitiveIds(data, violations);
    
    // Verificar logs inseguros
    this.checkUnsafeLogs(data, violations);

    // Gerar recomendações
    this.generateRecommendations(violations, recommendations);

    const isSecure = violations.length === 0;

    if (!isSecure) {
      secLog.warn('Violações de segurança detectadas no sistema de pagamentos', {
        violations_count: violations.length,
        violations_summary: violations.slice(0, 3) // Apenas primeiras 3 para não logar demais
      });
    }

    return { isSecure, violations, recommendations };
  }

  /**
   * Cria versão segura dos dados de pagamento para o frontend
   */
  public createSecurePaymentData(amount: number, planName: string): SecurePaymentData {
    // Validar que valores são seguros para exibição
    const safeAmount = this.validateAndSanitizeAmount(amount);
    const safePlanName = this.sanitizePlanName(planName);

    return {
      displayAmount: safeAmount,
      planName: safePlanName,
      currency: 'BRL',
      isValid: safeAmount > 0 && safePlanName.length > 0
    };
  }

  /**
   * Verifica se componente de pagamento está seguro
   */
  public auditPaymentComponent(componentName: string, props: any): void {
    secLog.audit('PAYMENT_COMPONENT_AUDIT', {
      component: componentName,
      props_sanitized: dataSanitizer.sanitizeForLogs(props),
      security_check: this.validatePaymentDisplay(props)
    });
  }

  /**
   * Valida URL de redirecionamento de pagamento
   */
  public validatePaymentRedirectUrl(url: string): boolean {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      
      // URLs válidas devem ser HTTPS em produção
      if (urlObj.protocol !== 'https:' && !this.isDevelopment()) {
        secLog.warn('URL de pagamento não HTTPS detectada', { url: dataSanitizer.sanitizeUrls(url) });
        return false;
      }

      // Verificar domínios permitidos
      const allowedDomains = ['mercadopago.com.br', 'mercadopago.com', 'stripe.com'];
      const isAllowedDomain = allowedDomains.some(domain => urlObj.hostname.includes(domain));
      
      if (!isAllowedDomain) {
        secLog.warn('Domínio de pagamento não autorizado', { domain: urlObj.hostname });
        return false;
      }

      return true;
    } catch (error) {
      secLog.error('URL de pagamento inválida', { url: dataSanitizer.sanitizeUrls(url), error });
      return false;
    }
  }

  /**
   * Limpa dados de pagamento da memória
   */
  public clearPaymentData(): void {
    // Limpar localStorage
    const paymentKeys = ['payment_intent', 'checkout_session', 'payment_method'];
    paymentKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    secLog.info('Dados de pagamento limpos da memória');
  }

  private checkForbiddenFields(data: any, violations: string[]): void {
    const dataStr = JSON.stringify(data).toLowerCase();
    
    this.FORBIDDEN_PAYMENT_FIELDS.forEach(field => {
      if (dataStr.includes(field)) {
        violations.push(`Campo proibido detectado: ${field}`);
      }
    });
  }

  private checkExposedUrls(data: any, violations: string[]): void {
    const dataStr = JSON.stringify(data);
    
    // Verificar se há URLs internas expostas
    const urlPatterns = [
      /https?:\/\/.*\.supabase\.co\/functions/gi,
      /https?:\/\/localhost:\d+/gi,
      /https?:\/\/.*\.local/gi
    ];

    urlPatterns.forEach(pattern => {
      if (pattern.test(dataStr)) {
        violations.push('URL interna exposta nos dados de pagamento');
      }
    });
  }

  private checkSensitiveIds(data: any, violations: string[]): void {
    const dataStr = JSON.stringify(data);
    
    // Verificar se há muitos UUIDs expostos
    const uuidMatches = dataStr.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi);
    
    if (uuidMatches && uuidMatches.length > 2) {
      violations.push('Múltiplos IDs internos expostos');
    }
  }

  private checkUnsafeLogs(data: any, violations: string[]): void {
    // Verificar se há console.log com dados sensíveis
    const dataStr = JSON.stringify(data);
    
    if (dataStr.includes('console.log') || dataStr.includes('console.error')) {
      violations.push('Logs inseguros detectados nos dados');
    }
  }

  private generateRecommendations(violations: string[], recommendations: string[]): void {
    if (violations.some(v => v.includes('Campo proibido'))) {
      recommendations.push('Implementar sanitização de dados antes da exibição');
    }
    
    if (violations.some(v => v.includes('URL interna'))) {
      recommendations.push('Usar variáveis de ambiente para URLs internas');
    }
    
    if (violations.some(v => v.includes('IDs internos'))) {
      recommendations.push('Implementar mascaramento de IDs sensíveis');
    }
    
    if (violations.some(v => v.includes('Logs inseguros'))) {
      recommendations.push('Usar sistema de logging seguro');
    }
  }

  private validateAndSanitizeAmount(amount: number): number {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      secLog.warn('Valor de pagamento inválido detectado', { amount });
      return 0;
    }
    
    // Limitar valores muito altos (possível erro ou ataque)
    if (amount > 10000) {
      secLog.warn('Valor de pagamento suspeito (muito alto)', { amount });
      return 0;
    }
    
    return Math.round(amount * 100) / 100; // Garantir 2 casas decimais
  }

  private sanitizePlanName(planName: string): string {
    if (typeof planName !== 'string') return '';
    
    // Remover caracteres perigosos
    const sanitized = planName
      .replace(/[<>\"'&]/g, '')
      .replace(/script/gi, '')
      .trim();
    
    return sanitized.substring(0, 50); // Limitar tamanho
  }

  private isDevelopment(): boolean {
    return import.meta.env.DEV || window.location.hostname === 'localhost';
  }
}

// Singleton instance
export const paymentValidator = SecurePaymentValidator.getInstance();

export default paymentValidator;