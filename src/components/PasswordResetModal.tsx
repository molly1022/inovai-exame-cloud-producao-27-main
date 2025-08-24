import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, KeyRound, Shield, Check } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetModal = ({ isOpen, onClose }: PasswordResetModalProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'codigo' | 'nova_senha' | 'success'>('email');

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Digite o email da clínica",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('enviar-codigo-recuperacao', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao enviar código",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Código enviado!",
        description: "Verifique seu email para o código de recuperação",
      });

      setStep('codigo');
    } catch (error: any) {
      console.error('Erro ao enviar código:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar código de recuperação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo || codigo.length !== 6) {
      toast({
        title: "Erro",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setStep('nova_senha');
  };

  const handleSubmitNovaSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaSenha || novaSenha.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verificar-codigo-recuperacao', {
        body: { email, codigo, nova_senha: novaSenha }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao atualizar senha",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua nova senha foi definida com sucesso",
      });

      setStep('success');
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setCodigo('');
    setNovaSenha('');
    setStep('email');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
            Recuperação de Senha
          </DialogTitle>
          <DialogDescription>
            {step === 'email' && "Digite o email da clínica para receber o código de segurança"}
            {step === 'codigo' && "Digite o código de 6 dígitos enviado para seu email"}
            {step === 'nova_senha' && "Defina sua nova senha de acesso"}
            {step === 'success' && "Senha atualizada com sucesso!"}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' && (
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email da Clínica
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@suaclinica.com"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'codigo' && (
          <form onSubmit={handleSubmitCodigo} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Código enviado para <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Código de Segurança
              </Label>
              <Input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Digite o código de 6 dígitos (válido por 15 minutos)
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('email')}>
                Voltar
              </Button>
              <Button type="submit">
                Verificar Código
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'nova_senha' && (
          <form onSubmit={handleSubmitNovaSenha} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Código verificado! Defina sua nova senha
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova_senha" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Nova Senha
              </Label>
              <Input
                id="nova_senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite sua nova senha"
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('codigo')}>
                Voltar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Definir Nova Senha'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'success' && (
          <>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Senha Atualizada!</h3>
              <p className="text-muted-foreground">
                Sua nova senha foi definida com sucesso
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Agora você pode fazer login com a nova senha
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Fazer Login
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetModal;