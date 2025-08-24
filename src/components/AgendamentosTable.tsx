
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface AgendamentosTableProps {
  agendamentos: Array<any>;
}

const AgendamentosTable = ({ agendamentos }: AgendamentosTableProps) => {
  if (!agendamentos.length) {
    return <p className="text-center text-gray-400 py-6">Nenhum agendamento disponível nos filtros atuais.</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead>Paciente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {agendamentos.map((ag) => (
          <TableRow key={ag.id}>
            <TableCell>{ag.data_agendamento ? new Date(ag.data_agendamento).toLocaleDateString('pt-BR') : ''}</TableCell>
            <TableCell className="capitalize">{ag.status}</TableCell>
            <TableCell>{ag.medico_nome || '-'}</TableCell>
            <TableCell>{ag.paciente_nome || '-'}</TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default AgendamentosTable;
