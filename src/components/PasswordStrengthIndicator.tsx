
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

const PasswordStrengthIndicator = ({ password, showRequirements = false }: PasswordStrengthIndicatorProps) => {
  const calculateStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;
    
    return { score, checks };
  };

  const getStrengthInfo = (score: number) => {
    if (score === 0) return { label: "Muito Fraca", color: "bg-red-500", variant: "destructive" as const };
    if (score <= 2) return { label: "Fraca", color: "bg-orange-500", variant: "secondary" as const };
    if (score <= 3) return { label: "Média", color: "bg-yellow-500", variant: "outline" as const };
    if (score <= 4) return { label: "Forte", color: "bg-blue-500", variant: "default" as const };
    return { label: "Muito Forte", color: "bg-green-500", variant: "default" as const };
  };

  const { score, checks } = calculateStrength(password);
  const strength = getStrengthInfo(score);
  const progressValue = (score / 5) * 100;

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Progress value={progressValue} className="flex-1 h-2" />
        <Badge variant={strength.variant} className="text-xs">
          {strength.label}
        </Badge>
      </div>
      
      {showRequirements && (
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className={`flex items-center gap-1 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Mínimo 8 caracteres
          </div>
          <div className={`flex items-center gap-1 ${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Letra minúscula
          </div>
          <div className={`flex items-center gap-1 ${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Letra maiúscula
          </div>
          <div className={`flex items-center gap-1 ${checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Número
          </div>
          <div className={`flex items-center gap-1 ${checks.special ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Caractere especial
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
