# Análise das tabelas de Workflow – o que é gravado em cada uma

## 1. Visão geral

| Tabela | Função | Relação com as outras |
|--------|--------|------------------------|
| **workflow_trigger_types** | Catálogo de gatilhos (só leitura pelo app) | `workflows.trigger_type` deve guardar um valor que exista em `trigger_id` |
| **workflow_action_types** | Catálogo de ações (só leitura pelo app) | `workflows.actions[].action_id` deve guardar valores que existam em `action_id` |
| **workflows** | Workflows criados/editados pelo usuário | Referencia logicamente as duas tabelas acima (sem FK); é referenciada por `workflow_executions` |
| **workflow_executions** | Histórico de cada execução de um workflow | FK `workflow_id` → `workflows.id` |

Não existe FK entre `workflows.trigger_type` e `workflow_trigger_types.trigger_id`, nem entre `workflows.actions` (JSON) e `workflow_action_types`. A integridade depende do que a aplicação grava.

---

## 2. workflow_trigger_types (catálogo de gatilhos)

**O que é:** Lista fixa de tipos de gatilho disponíveis no sistema. Não é alterada pelo usuário ao criar/editar workflow.

| Coluna | Tipo | O que guarda |
|--------|------|-------------------------------|
| id | INT PK | Id interno |
| **trigger_id** | VARCHAR(50) UNIQUE | **ID do gatilho (ex: `new_guest`, `new_reservation`). Este é o valor que deve ser gravado em `workflows.trigger_type`.** |
| name | VARCHAR(255) | Nome para exibição (ex: "Novo Hóspede") |
| category | VARCHAR(100) | Categoria (Hóspedes, Reservas, etc.) |
| description | TEXT | Descrição |
| is_active | BOOLEAN | Se está ativo |
| config_schema | JSON | Schema de configuração do gatilho |

**Exemplos do seed:** `trigger_id` = 'new_guest', 'new_reservation', 'checkin', 'checkout', 'payment_received', etc.

**Regra:** Em `workflows.trigger_type` só deve ser gravado um valor que exista em `workflow_trigger_types.trigger_id`. Se for gravado o **nome** ("Novo Hóspede") em vez do **trigger_id** ("new_guest"), o WorkflowService não encontra o workflow (ele filtra por `trigger_type = ?` com o valor do evento, ex: 'new_guest').

---

## 3. workflow_action_types (catálogo de ações)

**O que é:** Lista fixa de tipos de ação disponíveis. Não é alterada ao criar/editar workflow.

| Coluna | Tipo | O que guarda |
|--------|------|-------------------------------|
| id | INT PK | Id interno |
| **action_id** | VARCHAR(50) UNIQUE | **ID da ação (ex: `send_email`, `add_points`). Este é o valor que deve aparecer em `workflows.actions[].action_id`.** |
| name | VARCHAR(255) | Nome para exibição |
| category | VARCHAR(100) | Categoria |
| description | TEXT | Descrição |
| is_active | BOOLEAN | Se está ativo |
| config_schema | JSON | Schema da ação |

**Exemplos do seed:** `action_id` = 'send_email', 'send_sms', 'send_whatsapp', 'add_points', 'delay', etc.

**Regra:** Cada item do array `workflows.actions` deve ter `action_id` igual a um `action_id` existente em `workflow_action_types`. O WorkflowService usa `action.action_id` no switch; se vier outro valor, cai no `default` e retorna "Ação não suportada".

---

## 4. workflows (workflows do usuário)

**O que é:** Cada registro é um workflow criado/editado na tela (ex: "Boas-vindas Novo Hóspede").

| Coluna | Tipo | O que deve ser gravado |
|--------|------|------------------------|
| id | INT PK | Id do workflow |
| uuid | VARCHAR(36) | UUID único |
| property_id | INT NULL | Propriedade (NULL = global) |
| name | VARCHAR(255) | Nome do workflow |
| description | TEXT | Descrição |
| **trigger_type** | VARCHAR(50) NOT NULL | **Sempre o trigger_id do catálogo (ex: `new_guest`). Nunca o nome ("Novo Hóspede").** |
| **trigger_config** | JSON NULL | Config do gatilho (filtros, etc.). Pode incluir triggerId, triggerName, category vindos de workflow_trigger_types. |
| **actions** | JSON NOT NULL | Array de objetos: `{ "action_id": "send_email", "config": { ... } }`. Cada `action_id` deve existir em workflow_action_types. |
| status | ENUM | active, paused, draft |
| execution_count, success_count, failure_count | INT | Contadores |
| last_executed_at, last_execution_status | DATETIME, ENUM | Última execução |
| created_at, updated_at, deleted_at | DATETIME | Auditoria e soft delete |

**Formato esperado de `actions` (exemplo):**

```json
[
  { "action_id": "send_email", "config": { "template_id": "...", "subject": "..." } },
  { "action_id": "add_points", "config": { "points": 100, "reason": "Boas-vindas" } }
]
```

**Problemas comuns:**

1. **trigger_type** gravado com o **nome** do gatilho em vez do **trigger_id** → WorkflowService não dispara (busca por `trigger_type = 'new_guest'`).
2. **trigger_config** vazio ou apagado ao salvar → perde filtros/referência do gatilho (já corrigido no frontend/backend para sempre enviar e persistir).
3. **actions[].action_id** com typo ou valor que não existe em workflow_action_types → execução falha com "Ação não suportada".

---

## 5. workflow_executions (histórico de execuções)

**O que é:** Um registro por execução de um workflow (quando um evento dispara o workflow ou execução manual).

| Coluna | Tipo | O que guarda |
|--------|------|-------------------------------|
| id | INT PK | Id da execução |
| uuid | VARCHAR(36) | UUID único |
| workflow_id | INT FK → workflows.id | Workflow que foi executado |
| trigger_data | JSON | Dados do evento que disparou (ex: dados do hóspede) |
| execution_status | ENUM | success, failed, partial |
| execution_duration | DECIMAL | Duração em segundos |
| actions_executed | JSON | Resultado de cada ação |
| error_message, error_details | TEXT, JSON | Erro se houver |
| started_at, completed_at, created_at | DATETIME | Timestamps |

**Quem grava:** WorkflowService ao executar um workflow (INSERT no início, UPDATE ao terminar). Não é preenchida pela tela de edição de workflow.

---

## 6. O que pode estar errado (checklist)

1. **workflows.trigger_type**
   - Deve ser **sempre** um `trigger_id` de `workflow_trigger_types` (ex: `new_guest`).
   - Se estiver o nome ("Novo Hóspede") ou outro valor, a busca por trigger não encontra e o gatilho “não funciona”.
   - **Correção já feita no frontend:** enviar sempre o trigger_id; ao carregar, normalizar nome → trigger_id.

2. **workflows.trigger_config**
   - Deve ser persistido em todo create/update (nunca “sumir”).
   - Pode ser `{}` ou um objeto com triggerId, triggerName, category, filters, etc.
   - **Correção já feita:** frontend envia e backend grava sempre; UPDATE inclui trigger_config quando há triggerType ou triggerConfig.

3. **workflows.actions**
   - Cada elemento deve ter `action_id` (string) e `config` (objeto).
   - `action_id` deve ser um dos `action_id` de `workflow_action_types`.
   - Nenhuma FK no banco; se gravar action_id inválido, o erro só aparece na execução.

4. **workflow_trigger_types / workflow_action_types**
   - São apenas catálogos. O app lê para montar os Selects e para executar.
   - Não devem ser alterados pela tela de workflow; só por migrações/seed ou tela de administração de catálogos, se existir.

5. **workflow_executions**
   - Só é escrita pelo WorkflowService ao executar. Se não houver execuções, a tabela pode estar vazia; isso é esperado até haver eventos (ex: novo hóspede) ou execução manual.

---

## 7. Validação recomendada no backend

Ao criar ou atualizar workflow, validar:

- `trigger_type` existe em `workflow_trigger_types.trigger_id`.
- Cada `actions[].action_id` existe em `workflow_action_types.action_id`.

Assim evita-se gravar dados que depois não serão encontrados na execução. O documento WORKFLOW_SAVE_PROCESS.md descreve o fluxo de gravação; este documento descreve o conteúdo das tabelas e o que pode estar errado.

---

## 8. Como verificar no banco (diagnóstico)

