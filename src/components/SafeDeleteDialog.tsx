
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Calendar, Stethoscope } from "lucide-react";

interface Dependencies {
  agendamentos: number;
  exames: number;
  receitas: number;
}

interface SafeDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  onConfirmDeactivate: () => void;
  title: string;
  itemName: string;
  dependencies: Dependencies;
  isLoading?: boolean;
}

const SafeDeleteDialog = ({ 
  isOpen, 
  onClose, 
  onConfirmDelete,
  onConfirmDeactivate,
  title, 
  itemName,
  dependencies,
  isLoading = false 
}: SafeDeleteDialogProps) => {
  const totalDependencies = dependencies.agendamentos + dependencies.exames + dependencies.receitas;
  const canDelete = totalDependencies === 0;

  if (canDelete) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{itemName}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Atenção: Dependências Encontradas
          </AlertDialogTitle>
          <AlertDialogDescription>
            O médico "{itemName}" não pode ser excluído porque possui dados vinculados:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          {dependencies.agendamentos > 0 && (
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                <strong>{dependencies.agendamentos}</strong> agendamento(s)
              </span>
            </div>
          )}
          
          {dependencies.exames > 0 && (
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
              <Stethoscope className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                <strong>{dependencies.exames}</strong> exame(s)
              </span>
            </div>
          )}
          
          {dependencies.receitas > 0 && (
            <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-sm">
                <strong>{dependencies.receitas}</strong> receita(s)
              </span>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Alternativa:</strong> Você pode desativar o médico em vez de excluí-lo. 
            Isso manterá os dados históricos mas impedirá novos agendamentos.
          </p>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <Button
            onClick={onConfirmDeactivate}
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {isLoading ? 'Desativando...' : 'Desativar Médico'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SafeDeleteDialog;
