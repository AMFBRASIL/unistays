# Processo completo para gravar um Workflow (do início ao fim)

Este documento explica **todo o fluxo** de gravação de um workflow, as **tabelas** envolvidas e **por que o gatilho (trigger_type) pode não estar sendo gravado**.

---

## 1. Tabelas no banco de dados

### 1.1 `workflows` (tabela principal)

Aqui é gravado **cada workflow** criado pelo usuário (ex: "Boas-vindas Novo Hóspede", "Confirmação de Reserva").

| Coluna            | Tipo        | Descrição |
|-------------------|-------------|-----------|
| `id`              | INT         | Chave primária |
| `uuid`            | VARCHAR(36) | Identificador único |
| `property_id`     | INT NULL    | Propriedade (NULL = global) |
| `name`            | VARCHAR(255)| Nome do workflow |
| `description`     | TEXT NULL   | Descrição |
| **`trigger_type`**| **VARCHAR(50)** | **Tipo do gatilho (ex: `new_guest`, `new_reservation`)** ← **aqui que o gatilho é salvo** |
| **`trigger_config`** | **JSON NULL** | **Dados do gatilho vindos de `workflow_trigger_types` (triggerId, triggerName, category) + filtros/condições. Deve ser sempre gravado para não “sumir”.** |
| `actions`         | JSON NOT NULL | Array de ações (send_email, add_points, etc.) |
| `status`          | ENUM        | active, paused, draft |
| `execution_count` | INT         | Contador de execuções |
| ...               | ...         | created_at, updated_at, deleted_at |

- O gatilho é armazenado em **`trigger_type`** (string) e **`trigger_config`** (JSON).
- Na API/frontend usamos **camelCase**: `triggerType`, `triggerConfig`.
- No MySQL a coluna é **snake_case**: `trigger_type`, `trigger_config`.

### 1.2 `workflow_trigger_types` (catálogo de gatilhos)

Não guarda o valor escolhido no workflow. Só lista **quais gatilhos existem** no sistema (ex: Novo Hóspede, Nova Reserva, Check-in).

| Coluna       | Descrição |
|--------------|-----------|
| `trigger_id` | ID do gatilho (ex: `new_guest`, `new_reservation`) |
| `name`       | Nome exibido ("Novo Hóspede") |
| `category`   | Categoria |
| `description`| Descrição |

### 1.3 `workflow_action_types` (catálogo de ações)

Lista **quais ações** existem (Enviar e-mail, Adicionar pontos, etc.). O que o usuário configurou em cada workflow fica no JSON **`workflows.actions`**.

### 1.4 `workflow_executions` (histórico)

Registra **cada vez** que um workflow foi executado (para auditoria e debug). Não interfere na gravação do workflow.

---

## 2. Fluxo completo ao GRAVAR um workflow (UPDATE)

Quando você edita um workflow e clica em **Salvar**, o que acontece é o seguinte:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (WorkflowModal.tsx)                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Monta o payload com: name, description, triggerType, triggerConfig,      │
│    actions, status                                                           │
│ 2. triggerType vem de formData.triggerType ou fallback do workflow carregado│
│ 3. Chama: api.updateWorkflow(workflowId, updatePayload)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ API CLIENT (api.ts)                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Faz: PUT /api/v1/workflows/:id                                            │
│ 5. Body: JSON.stringify(updatePayload)  →  { triggerType: "new_guest", ... }│
│ 6. Headers: Content-Type: application/json, Authorization: Bearer ...        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND - ROTAS (workflow.routes.ts)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. Ordem dos middlewares: authenticate → authorize → validate(updateSchema)  │
│    → controller.update                                                       │
│ 8. Rota: PUT /:id  →  validate(updateWorkflowSchema)  →  WorkflowController    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE DE VALIDAÇÃO (validation.middleware.ts)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. Recebe req.body (objeto já parseado pelo express.json())                  │
│ 10. Chama: schema.parse({ body: req.body, query, params })                   │
│     - updateWorkflowSchema espera body.triggerType (opcional, string min 1)  │
│     - Se válido, retorna parsed = { body: { triggerType, name, ... } }       │
│ 11. IMPORTANTE: req.body = parsed.body  →  controller recebe body validado   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTROLLER (WorkflowController.ts - método update)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 12. data = req.body                                                          │
│ 13. triggerType = rawBody.triggerType ?? rawBody.trigger_type ?? data...    │
│     (lê direto de req.body para não perder o gatilho)                        │
│ 14. Monta updateFields e updateParams só para campos presentes:              │
│     - Se triggerType !== undefined  →  push "trigger_type = ?" e o valor     │
│ 15. Query: UPDATE workflows SET name=?, description=?, trigger_type=?,       │
│            trigger_config=?, actions=?, status=?, updated_at=NOW() WHERE id=? │
│ 16. queryRunner.query(updateQuery, updateParams)                             │
│ 17. commitTransaction()                                                      │
│ 18. SELECT no workflow atualizado e devolve em camelCase (triggerType)        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BANCO DE DADOS (MySQL)                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 19. UPDATE na tabela workflows grava trigger_type e trigger_config           │
│ 20. Coluna trigger_type recebe o valor (ex: "new_guest")                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Onde o gatilho pode “sumir” (e o que já foi feito)

