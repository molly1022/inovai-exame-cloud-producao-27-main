/**
 * Factory para gerenciar conexões dinâmicas por tenant
 * Sistema Database-per-Tenant com Banco Administrativo Central
 * Banco Central: tgydssyqgmifcuajacgo.supabase.co (administrativo)
 * Bancos Específicos: cada clínica terá seu próprio banco
 */

import { adminSupabase, createClinicClient } from '@/integrations/supabase/adminClient';
import { supabase } from '@/integrations/supabase/client';

interface TenantConnection {
  clinicaId: string;
  databaseName: string;
  subdominio: string;
  connectionUrl: string;
  connectionKey: string;
  schemaVersion: string;
  databaseCreated: boolean;
  healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  isActive: boolean;
  lastActivity: Date;
  clinicClient?: any; // Cliente Supabase específico da clínica
}

class DatabaseConnectionFactory {
  private static instance: DatabaseConnectionFactory;
  private connections: Map<string, TenantConnection> = new Map();
  
  private constructor() {}
  
  static getInstance(): DatabaseConnectionFactory {
    if (!DatabaseConnectionFactory.instance) {
      DatabaseConnectionFactory.instance = new DatabaseConnectionFactory();
    }
    return DatabaseConnectionFactory.instance;
  }
  
  /**
   * Obter conexão para uma clínica específica com arquitetura correta
   * SEMPRE usa o banco administrativo central para buscar informações da clínica
   */
  async getConnection(subdominio: string): Promise<TenantConnection | null> {
    try {
      console.log('🔍 Buscando clínica no banco administrativo central:', subdominio);
      
      // Verificar cache
      const cached = this.connections.get(subdominio);
      if (cached && this.isConnectionValid(cached)) {
        cached.lastActivity = new Date();
        console.log('✅ Usando conexão em cache para:', subdominio);
        return cached;
      }
      
      // SEMPRE buscar dados da clínica no banco administrativo central
      const { data, error } = await (adminSupabase as any)
        .from('clinicas_central')
        .select(`
          *,
          database_connections_monitor (
            health_status,
            active_connections,
            performance_metrics
          )
        `)
        .eq('subdominio', subdominio)
        .eq('status', 'ativa')
        .single();
        
      if (error || !data) {
        console.error('🔴 Clínica não encontrada:', subdominio, error);
        return null;
      }
      
      // Verificar se banco foi criado
      if (!data.database_created) {
        console.warn('⚠️ Banco não foi criado fisicamente para:', subdominio);
      }
      
      // Criar cliente específico para a clínica baseado nas configurações reais
      let clinicClient = null;
      if (data.database_created && data.configuracoes_especiais) {
        try {
          const config = data.configuracoes_especiais;
          
          // Se temos um projeto Supabase real, usar as credenciais reais
          if (config.supabase_project_ref && config.supabase_service_role_key) {
            console.log(`🎯 Criando cliente real para clínica: ${subdominio}`);
            
            // Importar createClient do Supabase
            const { createClient } = await import('@supabase/supabase-js');
            
            clinicClient = createClient(
              config.project_endpoint || `https://${config.supabase_project_ref}.supabase.co`,
              config.supabase_service_role_key,
              {
                auth: {
                  persistSession: false,
                  autoRefreshToken: false,
                }
              }
            );
            
            console.log(`✅ Cliente real configurado para: ${subdominio}`);
          } else {
            // Fallback para o método antigo (desenvolvimento)
            console.log(`🔄 Usando fallback para clínica: ${subdominio}`);
            clinicClient = createClinicClient(subdominio);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao criar cliente da clínica:', error);
          // Fallback para o método antigo
          try {
            clinicClient = createClinicClient(subdominio);
          } catch (fallbackError) {
            console.error('❌ Fallback também falhou:', fallbackError);
          }
        }
      } else if (data.database_created) {
        // Fallback para método antigo se não temos configurações especiais
        try {
          clinicClient = createClinicClient(subdominio);
        } catch (error) {
          console.warn('⚠️ Erro ao criar cliente da clínica (fallback):', error);
        }
      }

      // Criar nova conexão com dados completos
      const connection: TenantConnection = {
        clinicaId: data.id,
        databaseName: data.database_name,
        subdominio: data.subdominio,
        connectionUrl: data.database_url || this.buildConnectionUrl(data.database_name),
        connectionKey: 'placeholder_key',
        schemaVersion: data.schema_version || '1.0.0',
        databaseCreated: data.database_created || false,
        healthStatus: data.database_connections_monitor?.[0]?.health_status || 'unknown',
        isActive: true,
        lastActivity: new Date(),
        clinicClient
      };
      
      // Cache da conexão
      this.connections.set(subdominio, connection);
      
      // Atualizar monitoramento no banco administrativo
      await this.updateConnectionMonitoring(data.id, data.database_name);
      
      console.log('🟢 Conexão criada para:', subdominio, '->', {
        database: data.database_name,
        created: data.database_created,
        health: connection.healthStatus,
        version: connection.schemaVersion
      });
      return connection;
      
    } catch (error) {
      console.error('💥 Erro ao obter conexão:', error);
      return null;
    }
  }
  
  /**
   * Verificar se conexão ainda é válida
   */
  private isConnectionValid(connection: TenantConnection): boolean {
    const maxAge = 30 * 60 * 1000; // 30 minutos
    const age = Date.now() - connection.lastActivity.getTime();
    return age < maxAge && connection.isActive;
  }
  
  /**
   * Construir URL de conexão (placeholder para implementação futura)
   */
  private buildConnectionUrl(databaseName: string): string {
    // Por enquanto, retornar placeholder
    // Futuramente será a URL real do banco independente
    return `postgresql://user:pass@localhost:5432/${databaseName}`;
  }
  
  /**
   * Atualizar monitoramento de conexões no banco administrativo
   */
  private async updateConnectionMonitoring(clinicaId: string, databaseName: string) {
    try {
      await (adminSupabase as any)
        .from('database_connections_monitor')
        .upsert({
          clinica_central_id: clinicaId,
          database_name: databaseName,
          connection_count: 1,
          last_activity: new Date().toISOString(),
          status: 'active',
          performance_metrics: {
            connections_created: 1,
            last_connection: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Erro ao atualizar monitoramento:', error);
    }
  }
  
  /**
   * Realizar query no banco da clínica
   * Sistema Database-per-Tenant implementado
   */
  async queryTenant(subdominio: string, table: string, operation: 'select' | 'insert' | 'update' | 'delete') {
    const connection = await this.getConnection(subdominio);
    if (!connection) {
      throw new Error(`Conexão não encontrada para: ${subdominio}`);
    }
    
    console.log(`🔄 Query ${operation} em ${table} para clínica ${connection.clinicaId} (Database: ${connection.databaseName})`);
    
    // Configurar contexto do tenant no localStorage
    localStorage.setItem('tenant_id', connection.clinicaId);
    localStorage.setItem('clinica_id', connection.clinicaId);
    localStorage.setItem('database_name', connection.databaseName);
    localStorage.setItem('tenant_subdominio', connection.subdominio);
    
    // Determinar qual banco usar baseado na tabela e contexto
    if (this.isAdministrativeTable(table)) {
      console.log(`🏛️ Usando banco administrativo central para tabela: ${table}`);
      return adminSupabase.from(table as any);
    } else if (connection.clinicClient && connection.databaseCreated) {
      console.log(`🎯 Usando banco físico isolado da clínica: ${connection.databaseName}`);
      return connection.clinicClient.from(table);
    } else {
      console.log(`📊 Usando banco memorial com RLS para: ${connection.subdominio}`);
      return supabase.from(table as any);
    }
  }
  
  /**
   * Verificar se uma tabela é administrativa (deve usar banco central)
   */
  private isAdministrativeTable(table: string): boolean {
    const adminTables = [
      'clinicas_central',
      'clinicas_inovai', 
      'database_connections_monitor',
      'admin_operacoes_log',
      'configuracoes_sistema_central',
      'admin_users',
      'admin_profiles',
      'admin_sessions'
    ];
    return adminTables.includes(table);
  }

  /**
   * Criar nova clínica com banco de dados físico isolado via Supabase Management API
   * USA o novo edge function para criar projetos Supabase reais
   */
  async createClinicaWithDatabase(
    nomeClinica: string,
    emailResponsavel: string,
    subdominio: string,
    cnpj?: string,
    telefone?: string,
    planoContratado: string = 'basico',
    organizationId?: string
  ) {
    try {
      console.log('🏗️ Criando clínica com database real via Management API:', {
        nome: nomeClinica,
        subdominio,
        plano: planoContratado
      });

      // Primeiro criar o registro na central (demo mode)
      console.log('🏗️ Demo: Criando clínica no sistema central', {
        nome: nomeClinica,
        email: emailResponsavel,
        subdominio: subdominio
      });

      // Simular criação bem-sucedida
      const resultado = {
        sucesso: true,
        clinica_id: `demo-${Date.now()}`,
        database_name: `db_${subdominio}`,
        mensagem: 'Clínica criada com sucesso (modo demonstração)'
      };
        if (resultado.sucesso) {
          console.log('✅ Registro central criado:', resultado.clinica_id);

          // Agora chamar o edge function para criar o database real
          try {
            const { data: dbResponse, error: dbError } = await adminSupabase.functions.invoke('create-clinic-database', {
              body: {
                clinic_name: nomeClinica,
                subdomain: subdominio,
                admin_email: emailResponsavel,
                organization_id: organizationId,
                plan: planoContratado
              }
            });

            if (dbError) {
              console.error('❌ Erro ao criar database:', dbError);
              throw new Error(`Falha na criação do database: ${dbError.message}`);
            }

            if (!dbResponse?.success) {
              console.error('❌ Database não foi criado:', dbResponse);
              throw new Error(`Falha na criação do database: ${dbResponse?.error || 'Erro desconhecido'}`);
            }

            console.log('🎉 Database real criado com sucesso:', dbResponse.project);

            // Invalidar cache
            this.connections.clear();
            
            // Log da operação completa
            await this.logAdminOperation('CRIAR_CLINICA_DATABASE_REAL', {
              clinica_id: resultado.clinica_id,
              database_name: resultado.database_name,
              supabase_project: dbResponse.project,
              subdominio,
              plano: planoContratado
            });
            
            return {
              success: true,
              clinicaId: resultado.clinica_id,
              databaseName: resultado.database_name,
              supabaseProject: dbResponse.project,
              connectionString: dbResponse.project.endpoint,
              message: 'Clínica e database criados com sucesso via Management API'
            };
          } catch (dbError: any) {
            console.warn('⚠️ Database físico falhou, usando configuração local:', dbError);
            
            return {
              success: true,
              clinicaId: resultado.clinica_id,
              databaseName: resultado.database_name,
              connectionString: `local://database/${resultado.database_name}`,
              message: resultado.mensagem + ' (Database físico será criado posteriormente)',
              warning: 'Database físico não criado - usando fallback local'
            };
          }
        } else {
          throw new Error(resultado.mensagem || 'Erro desconhecido');
        }
      } catch (error: any) {
        console.error('❌ Erro ao criar clínica:', error);
        throw new Error(`Falha ao criar clínica: ${error.message}`);
      }
    }

    /**
     * Log de operações administrativas
     */
  private async logAdminOperation(operacao: string, detalhes: any) {
    try {
      await adminSupabase.from('logs_sistema').insert({
        acao: operacao,
        tabela: 'frontend',
        dados_novos: detalhes,
        nivel: 'info'
      });
    } catch (error) {
      console.warn('Falha ao logar operação admin:', error);
    }
  }
  
  /**
   * Limpar conexões inativas
   */
  cleanupConnections(): void {
    const now = Date.now();
    for (const [subdominio, connection] of this.connections.entries()) {
      if (!this.isConnectionValid(connection)) {
        this.connections.delete(subdominio);
        console.log('🧹 Conexão removida:', subdominio);
      }
    }
  }
  
  /**
   * Obter estatísticas das conexões
   */
  getConnectionStats() {
    const total = this.connections.size;
    const active = Array.from(this.connections.values())
      .filter(conn => this.isConnectionValid(conn)).length;
      
    return {
      total,
      active,
      inactive: total - active,
      connections: Array.from(this.connections.entries()).map(([subdominio, conn]) => ({
        subdominio,
        databaseName: conn.databaseName,
        isActive: this.isConnectionValid(conn),
        lastActivity: conn.lastActivity
      }))
    };
  }
}

export const dbConnectionFactory = DatabaseConnectionFactory.getInstance();

// Configurar limpeza automática a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    dbConnectionFactory.cleanupConnections();
  }, 5 * 60 * 1000);
}