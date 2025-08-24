
import { z } from 'zod';

export const patientLoginSchema = z.object({
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido'),
  senha: z.string().min(1, 'Senha é obrigatória')
});

export type PatientLoginData = z.infer<typeof patientLoginSchema>;