### 3.1 Frontend envia, mas backend não recebe

- **Causa possível:** body em outro formato ou middleware que altera `req.body`.
- **O que foi feito:** o middleware de validação agora faz `req.body = parsed.body`, e o controller lê o gatilho **direto de `req.body`** (`rawBody.triggerType ?? rawBody.trigger_type`).

### 3.2 Backend recebe, mas não coloca no UPDATE

- **Causa possível:** `data.triggerType` vir como `undefined` (tipo TypeScript ou objeto “validado” sem a chave).
- **O que foi feito:** o controller **não depende só de `data`**. Ele usa primeiro `rawBody = req.body` e faz:
  - `triggerType = rawBody.triggerType ?? rawBody.trigger_type ?? (data)...`
  - Assim, se o cliente enviou `triggerType: "new_guest"`, esse valor é usado no UPDATE.

### 3.3 Validação Zod “corta” o triggerType

- **Causa possível:** no update, `triggerType` é opcional; em algum caso o resultado do `parse` não incluir a chave.
- **O que foi feito:** uso de `rawBody` (req.body antes de qualquer atribuição) garante que, se o Express recebeu `triggerType`, o controller usa esse valor.

### 3.4 Ordem dos parâmetros no UPDATE

- **Causa possível:** ordem de `updateParams` diferente da ordem dos `?` na query.
- **Como está:** a ordem é fixa: primeiro os campos (name, description, trigger_type, trigger_config, actions, status), depois `updated_at`, por último o `id` no WHERE. Cada `push` em `updateParams` segue a mesma ordem dos `push` em `updateFields`, então a ordem está correta.

---

## 4. Como conferir se está gravando

1. **Banco de dados:**  
   - Rodar:  
     `SELECT id, name, trigger_type, trigger_config FROM workflows WHERE id = :id;`  
   - `trigger_type` deve estar preenchido (ex: `new_guest`).  
   - `trigger_config` deve ter JSON com dados do gatilho (ex: `{"triggerId":"new_guest","triggerName":"Novo Hóspede","category":"Hóspedes"}`).
2. **Ao reabrir o workflow para edição:** o gatilho e a config devem aparecer preenchidos (nome do gatilho no Select e dados em `trigger_config`).

---

## 5. Resumo das tabelas e do fluxo

| O quê | Onde |
|-------|------|
| Valor do gatilho escolhido (ex: new_guest) | Tabela **`workflows`**, coluna **`trigger_type`** |
| Configurações do gatilho (filtros, etc.) | Tabela **`workflows`**, coluna **`trigger_config`** (JSON) |
| Lista de gatilhos disponíveis | Tabela **`workflow_trigger_types`** (só catálogo) |
| Ações configuradas no workflow | Tabela **`workflows`**, coluna **`actions`** (JSON) |
| Histórico de execuções | Tabela **`workflow_executions`** |

Fluxo de gravação: **Frontend (payload com triggerType) → API PUT → Rotas → Validação (req.body = parsed.body) → Controller (lê rawBody.triggerType e monta UPDATE com trigger_type) → MySQL (UPDATE workflows)**.

---

## 6. trigger_config e workflow_trigger_types

- **`workflow_trigger_types`** é o catálogo de gatilhos (trigger_id, name, category, description, config_schema).
- Na coluna **`trigger_config`** da tabela **`workflows`** deve ser gravado o gatilho que vem desse catálogo: ao menos **triggerId**, **triggerName** e **category**, para a informação não sumir.
- O frontend, ao selecionar um gatilho, preenche `triggerConfig` com `{ triggerId, triggerName, category }` (e mantém filtros existentes se houver). Ao carregar um workflow para edição, enriquece `triggerConfig` com esses campos a partir de `triggerTypes` quando o tipo já está definido.
- O backend sempre persiste `trigger_config` no UPDATE quando há `triggerType` ou quando o payload envia `triggerConfig` (evita apagar a informação).
