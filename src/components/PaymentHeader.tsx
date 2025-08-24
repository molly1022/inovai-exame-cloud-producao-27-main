
import { CreditCard, Shield, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface PaymentHeaderProps {
  clinicaName: string;
  assinatura?: any;
}

const PaymentHeader = ({ clinicaName, assinatura }: PaymentHeaderProps) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-lg mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Painel Financeiro</h1>
          <p className="text-blue-100">{clinicaName}</p>
          <p className="text-blue-200 text-sm">Gerencie sua assinatura e pagamentos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <CreditCard className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Plano Ativo</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Shield className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">100% Seguro</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Clock className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">
              {assinatura ? `${assinatura.dias_restantes} dias` : 'Sem plano'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHeader;
