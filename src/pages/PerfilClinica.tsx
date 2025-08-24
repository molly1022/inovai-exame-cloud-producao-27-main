
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, Building2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useClinica } from '@/hooks/useClinica';

const PerfilClinica = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    subdominio: ''
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { clinica, updateClinica } = useClinica();

  useEffect(() => {
    if (clinica) {
      setFormData({
        nome: clinica.nome || '',
        email: clinica.email || '',
        telefone: clinica.telefone || '',
        endereco: clinica.endereco || '',
        subdominio: clinica.subdominio || ''
      });
      
      if (clinica.foto_perfil_url) {
        setPreviewUrl(clinica.foto_perfil_url);
      }
    }
  }, [clinica]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      
      // Criar preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadFoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clinica?.id}-profile.${fileExt}`;

      // Deletar foto anterior se existir
      if (clinica?.foto_perfil_url) {
        const oldFileName = clinica.foto_perfil_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('clinicas').remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('clinicas')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('clinicas')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao fazer upload da foto",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let fotoUrl = clinica?.foto_perfil_url || null;

      if (fotoFile) {
        fotoUrl = await uploadFoto(fotoFile);
        if (!fotoUrl && fotoFile) {
          setIsLoading(false);
          return;
        }
      }

      const dadosAtualizados = {
        ...formData,
        foto_perfil_url: fotoUrl
      };

      const result = await updateClinica(dadosAtualizados);
      
      if (result.success) {
        setFotoFile(null);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil da clínica",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!clinica) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Clínica não encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Não foi possível carregar os dados da clínica.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Perfil da Clínica</h2>
          <p className="text-gray-600">Configure as informações da sua clínica</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || ''} alt="Foto da clínica" />
                <AvatarFallback className="text-2xl">
                  {formData.nome.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="foto-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('foto-upload')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {previewUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Clínica *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome da sua clínica"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@clinica.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="subdominio">Subdomínio</Label>
                <Input
                  id="subdominio"
                  value={formData.subdominio}
                  onChange={(e) => setFormData({ ...formData, subdominio: e.target.value })}
                  placeholder="minha-clinica"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Será usado para personalizar URLs
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Endereço completo da clínica"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Complementares */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Complementares</CardTitle>
            <p className="text-sm text-gray-600">
              Dados adicionais para documentos e relatórios
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="XX.XXX.XXX/XXXX-XX"
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="58000-000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="João Pessoa"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  placeholder="Paraíba"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PerfilClinica;
