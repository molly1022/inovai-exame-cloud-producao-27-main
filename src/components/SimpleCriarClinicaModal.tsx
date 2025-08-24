import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SimpleCriarClinicaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SimpleCriarClinicaModal = ({ open, onOpenChange }: SimpleCriarClinicaModalProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    subdominio: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nova clínica (single-tenant):', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Configuração Single-Tenant
          </DialogTitle>
          <DialogDescription>
            No modelo single-tenant, cada clínica tem seu próprio banco de dados isolado
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este banco já está configurado para uma clínica específica. Para criar uma nova clínica, 
            será necessário clonar este banco modelo.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Clínica Atual</CardTitle>
            <CardDescription>Banco modelo configurado</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Clínica</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Clínica Nova Era"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Responsável</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@clinica.com"
                />
              </div>

              <div>
                <Label htmlFor="subdominio">Subdomínio</Label>
                <Input
                  id="subdominio"
                  value={formData.subdominio}
                  onChange={(e) => setFormData(prev => ({ ...prev, subdominio: e.target.value }))}
                  placeholder="clinica-nova-era"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Processo de Clonagem:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Clone este banco modelo</li>
                  <li>Configure as informações específicas da clínica</li>
                  <li>Configure o DNS para o subdomínio</li>
                  <li>Ative o sistema da nova clínica</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Configurar Clínica
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCriarClinicaModal;