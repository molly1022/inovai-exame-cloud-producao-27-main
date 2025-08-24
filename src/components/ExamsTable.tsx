
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface ExamsTableProps {
  exams: Array<any>;
}

const ExamsTable = ({ exams }: ExamsTableProps) => {
  if (!exams.length) {
    return <p className="text-center text-gray-400 py-6">Nenhum exame disponível nos filtros atuais.</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paciente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {exams.map((ex) => (
          <TableRow key={ex.id}>
            <TableCell>{ex.data_exame ? new Date(ex.data_exame).toLocaleDateString('pt-BR') : ''}</TableCell>
            <TableCell className="capitalize">{ex.tipo}</TableCell>
            <TableCell>{ex.medico_nome || '-'}</TableCell>
            <TableCell><span className="capitalize">{ex.status || "-"}</span></TableCell>
            <TableCell>{ex.paciente_nome || '-'}</TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default ExamsTable;
