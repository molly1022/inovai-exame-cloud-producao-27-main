/**
 * Cliente Supabase para o banco administrativo central
 * Gerencia todas as clínicas e configurações do sistema
 * 
 * TEMPORÁRIO: Atualmente apontando para o banco modelo até conectar o banco central
 * TODO: Trocar para o banco central quando estiver disponível
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Banco Central - Conectado
const ADMIN_SUPABASE_URL = "https://biihsfrunulliloaaxju.supabase.co";
const ADMIN_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaWhzZnJ1bnVsbGlsb2FheGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDA1MzEsImV4cCI6MjA3MTMxNjUzMX0.h7psSTWrUrjn6DxLZsVSwVwUD_8yj-QuO1nw35zJyn4";

export const adminSupabase = createClient<Database>(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

/**
 * Configurações dos bancos por clínica
 * Primeira clínica: clinica-1 -> tgydssyqgmifcuajacgo.supabase.co
 * Banco modelo: bancomodelo -> tgydssyqgmifcuajacgo.supabase.co
 */
const CLINIC_DATABASES = {
  'clinica-1': {
    url: "https://tgydssyqgmifcuajacgo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWRzc3lxZ21pZmN1YWphY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODU5NzksImV4cCI6MjA2ODM2MTk3OX0.qNXwdjTJ4HKIwbUbk9N3sC_TAdhmZ3SK1aZQMivNZl8"
  },
  'teste-1': {
    url: "https://tgydssyqgmifcuajacgo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWRzc3lxZ21pZmN1YWphY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODU5NzksImV4cCI6MjA2ODM2MTk3OX0.qNXwdjTJ4HKIwbUbk9N3sC_TAdhmZ3SK1aZQMivNZl8"
  },
  'bancomodelo': {
    url: "https://tgydssyqgmifcuajacgo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWRzc3lxZ21pZmN1YWphY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODU5NzksImV4cCI6MjA2ODM2MTk3OX0.qNXwdjTJ4HKIwbUbk9N3sC_TAdhmZ3SK1aZQMivNZl8"
  },
  'bancocentral': {
    url: "https://tgydssyqgmifcuajacgo.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWRzc3lxZ21pZmN1YWphY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODU5NzksImV4cCI6MjA2ODM2MTk3OX0.qNXwdjTJ4HKIwbUbk9N3sC_TAdhmZ3SK1aZQMivNZl8"
  }
};

/**
 * Cliente para banco específico de uma clínica
 * Agora com suporte a configurações dinâmicas via Management API
 */
export const createClinicClient = (subdominio: string) => {
  // Primeiro tentar configurações estáticas (desenvolvimento/fallback)
  const config = CLINIC_DATABASES[subdominio as keyof typeof CLINIC_DATABASES];
  
  if (!config) {
    console.warn(`⚠️ Configuração de banco não encontrada para subdomínio: ${subdominio}`);
    return null;
  }
  
  return createClient<Database>(config.url, config.key, {
    auth: {
      storage: localStorage,
      persistSession: false, // Não persistir sessão em bancos específicos
      autoRefreshToken: false,
    }
  });
};

/**
 * Criar cliente dinâmico para clínica com configurações reais do Management API
 */
export const createDynamicClinicClient = (endpoint: string, serviceRoleKey: string) => {
  return createClient<Database>(endpoint, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
};