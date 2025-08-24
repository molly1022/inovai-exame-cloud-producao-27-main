
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, CreditCard } from "lucide-react";

interface PatientFormFieldsProps {
  formData: any;
  updateField: (field: string, value: string) => void;
  handleCPFChange: (value: string) => void;
  convenios: any[];
  conveniosLoading: boolean;
  mode: 'create' | 'edit' | 'view';
}

const PatientFormFields = ({ 
  formData, 
  updateField, 
  handleCPFChange, 
  convenios, 
  conveniosLoading, 
  mode 
}: PatientFormFieldsProps) => {
  const isDisabled = mode === 'view';

  return (
    <>
      {/* Dados Pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-white/70 dark:bg-gray-900/70 p-6 rounded-xl border border-blue-100 dark:border-gray-800 shadow">
        <div className="space-y-2">
          <Label htmlFor="nome" className="inline-flex items-center gap-1">
            <User className="h-4 w-4 text-blue-400" />Nome Completo *
          </Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            required
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf" className="inline-flex items-center gap-1">
            <span className="text-green-400">#</span>CPF *
          </Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => handleCPFChange(e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
            required
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rg" className="inline-flex items-center gap-1">
            <span className="text-purple-400">#</span>RG
          </Label>
          <Input
            id="rg"
            value={formData.rg}
            onChange={(e) => updateField('rg', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2 col-span-1">
          <Label htmlFor="data_nascimento" className="inline-flex items-center gap-1">
            <span className="text-pink-400">📅</span>Data de Nascimento
          </Label>
          <Input
            id="data_nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => updateField('data_nascimento', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genero" className="inline-flex items-center gap-1">
            <User className="h-4 w-4 text-fuchsia-400" />Sexo
          </Label>
          <Select
            value={formData.genero}
            onValueChange={(value) => updateField('genero', value)}
            disabled={isDisabled}
          >
            <SelectTrigger className="bg-blue-50 dark:bg-gray-800 rounded">
              <SelectValue placeholder="Selecionar sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="inline-flex items-center gap-1">
            <Mail className="h-4 w-4 text-blue-400" />E-mail
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
      </div>

      {/* Convênio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/70 dark:bg-gray-900/70 p-6 rounded-xl border border-blue-100 dark:border-gray-800 shadow">
        <div className="space-y-2">
          <Label htmlFor="convenio_id" className="inline-flex items-center gap-1">
            <CreditCard className="h-4 w-4 text-green-500" />Convênio
          </Label>
          <Select
            value={formData.convenio_id}
            onValueChange={(value) => {
              updateField('convenio_id', value);
              if (!value) updateField('numero_convenio', '');
            }}
            disabled={isDisabled || conveniosLoading}
          >
            <SelectTrigger className="bg-blue-50 dark:bg-gray-800 rounded">
              <SelectValue placeholder={conveniosLoading ? "Carregando..." : "Selecionar convênio"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sem-convenio">Sem convênio</SelectItem>
              {convenios.map((convenio) => (
                <SelectItem key={convenio.id} value={convenio.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: convenio.cor }}
                    />
                    {convenio.nome}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero_convenio" className="inline-flex items-center gap-1">
            <CreditCard className="h-4 w-4 text-blue-500" />Número do Convênio
          </Label>
          <Input
            id="numero_convenio"
            value={formData.numero_convenio}
            onChange={(e) => updateField('numero_convenio', e.target.value)}
            placeholder="Digite o número do convênio"
            disabled={isDisabled || !formData.convenio_id || formData.convenio_id === 'sem-convenio'}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
      </div>

      {/* Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/70 dark:bg-gray-900/70 p-6 rounded-xl border border-blue-100 dark:border-gray-800 shadow">
        <div className="space-y-2">
          <Label htmlFor="telefone" className="inline-flex items-center gap-1">
            <Phone className="h-4 w-4 text-green-500" />Telefone
          </Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => updateField('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone_urgencia" className="inline-flex items-center gap-1">
            <Phone className="h-4 w-4 text-red-500" />Telefone de Urgência
          </Label>
          <Input
            id="telefone_urgencia"
            value={formData.telefone_urgencia}
            onChange={(e) => updateField('telefone_urgencia', e.target.value)}
            placeholder="(11) 99999-9999"
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/70 dark:bg-gray-900/70 p-6 rounded-xl border border-blue-100 dark:border-gray-800 shadow">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={formData.cep}
            onChange={(e) => updateField('cep', e.target.value)}
            placeholder="00000-000"
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endereco_completo">Endereço</Label>
          <Input
            id="endereco_completo"
            value={formData.endereco_completo}
            onChange={(e) => updateField('endereco_completo', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            value={formData.numero}
            onChange={(e) => updateField('numero', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={formData.bairro}
            onChange={(e) => updateField('bairro', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => updateField('cidade', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
      </div>

      {/* Dados Familiares e Físicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/70 dark:bg-gray-900/70 p-6 rounded-xl border border-blue-100 dark:border-gray-800 shadow">
        <div className="space-y-2">
          <Label htmlFor="nome_mae">Nome da Mãe</Label>
          <Input
            id="nome_mae"
            value={formData.nome_mae}
            onChange={(e) => updateField('nome_mae', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nome_pai">Nome do Pai</Label>
          <Input
            id="nome_pai"
            value={formData.nome_pai}
            onChange={(e) => updateField('nome_pai', e.target.value)}
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="altura">Altura (m)</Label>
          <Input
            id="altura"
            type="number"
            step="0.01"
            value={formData.altura}
            onChange={(e) => updateField('altura', e.target.value)}
            placeholder="1.70"
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.1"
            value={formData.peso}
            onChange={(e) => updateField('peso', e.target.value)}
            placeholder="70.0"
            disabled={isDisabled}
            className="bg-blue-50 dark:bg-gray-800 rounded"
          />
        </div>
      </div>

      {/* Senha de Acesso */}
      <div className="space-y-2 bg-white/80 dark:bg-gray-900/90 p-5 rounded-xl border border-blue-100 dark:border-gray-800 shadow">
        <Label htmlFor="senha_acesso">Senha de Acesso ao Portal</Label>
        <Input
          id="senha_acesso"
          value={formData.senha_acesso}
          onChange={(e) => updateField('senha_acesso', e.target.value)}
          placeholder="Senha para acesso ao portal do paciente"
          disabled={isDisabled}
          className="bg-blue-50 dark:bg-gray-800 rounded"
        />
        {mode !== 'view' && (
          <p className="text-xs text-gray-500 mt-1">
            Esta senha será usada pelo paciente para acessar o portal com seu CPF
          </p>
        )}
      </div>
    </>
  );
};

export default PatientFormFields;
