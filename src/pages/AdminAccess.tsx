import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Lock, Key } from "lucide-react";
import { adminSupabase } from "@/integrations/supabase/adminClient";

const AdminAccess = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalTrocarSenha, setModalTrocarSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (codigo === "maconheiro@321") {
        // Gerar token de sessão
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas
        
        // Criar sessão admin no banco
        const { data: session, error } = await adminSupabase
          .from('admin_sessions')
          .insert({
            session_token: token,
            ip_address: 'unknown',
            user_agent: navigator.userAgent,
            expires_at: expiresAt.toISOString(),
            primeira_senha_alterada: false
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar sessão:', error);
          toast.error("Erro ao criar sessão administrativa");
          return;
        }

        // Salvar token no localStorage
        localStorage.setItem('adminSessionToken', token);
        localStorage.setItem('adminAccess', 'maconheiro@321');

        // Log admin functionality disabled temporarily
        console.log('Admin logs disabled temporarily');

        // Não mais força troca de senha - login direto
        toast.success("Acesso autorizado!");
        navigate("/admin");
      } else {
        // Log failed attempts disabled temporarily
        console.log('Failed login attempt:', codigo);
        
        toast.error("Código de acesso inválido!");
      }
    } catch (error) {
      console.error('Erro ao validar acesso:', error);
      toast.error("Erro ao validar acesso");
    } finally {
      setLoading(false);
    }
  };

  const handleTrocarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    try {
      // Atualizar sessão com nova senha
      const { error } = await adminSupabase
        .from('admin_sessions')
        .update({
          nova_senha: novaSenha,
          primeira_senha_alterada: true,
          updated_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        toast.error("Erro ao definir nova senha");
        return;
      }

      // Password change logs disabled temporarily
      console.log('Password change logged');

      toast.success("Senha definida com sucesso!");
      setModalTrocarSenha(false);
      navigate("/admin");
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      toast.error("Erro interno ao definir senha");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-300">
            Digite o código de acesso para continuar
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
            <CardDescription>
              Somente administradores autorizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de Acesso</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="codigo"
                    type="password"
                    placeholder="Digite o código de acesso"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Acessar Painel'}
              </Button>
            </form>

            <div className="text-center">
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal para trocar senha na primeira vez */}
        <Dialog open={modalTrocarSenha} onOpenChange={setModalTrocarSenha}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Definir Nova Senha
              </DialogTitle>
              <DialogDescription>
                Por segurança, defina uma nova senha de acesso para substituir o código padrão.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite sua nova senha"
                />
              </div>
              <div>
                <Label htmlFor="confirmar-senha">Confirmar Senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme sua nova senha"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleTrocarSenha}
                className="w-full"
                disabled={!novaSenha || !confirmarSenha}
              >
                <Key className="h-4 w-4 mr-2" />
                Definir Senha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminAccess;