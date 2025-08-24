
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Mail, Calendar, FileText } from 'lucide-react';

interface ProntuarioDadosPessoaisProps {
  paciente: any;
}

const ProntuarioDadosPessoais = ({ paciente }: ProntuarioDadosPessoaisProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome Completo</label>
              <p className="text-lg font-semibold">{paciente.nome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Gênero</label>
              <p className="text-lg">{paciente.genero || 'Não informado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
              <p className="text-lg">
                {paciente.data_nascimento 
                  ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')
                  : 'Não informado'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Idade</label>
              <p className="text-lg">{paciente.idade || 'N/A'} anos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">CPF</label>
              <p className="text-lg font-mono">{paciente.cpf}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">RG</label>
              <p className="text-lg font-mono">{paciente.rg || 'Não informado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Peso</label>
              <p className="text-lg">{paciente.peso ? `${paciente.peso} kg` : 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Altura</label>
              <p className="text-lg">{paciente.altura ? `${paciente.altura} m` : 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato e Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Contato e Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </label>
              <p className="text-lg">{paciente.telefone || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telefone de Urgência</label>
              <p className="text-lg">{paciente.telefone_urgencia || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </label>
              <p className="text-lg">{paciente.email || 'Não informado'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Endereço Completo</label>
              <p className="text-lg">{paciente.endereco_completo || 'Não informado'}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Cidade</label>
                  <p>{paciente.cidade || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <p>{paciente.estado || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">CEP</label>
                  <p className="font-mono">{paciente.cep || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bairro</label>
                  <p>{paciente.bairro || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Familiares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Familiares
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nome da Mãe</label>
            <p className="text-lg">{paciente.nome_mae || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Nome do Pai</label>
            <p className="text-lg">{paciente.nome_pai || 'Não informado'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Convênio e Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Convênio e Observações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Convênio</label>
            <div className="mt-1">
              {paciente.convenios ? (
                <Badge 
                  style={{ backgroundColor: paciente.convenios.cor }}
                  className="text-white"
                >
                  {paciente.convenios.nome}
                </Badge>
              ) : (
                <Badge variant="outline">Particular</Badge>
              )}
            </div>
          </div>
          
          {paciente.numero_convenio && (
            <div>
              <label className="text-sm font-medium text-gray-500">Número do Convênio</label>
              <p className="text-lg font-mono">{paciente.numero_convenio}</p>
            </div>
          )}

          {paciente.observacoes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Observações</label>
              <p className="text-lg text-gray-700 bg-gray-50 p-3 rounded-lg">
                {paciente.observacoes}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <label className="font-medium">Cadastrado em</label>
                <p>{new Date(paciente.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <label className="font-medium">Última atualização</label>
                <p>{new Date(paciente.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProntuarioDadosPessoais;