Execute no MySQL para ver o que está realmente gravado:

```sql
-- Catálogo de gatilhos (só leitura pelo app)
SELECT id, trigger_id, name, category, is_active FROM workflow_trigger_types ORDER BY category, trigger_id;

-- Catálogo de ações (só leitura pelo app)
SELECT id, action_id, name, category, is_active FROM workflow_action_types ORDER BY category, action_id;

-- Workflows: conferir se trigger_type é trigger_id (ex: new_guest) e não o nome (ex: "Novo Hóspede")
SELECT id, name, trigger_type, trigger_config, status, 
       JSON_LENGTH(actions) as actions_count, 
       JSON_EXTRACT(actions, '$[0].action_id') as first_action_id
FROM workflows WHERE deleted_at IS NULL;

-- Últimas execuções
SELECT we.id, we.workflow_id, w.name as workflow_name, we.execution_status, we.started_at, we.error_message
FROM workflow_executions we
JOIN workflows w ON w.id = we.workflow_id
ORDER BY we.started_at DESC LIMIT 20;
```

**O que conferir:**

- Em `workflows.trigger_type`: deve aparecer sempre um valor igual a algum `workflow_trigger_types.trigger_id` (ex: `new_guest`, `new_reservation`). Se aparecer "Novo Hóspede" ou outro nome, o gatilho não será encontrado na execução.
- Em `workflows.actions`: cada `action_id` dentro do JSON deve existir em `workflow_action_types.action_id`.

---

## 9. Observação: workflow_executions.error_details

A coluna `error_details` (JSON) em `workflow_executions` **nunca é preenchida** pelo código atual: o `WorkflowService` só grava `error_message` e `actions_executed` no UPDATE da execução. Se quiser guardar detalhes estruturados do erro (stack, código, etc.), é preciso incluir `error_details` nesse UPDATE.

---

## 10. Dados lidos do banco (última leitura)

Foi executado o script `backend/scripts/read_workflow_tables.ts` para ler os dados atuais. Resumo:

### workflow_trigger_types
- **10 linhas.** Todos os `trigger_id` esperados: new_guest, new_reservation, checkin, checkout, payment_received, review_received, birthday, reservation_cancelled, low_occupancy, maintenance_request. Todos `is_active = 1`. Sem inconsistência.

### workflow_action_types
- **10 linhas.** Todos os `action_id` esperados: send_email, send_sms, send_whatsapp, push_notification, create_task, update_database, webhook, add_points, assign_team, delay. Todos `is_active = 1`. Sem inconsistência.

### workflows
- **6 workflows.** Todos com `trigger_type` igual a um `trigger_id` do catálogo (new_guest, new_reservation, checkout, low_occupancy, birthday, etc.) — **não há nome em vez de trigger_id**.
- **Workflow id 1:** `trigger_config` gravado como `"{}"` (string). Os demais (id 2 a 6) têm `trigger_config` com conteúdo (triggerId/triggerName/category ou filters).
- **Workflow id 1:** `execution_count = 14`, `success_count = 14`, `failure_count = 3`. Ou seja, 14 execuções, com 3 delas contadas como falha (parcial ou failed). Coerente.
- As colunas JSON `trigger_config` e `actions` vêm do MySQL como **string**; o app faz parse ao ler. Isso é esperado.

### workflow_executions
- **17 registros** (últimas 50, só há 17). Todos para `workflow_id = 1` (Boas-vindas Novo Hóspede).
- `execution_status`: success, partial ou failed; `trigger_data` com dados do hóspede; `actions_executed` com resultado por ação; `error_message` preenchido quando falha; **`error_details` sempre NULL**.
- Duas execuções com erro: `EmailService.getCompanyInfo is not a function`; uma com `Transaction is not started yet...`.

### Conclusão da leitura
- Nenhum workflow está com `trigger_type` errado (nome em vez de trigger_id).
- O único ponto “vazio” é o workflow id 1 com `trigger_config = {}`; não impede execução.
- `error_details` nunca é gravado; só `error_message` é usado.
- Para regravar o dump: `cd backend && npx tsx scripts/read_workflow_tables.ts`. O arquivo fica em `backend/docs/workflow_tables_dump.json` (não versionar: contém PII em `trigger_data`).
