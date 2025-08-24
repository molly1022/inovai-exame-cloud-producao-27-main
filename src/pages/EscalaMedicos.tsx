import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BloqueioMedicoModal from '@/components/BloqueioMedicoModal';
import { useEscalaMedicosMock } from '@/hooks/useEscalaMedicosMock';

const EscalaMedicos: React.FC = () => {
  useEffect(() => {
    document.title = 'Escala de Médicos | Agenda';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Gestão de escala e bloqueios de médicos - disponibilidade e ausências');
  }, []);

  const { toast } = useToast();
  const { 
    medicos, 
    indisponibilidades: bloqueios, 
    loading,
    adicionarIndisponibilidade,
    removerIndisponibilidade 
  } = useEscalaMedicosMock();

  const [open, setOpen] = useState(false);
  const [editingBloqueio, setEditingBloqueio] = useState<any>(null);

  const medMap = useMemo(() => Object.fromEntries(medicos.map(m => [m.id, m.nome])), [medicos]);

  const refreshData = () => {
    console.log('Refreshing escala data (mock mode)');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Confirma a exclusão deste bloqueio?')) {
      const result = await removerIndisponibilidade(id);
      if (result.success) {
        refreshData();
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Escala de Médicos</h1>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bloqueios de Agenda</CardTitle>
          <Button onClick={() => setOpen(true)}>Inserir Bloqueio</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Médico</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Período</th>
                  <th className="p-2">Horário</th>
                  <th className="p-2">Motivo</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {bloqueios.map(b => (
                  <tr key={b.id} className="border-t">
                    <td className="p-2">{medMap[b.medico_id] || '—'}</td>
                    <td className="p-2">{b.tipo === 'ferias' ? 'Férias' : 'Bloqueio específico'}</td>
                    <td className="p-2">{new Date(b.data_inicio).toLocaleDateString()} - {new Date(b.data_fim).toLocaleDateString()}</td>
                    <td className="p-2">—</td>
                    <td className="p-2">{b.motivo || '—'}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingBloqueio(b);
                            setOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(b.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bloqueios.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhum bloqueio cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <BloqueioMedicoModal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingBloqueio(null);
        }}
        clinicaId={medicos[0]?.id || '1'}
        medicos={medicos.map(m => ({ ...m, nome_completo: m.nome, clinica_id: '1' }))}
        onSaved={refreshData}
        editingBloqueio={editingBloqueio}
      />
    </div>
  );
};

export default EscalaMedicos;