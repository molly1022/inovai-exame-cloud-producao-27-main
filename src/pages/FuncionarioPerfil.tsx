
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building, Mail, Phone, MapPin, Eye } from "lucide-react";
import { useClinica } from "@/hooks/useClinica";

const FuncionarioPerfil = () => {
  const { clinica, loading } = useClinica();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando perfil da clínica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Eye className="h-8 w-8 text-gray-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil da Clínica</h1>
          <p className="text-gray-600 dark:text-gray-300">Visualização das informações da clínica (apenas leitura)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Informações Básicas</span>
            </CardTitle>
            <CardDescription>
              Dados principais da clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome da Clínica</label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {clinica?.nome || 'Não informado'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{clinica?.email || 'Não informado'}</span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</label>
              <p className="text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{clinica?.telefone || 'Não informado'}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Endereço</span>
            </CardTitle>
            <CardDescription>
              Localização da clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Endereço Completo</label>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {clinica?.endereco || 'Não informado'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Detalhes técnicos e de configuração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Criação</label>
              <p className="text-gray-700 dark:text-gray-300">
                {clinica?.created_at ? new Date(clinica.created_at).toLocaleDateString('pt-BR') : 'Não informado'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Atualização</label>
              <p className="text-gray-700 dark:text-gray-300">
                {clinica?.updated_at ? new Date(clinica.updated_at).toLocaleDateString('pt-BR') : 'Não informado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Modo Visualização</h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Você está visualizando as informações da clínica em modo somente leitura. 
              Para fazer alterações, entre em contato com um administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioPerfil;
