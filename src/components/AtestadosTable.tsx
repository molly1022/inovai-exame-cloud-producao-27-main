import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye, FileText, Plus, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AtestadoModal from './AtestadoModal';
import AtestadoViewModal from './AtestadoViewModal';
import { useTenantId } from '@/hooks/useTenantId';
import { TenantGuard } from './TenantGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Atestado {
  id: string;
  paciente: {
    nome: string;
    cpf: string;
  };
  medico: {
    nome_completo: string;
    crm?: string;
    coren?: string;
  };
  data_emissao: string;
  dias_afastamento: number;
  data_inicio_afastamento: string;
  data_fim_afastamento: string;
  observacoes: string;
  cid?: string;
}

const AtestadosTable = () => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <AtestadosTableContent />
    </TenantGuard>
  );
};

const AtestadosTableContent = () => {
  const mockAtestados = [
    {
      id: '1',
      paciente: { nome: 'João Silva', cpf: '123.456.789-00' },
      medico: { nome_completo: 'Dr. Maria Santos', crm: '12345' },
      data_emissao: '2024-01-15',
      dias_afastamento: 3,
      data_inicio_afastamento: '2024-01-15',
      data_fim_afastamento: '2024-01-17',
      observacoes: 'Repouso médico por quadro gripal',
      cid: 'Z76.3'
    },
    {
      id: '2', 
      paciente: { nome: 'Ana Costa', cpf: '987.654.321-00' },
      medico: { nome_completo: 'Dr. João Oliveira', crm: '67890' },
      data_emissao: '2024-01-10',
      dias_afastamento: 5,
      data_inicio_afastamento: '2024-01-10',
      data_fim_afastamento: '2024-01-14',
      observacoes: 'Afastamento para tratamento médico',
      cid: 'M79.3'
    }
  ];

  return (
    <div className="space-y-4">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Demonstração de Atestados</strong> - Dados reais estarão disponíveis quando acessado via subdomínio da clínica específica.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Buscar atestados..."
            disabled
            className="max-w-md opacity-75"
          />
        </div>
        <Button disabled className="opacity-75">
          <Plus className="mr-2 h-4 w-4" />
          Novo Atestado (Demo)
        </Button>
      </div>

      <div className="rounded-md border opacity-75">
        <Table>
          <TableCaption>Lista de atestados médicos - Dados simulados para demonstração.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Dias</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAtestados.map((atestado) => (
              <TableRow key={atestado.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{atestado.paciente.nome}</div>
                    <div className="text-sm text-gray-500">CPF: {atestado.paciente.cpf}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{atestado.medico.nome_completo}</div>
                    <div className="text-sm text-gray-500">CRM: {atestado.medico.crm}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(atestado.data_emissao), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(atestado.data_inicio_afastamento), "dd/MM/yyyy")}</div>
                    <div className="text-gray-500">até</div>
                    <div>{format(new Date(atestado.data_fim_afastamento), "dd/MM/yyyy")}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {atestado.dias_afastamento} {atestado.dias_afastamento === 1 ? 'dia' : 'dias'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" disabled title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AtestadosTable;