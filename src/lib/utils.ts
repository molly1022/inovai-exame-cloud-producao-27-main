import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCPF(cpf: string) {
  const cleaned = cpf.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
}

export function generatePassword() {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Função para formatar valores monetários no padrão brasileiro
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para converter horário UTC para horário local brasileiro
export function convertUtcToLocal(utcDateString: string) {
  if (!utcDateString) return { data: '', horario: '' };
  
  const utcDate = new Date(utcDateString);
  // Ajustar para fuso horário do Brasil (UTC-3)
  const brazilOffset = -3 * 60; // -3 horas em minutos
  const localTime = new Date(utcDate.getTime() + (brazilOffset * 60 * 1000));
  
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const day = String(localTime.getDate()).padStart(2, '0');
  const hours = String(localTime.getHours()).padStart(2, '0');
  const minutes = String(localTime.getMinutes()).padStart(2, '0');
  
  return {
    data: `${year}-${month}-${day}`,
    horario: `${hours}:${minutes}`
  };
}

// Função para formatar data/hora para exibição no horário brasileiro
export function formatDateTimeLocal(utcDateString: string) {
  if (!utcDateString) return '';
  
  const utcDate = new Date(utcDateString);
  
  return utcDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

// Função para formatar apenas a hora no horário brasileiro
export function formatTimeLocal(utcDateString: string) {
  if (!utcDateString) return '';
  
  const utcDate = new Date(utcDateString);
  
  return utcDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

// Função para verificar se check-in está disponível (15 minutos antes até 15 minutos depois)
export function canCheckIn(dataAgendamento: string): boolean {
  const now = new Date();
  const appointmentTime = new Date(dataAgendamento);
  const fifteenMinutesBefore = new Date(appointmentTime.getTime() - 15 * 60 * 1000);
  const fifteenMinutesAfter = new Date(appointmentTime.getTime() + 15 * 60 * 1000);
  
  return now >= fifteenMinutesBefore && now <= fifteenMinutesAfter;
}

// Função para verificar se consulta deve iniciar automaticamente
export function shouldAutoStart(dataAgendamento: string, status: string): boolean {
  const now = new Date();
  const appointmentTime = new Date(dataAgendamento);
  
  return status === 'paciente_chegou' && now >= appointmentTime;
}

// Função para verificar se consulta está em atraso
export function isLate(dataAgendamento: string, status: string): boolean {  
  const now = new Date();
  const appointmentTime = new Date(dataAgendamento);
  const minutesLate = Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60));
  
  return ['agendado', 'confirmado'].includes(status) && minutesLate > 0;
}

// Função para verificar se deve marcar como falta
export function shouldMarkAsAbsent(dataAgendamento: string, status: string): boolean {
  const now = new Date();
  const appointmentTime = new Date(dataAgendamento);
  const minutesLate = Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60));
  
  return ['agendado', 'confirmado'].includes(status) && minutesLate > 15;
}

// Função para obter o horário do slot baseado no agendamento
export function getTimeSlot(dataAgendamento: string): string {
  const date = new Date(dataAgendamento);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
