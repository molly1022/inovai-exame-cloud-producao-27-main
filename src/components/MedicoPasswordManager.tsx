
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useMedicoPassword } from '@/hooks/useMedicoPassword';

interface MedicoPasswordManagerProps {
  medicoId?: string;
  cpf: string;
  onPasswordChange: (senha: string) => void;
  isEditing: boolean;
}

const MedicoPasswordManager = ({ medicoId, cpf, onPasswordChange, isEditing }: MedicoPasswordManagerProps) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  // Só carrega senha se tiver médico e estiver editando
  const { senhaAtual, loading } = useMedicoPassword(isEditing && medicoId ? medicoId : undefined);

  // Reset dos estados quando o medicoId muda ou quando o modal abre/fecha
  useEffect(() => {
    console.log('MedicoPasswordManager - Reset estados para médico:', medicoId);
    setShowNewPassword(false);
    setNewPassword('');
  }, [medicoId, isEditing]);

  // Log para debug
  useEffect(() => {
    console.log('MedicoPasswordManager - Estado atual:', {
      medicoId,
      isEditing,
      senhaAtual,
      loading
    });
  }, [medicoId, isEditing, senhaAtual, loading]);

  const handlePasswordChange = (senha: string) => {
    setNewPassword(senha);
    onPasswordChange(senha);
  };

  // Mode Create - Campo de senha obrigatório
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <Label htmlFor="senha_acesso">Senha de Acesso *</Label>
        <div className="relative">
          <Input
            id="senha_acesso"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Digite uma senha"
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Login: CPF ({cpf || 'será o CPF informado'})
        </p>
      </div>
    );
  }

  // Mode Edit - Mostrar senha atual sempre visível e permitir alteração
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Senha de Acesso Atual</Label>
        <div className="relative">
          <Input
            type="text"
            value={loading ? "Carregando..." : (senhaAtual || "Não configurada")}
            readOnly
            className="bg-gray-50 font-mono text-sm"
          />
        </div>
        {senhaAtual && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
            ✅ Senha configurada - O médico pode fazer login com CPF e esta senha
          </div>
        )}
        {!senhaAtual && !loading && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border">
            ⚠️ Nenhuma senha configurada - Configure uma senha abaixo
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nova_senha">Nova Senha {!senhaAtual ? '(obrigatória)' : '(opcional)'}</Label>
        <div className="relative">
          <Input
            id="nova_senha"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder={senhaAtual ? "Digite uma nova senha" : "Configure uma senha"}
            className="pr-10"
            required={!senhaAtual}
          />
          {newPassword && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Login do médico:</strong> CPF ({cpf}) + senha configurada
        </p>
      </div>
    </div>
  );
};

export default MedicoPasswordManager;
