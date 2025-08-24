# Como Adicionar Dias à Assinatura de uma Clínica

## 🎯 Visão Geral

Este guia explica detalhadamente como adicionar dias extras à assinatura de uma clínica no sistema Unovai Exame Cloud. Útil para **extensões promocionais**, **suporte técnico** ou **resolução de problemas**.

## 🔐 Acesso Administrativo

### 1. Login no Painel Admin
1. Acesse: `https://seu-dominio.com/admin-access`
2. Digite a senha administrativa: `maconheiro@321`
3. Você será direcionado ao painel administrativo

### 2. Localizar a Clínica
No painel administrativo:
1. Vá para a aba **"Monitoramento"**
2. Na seção **"Clínicas Cadastradas"**
3. Localize a clínica desejada na lista
4. Use o filtro de busca se necessário

## ➕ Adicionando Dias (Interface)

### Método 1: Botões de Ação Rápida
Cada clínica na lista possui botões para ações rápidas:

```
🏥 Nome da Clínica
📊 X funcionários | X médicos | X pacientes
📅 Vence em: 15 dias

[+ 7 dias] [+ 2 dias] [👁️ Senha] [⚙️ Configurar]
```

**Para adicionar dias:**
1. Clique no botão **"+ 7 dias"** para adicionar 7 dias
2. Clique no botão **"+ 2 dias"** para adicionar 2 dias
3. O sistema confirmará a ação automaticamente
4. A nova data de vencimento será exibida

### Método 2: Via Banco de Dados (SQL)
Para valores diferentes de 7 ou 2 dias, execute no SQL Editor:

```sql
-- Adicionar 15 dias à clínica específica
SELECT estender_assinatura_dias(
    'uuid-da-clinica'::uuid, 
    15  -- número de dias
);

-- Exemplo completo:
SELECT estender_assinatura_dias(
    '123e4567-e89b-12d3-a456-426614174000'::uuid, 
    30
);
```

## 🔍 Como Encontrar o UUID da Clínica

### Método 1: Pelo Painel Admin
1. No painel administrativo
2. Clique no botão **"👁️ Senha"** da clínica
3. O modal mostrará informações incluindo o UUID

### Método 2: Pelo SQL Editor
```sql
-- Buscar pelo nome da clínica
SELECT id, nome, email, telefone 
FROM clinicas 
WHERE nome ILIKE '%nome-da-clinica%';

-- Buscar pelo email
SELECT id, nome, email, telefone 
FROM clinicas 
WHERE email = 'email@clinica.com';
```

## 🛠️ Função Detalhada

### Código da Função `estender_assinatura_dias`

```sql
CREATE OR REPLACE FUNCTION public.estender_assinatura_dias(
    clinica_uuid uuid, 
    dias_adicionar integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    resultado JSON;
    nova_data DATE;
BEGIN
    -- Verificar se a assinatura existe
    IF NOT EXISTS (SELECT 1 FROM public.assinaturas WHERE clinica_id = clinica_uuid) THEN
        RETURN '{"success": false, "error": "Assinatura não encontrada"}';
    END IF;
    
    -- Estender pelos dias especificados
    UPDATE public.assinaturas 
    SET proximo_pagamento = proximo_pagamento + (dias_adicionar || ' days')::interval,
        updated_at = now()
    WHERE clinica_id = clinica_uuid
    RETURNING proximo_pagamento INTO nova_data;
    
    -- Registrar a extensão nos logs
    INSERT INTO public.admin_logs (
        acao, 
        detalhes, 
        admin_session_id,
        ip_address
    ) VALUES (
        'EXTENSAO_ASSINATURA',
        jsonb_build_object(
            'clinica_id', clinica_uuid,
            'nova_data_vencimento', nova_data,
            'dias_adicionados', dias_adicionar
        ),
        'admin_extension',
        'sistema'
    );
    
    resultado := json_build_object(
        'success', true,
        'nova_data_vencimento', nova_data,
        'dias_adicionados', dias_adicionar
    );
    
    RETURN resultado;
END;
$function$;
```

### Parâmetros da Função

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `clinica_uuid` | UUID | ID único da clínica |
| `dias_adicionar` | INTEGER | Quantidade de dias a adicionar |

### Retorno da Função

```json
{
  "success": true,
  "nova_data_vencimento": "2024-02-15",
  "dias_adicionados": 7
}
```

## 📝 Exemplos Práticos

### Exemplo 1: Adicionar 7 dias via Interface
1. Acesse o painel administrativo
2. Localize a clínica "Clínica São José"
3. Clique no botão **"+ 7 dias"**
4. Sistema confirma: "7 dias adicionados com sucesso!"

### Exemplo 2: Adicionar 30 dias via SQL
```sql
-- Para a Clínica Memorial LTDA
SELECT estender_assinatura_dias(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    30
);
```

### Exemplo 3: Adicionar 1 ano (365 dias)
```sql
-- Extensão especial de 1 ano
SELECT estender_assinatura_dias(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    365
);
```

## 📊 Verificar Resultado

### Pelo Painel Admin
Após adicionar os dias:
1. A lista de clínicas é atualizada automaticamente
2. A nova data de vencimento aparece
3. O contador de "dias restantes" é recalculado

### Pelo SQL
```sql
-- Verificar a assinatura da clínica
SELECT 
    c.nome,
    a.proximo_pagamento,
    a.proximo_pagamento - CURRENT_DATE as dias_restantes,
    a.status,
    a.updated_at
FROM assinaturas a
JOIN clinicas c ON a.clinica_id = c.id
WHERE c.id = 'uuid-da-clinica';
```

## 📋 Log de Auditoria

Todas as extensões ficam registradas na tabela `admin_logs`:

```sql
-- Verificar histórico de extensões
SELECT 
    al.acao,
    al.detalhes->>'clinica_id' as clinica_id,
    al.detalhes->>'dias_adicionados' as dias_adicionados,
    al.detalhes->>'nova_data_vencimento' as nova_data,
    al.created_at
FROM admin_logs al
WHERE al.acao = 'EXTENSAO_ASSINATURA'
ORDER BY al.created_at DESC
LIMIT 10;
```

## ⚠️ Cenários de Uso

### 1. **Promoções e Campanhas**
```sql
-- Adicionar 15 dias promocionais
SELECT estender_assinatura_dias(clinica_uuid, 15);
```

### 2. **Problemas Técnicos**
```sql
-- Compensar 5 dias por instabilidade
SELECT estender_assinatura_dias(clinica_uuid, 5);
```

### 3. **Extensão Comercial**
```sql
-- Adicionar 30 dias para negociação
SELECT estender_assinatura_dias(clinica_uuid, 30);
```

### 4. **Migração de Sistema**
```sql
-- Adicionar 60 dias para migração
SELECT estender_assinatura_dias(clinica_uuid, 60);
```

## 🚨 Importantes Considerações

### ✅ Permissões
- Apenas administradores podem executar esta função
- A função é `SECURITY DEFINER` (executa com privilégios elevados)
- Todas as ações são auditadas

### ✅ Validações
- A função verifica se a assinatura existe
- Retorna erro se a clínica não for encontrada
- Atualiza automaticamente o timestamp `updated_at`

### ✅ Logs
- Toda extensão é registrada em `admin_logs`
- Inclui data/hora, dias adicionados e nova data de vencimento
- Permite rastreabilidade completa

## 🎯 Automação (Opcional)

### Script para Extensões em Massa
```sql
-- Adicionar 7 dias para todas as clínicas que vencem em 3 dias
DO $$
DECLARE
    clinica_record RECORD;
BEGIN
    FOR clinica_record IN 
        SELECT c.id, c.nome
        FROM clinicas c
        JOIN assinaturas a ON c.id = a.clinica_id
        WHERE a.proximo_pagamento - CURRENT_DATE <= 3
        AND a.status = 'ativa'
    LOOP
        PERFORM estender_assinatura_dias(clinica_record.id, 7);
        RAISE NOTICE 'Adicionados 7 dias para: %', clinica_record.nome;
    END LOOP;
END;
$$;
```

## 📞 Suporte

Em caso de dúvidas:
1. Verificar logs de erro no painel admin
2. Consultar tabela `admin_logs` para auditoria
3. Testar com uma clínica de teste primeiro
4. Confirmar o UUID da clínica antes de executar

## ✅ Checklist de Execução

- [ ] Acesso ao painel administrativo confirmado
- [ ] Clínica localizada na lista
- [ ] UUID da clínica verificado (se usando SQL)
- [ ] Quantidade de dias definida
- [ ] Extensão executada (interface ou SQL)
- [ ] Resultado verificado na interface
- [ ] Log de auditoria confirmado (opcional)

Este processo garante que extensões de assinatura sejam feitas de forma segura e auditável.