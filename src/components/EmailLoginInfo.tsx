
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Info } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

const EmailLoginInfo = () => {
  const [emailClinica, setEmailClinica] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { clinicaId, isValid } = useTenantId();

  useEffect(() => {
    if (isValid && clinicaId) {
      fetchEmailClinica();
    }
  }, [clinicaId, isValid]);

  const fetchEmailClinica = async () => {
    try {
      const { data, error } = await supabase
        .from('clinicas_central')
        .select('email')
        .eq('id', clinicaId)
        .single();

      if (error) {
        console.error('Erro ao buscar email da clínica:', error);
      } else {
        setEmailClinica(data.email);
      }
    } catch (error) {
      console.error('Erro ao buscar email da clínica:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isValid || !clinicaId) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center text-blue-600">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Informação de Login
        </CardTitle>
        <CardDescription className="text-blue-600">
          Use este email para fazer login no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">Email para login:</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-mono">
            {emailClinica}
          </Badge>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Este é o email atual da clínica configurado no sistema
        </p>
      </CardContent>
    </Card>
  );
};

export default EmailLoginInfo;
