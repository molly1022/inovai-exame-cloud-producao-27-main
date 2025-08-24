import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchableSelect from '@/components/SearchableSelect';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { useDoctorSearch } from '@/hooks/useDoctorSearch';
import { useExameValores } from '@/hooks/useExameValores';
import { usePatientDetails } from '@/hooks/usePatientDetails';
import { useConvenioDesconto } from '@/hooks/useConvenioDesconto';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Percent, Calculator, CreditCard, Video } from "lucide-react";
import { useFeatureControl } from '@/hooks/useFeatureControl';

interface AgendamentoFormFieldsProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  pacientes: any[];
  medicos: any[];
  convenios: any[];
  conveniosLoading?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

const AgendamentoFormFields = ({ 
  formData, 
  updateField, 
  pacientes, 
  medicos, 
  convenios, 
  conveniosLoading,
  mode = 'create'
}: AgendamentoFormFieldsProps) => {
  const { searchPatients, patients: searchedPatients, loading: patientsLoading } = usePatientSearch();
  const { searchDoctors, doctors: searchedDoctors, loading: doctorsLoading } = useDoctorSearch();
  const { valores: exameValores, getValorPorTipo, loading: valoresLoading } = useExameValores();
  const { fetchPatientDetails } = usePatientDetails();
  const { buscarPercentualDesconto, calcularValorComDesconto, calcularDesconto } = useConvenioDesconto();
  const { isFeatureBlocked } = useFeatureControl();
  
  const [valorOriginal, setValorOriginal] = useState(0);
  const [percentualDesconto, setPercentualDesconto] = useState(0);
  const [descontoAplicado, setDescontoAplicado] = useState(0);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const calcDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return Math.max(0, endMin - startMin);
  };

  const addMinutes = (time: string, minutes: number) => {
    if (!time || !Number.isFinite(minutes)) return '';
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const hh = Math.floor((total % (24 * 60)) / 60).toString().padStart(2, '0');
    const mm = (total % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Auto-carregar convênio quando paciente é selecionado
  useEffect(() => {
    if (formData.paciente_id && mode === 'create') {
      fetchPatientDetails(formData.paciente_id).then((patient) => {
        if (patient?.convenio_id) {
          updateField('convenio_id', patient.convenio_id);
        }
      });
    }
  }, [formData.paciente_id, mode, fetchPatientDetails, updateField]);

  // Atualizar valor original quando tipo_exame muda
  useEffect(() => {
    if (formData.tipo_exame) {
      const valor = getValorPorTipo(formData.tipo_exame);
      setValorOriginal(valor);
    }
  }, [formData.tipo_exame, getValorPorTipo]);

  // Aplicar desconto quando convênio ou valor original mudam
  useEffect(() => {
    const aplicarDesconto = async () => {
      let valorBase = valorOriginal;
      
      // Adicionar valor de telemedicina se aplicável
      if (formData.eh_telemedicina) {
        valorBase += 15; // Taxa adicional de R$ 15 para telemedicina
      }
      
      if (formData.convenio_id && valorBase > 0) {
        const desconto = await buscarPercentualDesconto(formData.convenio_id);
        setPercentualDesconto(desconto);
        
        if (desconto > 0) {
          const valorComDesconto = calcularValorComDesconto(valorBase, desconto);
          const valorDesconto = calcularDesconto(valorBase, desconto);
          
          setDescontoAplicado(valorDesconto);
          updateField('valor_exame', valorComDesconto);
        } else {
          setDescontoAplicado(0);
          updateField('valor_exame', valorBase);
        }
      } else {
        setPercentualDesconto(0);
        setDescontoAplicado(0);
        updateField('valor_exame', valorBase);
      }
      
      // Definir valor adicional da telemedicina
      updateField('valor_adicional_telemedicina', formData.eh_telemedicina ? 15 : 0);
    };

    aplicarDesconto();
  }, [formData.convenio_id, formData.eh_telemedicina, valorOriginal, buscarPercentualDesconto, calcularValorComDesconto, calcularDesconto, updateField]);

  const calcularValorPago = (statusPagamento: string, valorExame: number) => {
    if (statusPagamento === 'parcial') {
      return valorExame * 0.5;
    } else if (statusPagamento === 'pago') {
      return valorExame;
    }
    return 0;
  };

  // Função para atualizar status de pagamento sem causar loop
  const handleStatusPagamentoChange = (value: string) => {
    if (isUpdatingPayment) return;
    
    setIsUpdatingPayment(true);
    
    // Atualizar status de pagamento
    updateField('status_pagamento', value);
    
    // Calcular valor pago baseado no novo status
    const valorExame = formData.valor_exame || 0;
    const valorPago = calcularValorPago(value, valorExame);
    updateField('valor_pago', valorPago);
    
    // Limpar método de pagamento se status for pendente ou pagar no dia
    if (value === 'pendente' || value === 'pagar_no_dia') {
      updateField('metodo_pagamento', '');
    }
    
    setTimeout(() => {
      setIsUpdatingPayment(false);
    }, 100);
  };

  // Verificar se deve mostrar campo de método de pagamento
  const mostrarMetodoPagamento = formData.status_pagamento && 
    !['pendente', 'pagar_no_dia'].includes(formData.status_pagamento);

  const isReadOnly = mode === 'view';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paciente">Paciente *</Label>
          <SearchableSelect
            placeholder="Buscar paciente por nome ou CPF..."
            onSearch={searchPatients}
            options={searchedPatients.map(p => ({
              value: p.id,
              label: `${p.nome} - ${p.cpf}`
            }))}
            value={formData.paciente_id}
            onValueChange={(value) => updateField('paciente_id', value)}
            loading={patientsLoading}
            disabled={isReadOnly}
          />
        </div>

        <div>
          <Label htmlFor="medico">Médico</Label>
          <SearchableSelect
            placeholder="Buscar médico por nome, CRM ou COREN..."
            onSearch={searchDoctors}
            options={searchedDoctors.map(m => ({
              value: m.id,
              label: `${m.nome_completo}${m.crm ? ` - CRM: ${m.crm}` : m.coren ? ` - COREN: ${m.coren}` : ''}`
            }))}
            value={formData.medico_id}
            onValueChange={(value) => updateField('medico_id', value)}
            loading={doctorsLoading}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_agendamento">Data *</Label>
          <Input
            id="data_agendamento"
            type="date"
            value={formData.data_agendamento}
            onChange={(e) => updateField('data_agendamento', e.target.value)}
            required
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <Label htmlFor="horario">Horário</Label>
          <Input
            id="horario"
            type="time"
            value={formData.horario}
            onChange={(e) => {
              const novo = e.target.value;
              updateField('horario', novo);
              if (formData.horario_fim) {
                const dur = calcDuration(novo, formData.horario_fim);
                updateField('duracao_minutos', dur);
              }
            }}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="horario_fim">Horário Final</Label>
          <Input
            id="horario_fim"
            type="time"
            value={formData.horario_fim || ''}
            onChange={(e) => {
              const fim = e.target.value;
              updateField('horario_fim', fim);
              if (formData.horario) {
                const dur = calcDuration(formData.horario, fim);
                updateField('duracao_minutos', dur);
              }
            }}
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <Label htmlFor="duracao_minutos">Duração (min)</Label>
          <Input
            id="duracao_minutos"
            type="number"
            min={0}
            value={formData.duracao_minutos || 0}
            onChange={(e) => {
              const mins = parseInt(e.target.value || '0', 10);
              updateField('duracao_minutos', mins);
              if (formData.horario) {
                const novoFim = addMinutes(formData.horario, mins);
                updateField('horario_fim', novoFim);
              }
            }}
            readOnly={isReadOnly}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="tipo_exame">Tipo de Exame/Consulta *</Label>
        {valoresLoading ? (
          <div className="flex items-center space-x-2 mt-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">Carregando tipos de exames...</span>
          </div>
        ) : (
          <Select 
            value={formData.tipo_exame} 
            onValueChange={(value) => updateField('tipo_exame', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {exameValores
                .filter((exame, index, array) => 
                  array.findIndex(e => e.tipo_exame === exame.tipo_exame) === index
                )
                .map((exame) => (
                <SelectItem key={exame.id} value={exame.tipo_exame}>
                  <div className="flex justify-between items-center w-full min-w-[200px]">
                    <span className="flex-1">{exame.tipo_exame}</span>
                    <span className="text-green-600 font-medium ml-4">
                      R$ {exame.valor.toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              ))}
              {exameValores.length === 0 && (
                <SelectItem value="no-exams" disabled>
                  Nenhum tipo de exame ou consulta cadastrado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label htmlFor="convenio_id">Convênio</Label>
        <Select 
          value={formData.convenio_id || ''} 
          onValueChange={(value) => updateField('convenio_id', value === 'particular' ? null : value)}
          disabled={isReadOnly || conveniosLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um convênio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="particular">Particular</SelectItem>
            {convenios.map((convenio) => (
              <SelectItem key={convenio.id} value={convenio.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: convenio.cor }} 
                  />
                  <span>{convenio.nome}</span>
                  {convenio.percentual_desconto > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {convenio.percentual_desconto}% desc.
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campo de Telemedicina - Só mostrar se não bloqueado */}
      {!isFeatureBlocked('telemedicina') && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="eh_telemedicina"
              checked={formData.eh_telemedicina || false}
              onCheckedChange={(checked) => updateField("eh_telemedicina", checked)}
              disabled={isReadOnly}
            />
            <Label htmlFor="eh_telemedicina" className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4" />
              Telemedicina (+R$ 15,00)
            </Label>
          </div>
          {formData.eh_telemedicina && (
            <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Video className="h-4 w-4" />
                ✅ Videoconferência será criada automaticamente
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Valor adicional de R$ 15,00 será cobrado pelos custos da chamada
              </p>
            </div>
          )}
        </div>
      )}

      {/* Seção de Valores com Desconto */}
      <div className="space-y-3">
        {percentualDesconto > 0 && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Desconto Aplicado</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Valor Original:</p>
                <p className="font-semibold">R$ {valorOriginal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Desconto ({percentualDesconto}%):
                </p>
                <p className="font-semibold text-red-600">- R$ {descontoAplicado.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor Final:</p>
                <p className="font-semibold text-green-700">R$ {(formData.valor_exame || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="valor_exame">Valor do Exame</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="valor_exame"
                type="number"
                step="0.01"
                value={formData.valor_exame || ''}
                onChange={(e) => updateField('valor_exame', parseFloat(e.target.value) || 0)}
                className="pl-10"
                readOnly={isReadOnly || percentualDesconto > 0}
              />
            </div>
            {percentualDesconto > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Valor com desconto de {percentualDesconto}% aplicado automaticamente
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status_pagamento">Status de Pagamento</Label>
            <Select 
              value={formData.status_pagamento || 'pendente'} 
              onValueChange={handleStatusPagamentoChange}
              disabled={isReadOnly || isUpdatingPayment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status do pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="parcial">50% Pago</SelectItem>
                <SelectItem value="pagar_no_dia">Pagar no Dia do Exame</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Campo Método de Pagamento - NOVO */}
      {mostrarMetodoPagamento && (
        <div>
          <Label htmlFor="metodo_pagamento" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Método de Pagamento *
          </Label>
          <Select 
            value={formData.metodo_pagamento || ''} 
            onValueChange={(value) => updateField('metodo_pagamento', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="transferencia">Transferência Bancária</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.status_pagamento === 'parcial' && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Valor já pago:</strong> R$ {(formData.valor_pago || 0).toFixed(2)}
          </p>
          <p className="text-sm text-blue-700">
            <strong>Valor restante:</strong> R$ {((formData.valor_exame || 0) - (formData.valor_pago || 0)).toFixed(2)}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="status">Status do Agendamento</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => updateField('status', value)}
          disabled={isReadOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status do agendamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="paciente_chegou">Paciente Chegou</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="faltou">Faltou</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes || ''}
          onChange={(e) => updateField('observacoes', e.target.value)}
          rows={3}
          readOnly={isReadOnly}
        />
      </div>
    </div>
  );
};

export default AgendamentoFormFields;
