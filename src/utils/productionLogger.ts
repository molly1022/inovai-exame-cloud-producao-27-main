// Configuração para silenciar logs em produção
import { secureLogger } from '@/utils/secureLogging';

class ProductionLogger {
  static initialize() {
    if (process.env.NODE_ENV === 'production') {
      // Sobrescrever console.log/error/warn em produção
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };

      console.log = (...args: any[]) => {
        // Em produção, redirecionar para o secure logger (que não faz nada em prod)
        secureLogger.info('Console log intercepted', { args: args.length });
      };

      console.error = (...args: any[]) => {
        // Permitir apenas erros críticos e já sanitizados
        if (args[0]?.includes?.('CRITICAL') || args[0]?.includes?.('SYSTEM_ERROR')) {
          originalConsole.error(...args);
        }
        secureLogger.error('Console error intercepted', { args: args.length });
      };

      console.warn = (...args: any[]) => {
        secureLogger.warn('Console warn intercepted', { args: args.length });
      };

      console.info = (...args: any[]) => {
        secureLogger.info('Console info intercepted', { args: args.length });
      };
    }
  }

  // Método para logging seguro em produção (apenas erros críticos)
  static criticalError(message: string, context?: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`CRITICAL: ${message}`, context ? 'Context available' : '');
      secureLogger.auditLog('CRITICAL_ERROR', { message, hasContext: !!context });
    } else {
      console.error(`CRITICAL: ${message}`, context);
    }
  }
}

export default ProductionLogger;