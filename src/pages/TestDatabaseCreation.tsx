import { TestClinicCreation } from '@/components/TestClinicCreation';
import DashboardLayout from '@/components/DashboardLayout';

export default function TestDatabaseCreation() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sistema de Criação Automática de Databases</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Teste completo da integração com Supabase Management API para criação automática 
            de projetos isolados por clínica
          </p>
        </div>
        
        <div className="flex justify-center">
          <TestClinicCreation />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4 text-sm">
          <h2 className="text-xl font-semibold">Como Funciona</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">1. Registro Central</h3>
              <p className="text-muted-foreground">
                Primeiro cria o registro da clínica no banco administrativo central usando a função 
                <code className="bg-muted px-1 rounded">criar_clinica_com_database</code>
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">2. Criação do Projeto</h3>
              <p className="text-muted-foreground">
                Chama o edge function <code className="bg-muted px-1 rounded">create-clinic-database</code> 
                que usa a Supabase Management API para criar um projeto isolado
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">3. Configuração Inicial</h3>
              <p className="text-muted-foreground">
                Executa <code className="bg-muted px-1 rounded">setup-clinic-schema</code> 
                para criar tabelas, RLS policies e dados iniciais no novo projeto
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">4. Conexão Dinâmica</h3>
              <p className="text-muted-foreground">
                O <code className="bg-muted px-1 rounded">DatabaseConnectionFactory</code> 
                usa as credenciais reais para conectar automaticamente com o banco isolado
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">⚠️ Requisitos</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>SUPABASE_MANAGEMENT_API_KEY</strong> configurada nos secrets</li>
              <li>• Organization ID do Supabase (atualmente usando 'default')</li>
              <li>• Permissões para criar projetos na sua organização Supabase</li>
              <li>• Edge functions deployadas e funcionais</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-green-800">✅ Benefícios</h3>
            <ul className="space-y-1 text-green-700">
              <li>• <strong>Isolamento Total:</strong> Cada clínica tem seu próprio projeto Supabase</li>
              <li>• <strong>Escalabilidade:</strong> Sem limites de RLS ou performance</li>
              <li>• <strong>Segurança:</strong> Dados completamente separados</li>
              <li>• <strong>Customização:</strong> Cada clínica pode ter configurações específicas</li>
              <li>• <strong>Backup Independente:</strong> Cada clínica controla seus próprios backups</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}