
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfiguracaoEmailLembretes from '@/components/ConfiguracaoEmailLembretes';
import EmailSystemStatus from '@/components/EmailSystemStatus';
import EmailProblemasManager from '@/components/EmailProblemasManager';
import EmailSystemTest from '@/components/EmailSystemTest';
import { useEmailLembretes } from '@/hooks/useEmailLembretes';
import { FeaturePageGate } from '@/components/FeaturePageGate';

const ConfiguracaoEmails = () => {
  return (
    <FeaturePageGate
      feature="emails"
      featureName="Sistema de Emails Automáticos"
      description="Configure lembretes automáticos por email, monitore envios e gerencie problemas de entrega."
      requiredPlan="intermediario_medico"
    >
      <ConfiguracaoEmailsContent />
    </FeaturePageGate>
  );
};

const ConfiguracaoEmailsContent = () => {
  const { lembretes, recarregarDados } = useEmailLembretes();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sistema de Emails Automático
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Configure e monitore lembretes automáticos por email para seus pacientes
        </p>
      </div>
      
      <Tabs defaultValue="configuracao" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="status">Status & Monitor</TabsTrigger>
          <TabsTrigger value="problemas">Problemas</TabsTrigger>
          <TabsTrigger value="teste">Teste Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuracao">
          <ConfiguracaoEmailLembretes />
        </TabsContent>
        
        <TabsContent value="status">
          <EmailSystemStatus />
        </TabsContent>
        
        <TabsContent value="problemas">
          <EmailProblemasManager 
            lembretes={lembretes} 
            onRecarregar={recarregarDados} 
          />
        </TabsContent>
        
        <TabsContent value="teste">
          <EmailSystemTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracaoEmails;
