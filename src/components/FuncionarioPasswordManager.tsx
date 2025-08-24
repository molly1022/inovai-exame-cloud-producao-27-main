
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useFuncionarioPassword } from '@/hooks/useFuncionarioPassword';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

interface FuncionarioPasswordManagerProps {
  funcionarioId?: string;
  cpf: string;
  onPasswordChange: (senha: string) => void;
  isEditing?: boolean;
}

const FuncionarioPasswordManager = ({ 
  funcionarioId, 
  cpf, 
  onPasswordChange, 
  isEditing = false 
}: FuncionarioPasswordManagerProps) => {
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  
  const { obterSenhaAtual, loading } = useFuncionarioPassword();

  useEffect(() => {
    if (isEditing && funcionarioId) {
      carregarSenhaAtual();
    }
  }, [isEditing, funcionarioId]);

  const carregarSenhaAtual = async () => {
    if (!funcionarioId) return;
    
    const senhaExistente = await obterSenhaAtual(funcionarioId);
    setSenhaAtual(senhaExistente);
    if (senhaExistente) {
      setSenha(senhaExistente);
      setConfirmSenha(senhaExistente);
      onPasswordChange(senhaExistente);
    }
  };

  const handleSenhaChange = (novaSenha: string) => {
    setSenha(novaSenha);
    if (novaSenha === confirmSenha) {
      onPasswordChange(novaSenha);
    }
  };

  const handleConfirmSenhaChange = (novaConfirmSenha: string) => {
    setConfirmSenha(novaConfirmSenha);
    if (senha === novaConfirmSenha) {
      onPasswordChange(senha);
    }
  };

  const senhasCoicindem = senha === confirmSenha;
  const senhaValida = senha.length >= 6 && senhasCoicindem;

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Configurações de Acesso</h4>
        
        {isEditing && senhaAtual && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Senha atual:</strong> {senhaAtual}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="senha-funcionario">
              {isEditing ? 'Nova Senha' : 'Senha'}
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="senha-funcionario"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => handleSenhaChange(e.target.value)}
                placeholder={isEditing ? "Digite a nova senha" : "Digite a senha"}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-senha-funcionario">
              Confirmar Senha
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirm-senha-funcionario"
                type={mostrarConfirm ? "text" : "password"}
                value={confirmSenha}
                onChange={(e) => handleConfirmSenhaChange(e.target.value)}
                placeholder="Confirme a senha"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setMostrarConfirm(!mostrarConfirm)}
              >
                {mostrarConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {senha && (
          <div className="mt-4">
            <PasswordStrengthIndicator 
              password={senha} 
              showRequirements={true}
            />
          </div>
        )}

        {!senhasCoicindem && confirmSenha && (
          <p className="text-sm text-red-600 mt-2">
            As senhas não coincidem
          </p>
        )}

        <div className="bg-yellow-50 p-3 rounded-lg mt-4">
          <p className="text-sm text-yellow-800">
            <strong>Credenciais de acesso:</strong><br />
            CPF: {cpf}<br />
            Senha: {senhaValida ? '✓ Configurada' : 'Pendente'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioPasswordManager;
