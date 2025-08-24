
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showText?: boolean;
}

const LogoutButton = ({ 
  variant = "ghost", 
  size = "default", 
  showText = true 
}: LogoutButtonProps) => {
  const { logout } = useTenant();
  const { toast } = useToast();

  const handleLogout = () => {
    console.log('🔄 Botão de logout clicado');
    
    toast({
      title: "Saindo do sistema...",
      description: "Você será redirecionado em instantes."
    });
    
    // Executar logout imediatamente
    setTimeout(() => {
      logout();
    }, 1000);
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {showText && "Sair"}
    </Button>
  );
};

export default LogoutButton;
