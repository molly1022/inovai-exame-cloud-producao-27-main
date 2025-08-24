import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Shield, CreditCard, Lock } from 'lucide-react';
import SecurityUtils from '@/utils/securityUtils';

interface SecurePaymentFormProps {
  onSubmit: (data: PaymentData) => Promise<void>;
  loading?: boolean;
  amount: number;
  planName: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  email: string;
  amount: number;
}

export const SecurePaymentForm = ({ onSubmit, loading = false, amount, planName }: SecurePaymentFormProps) => {
  const [formData, setFormData] = useState<PaymentData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    amount
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Rate limiting para tentativas de pagamento
    if (!SecurityUtils.checkRateLimit('payment_attempt', 3, 300000)) {
      toast({
        title: "Limite excedido",
        description: "Muitas tentativas de pagamento. Aguarde 5 minutos.",
        variant: "destructive"
      });
      return false;
    }

    // Validar número do cartão (básico)
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    // Validar data de expiração
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Data deve estar no formato MM/AA';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Cartão expirado';
      }
    }

    // Validar CVV
    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV deve ter 3 ou 4 dígitos';
    }

    // Validar nome no cartão
    if (!formData.cardName || formData.cardName.trim().length < 2) {
      newErrors.cardName = 'Nome no cartão é obrigatório';
    }

    // Validar email
    if (!SecurityUtils.validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Sanitizar dados antes do envio
      const sanitizedData: PaymentData = {
        cardNumber: SecurityUtils.sanitizeInput(formData.cardNumber.replace(/\s/g, '')),
        expiryDate: SecurityUtils.sanitizeInput(formData.expiryDate),
        cvv: SecurityUtils.sanitizeInput(formData.cvv),
        cardName: SecurityUtils.sanitizeInput(formData.cardName),
        email: SecurityUtils.sanitizeInput(formData.email.toLowerCase()),
        amount: formData.amount
      };

      SecurityUtils.secureLog('info', 'Iniciando processamento de pagamento seguro', {
        amount: sanitizedData.amount,
        email: SecurityUtils.maskSensitiveData(sanitizedData.email),
        planName
      });

      await onSubmit(sanitizedData);
    } catch (error: any) {
      SecurityUtils.secureLog('error', 'Erro no processamento de pagamento', { error: error.message });
      await SecurityUtils.logSuspiciousActivity('PAYMENT_PROCESSING_ERROR', {
        error: error.message,
        amount,
        email: SecurityUtils.maskSensitiveData(formData.email)
      });
      
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
    if (errors.expiryDate) {
      setErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Pagamento Seguro
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p>Plano: <strong>{planName}</strong></p>
          <p>Valor: <strong>R$ {amount.toFixed(2)}</strong></p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className={errors.cardNumber ? 'border-red-500' : ''}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Validade</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/AA"
                value={formData.expiryDate}
                onChange={handleExpiryChange}
                maxLength={5}
                className={errors.expiryDate ? 'border-red-500' : ''}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                  setFormData(prev => ({ ...prev, cvv: value }));
                  if (errors.cvv) {
                    setErrors(prev => ({ ...prev, cvv: '' }));
                  }
                }}
                maxLength={4}
                className={errors.cvv ? 'border-red-500' : ''}
              />
              {errors.cvv && (
                <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="cardName">Nome no Cartão</Label>
            <Input
              id="cardName"
              type="text"
              placeholder="João Silva"
              value={formData.cardName}
              onChange={(e) => {
                const value = SecurityUtils.sanitizeInput(e.target.value.toUpperCase());
                setFormData(prev => ({ ...prev, cardName: value }));
                if (errors.cardName) {
                  setErrors(prev => ({ ...prev, cardName: '' }));
                }
              }}
              className={errors.cardName ? 'border-red-500' : ''}
            />
            {errors.cardName && (
              <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => {
                const value = SecurityUtils.sanitizeInput(e.target.value.toLowerCase());
                setFormData(prev => ({ ...prev, email: value }));
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Seus dados estão protegidos com criptografia SSL</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar R$ {amount.toFixed(2)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};