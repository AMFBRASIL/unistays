# Como o Workflow Funciona

## Visão geral

O workflow é **acionado por eventos** do sistema. Quando algo acontece (ex: nova reserva, novo hóspede), o código chama o serviço de workflow passando o **tipo do evento** e os **dados do evento**. O serviço busca quais workflows estão configurados para aquele evento e executa as ações de cada um (e-mail, WhatsApp, etc.).

```
  [Evento no sistema]     [Chamada no código]           [WorkflowService]
  Nova reserva criada  →  processTrigger({               → getActiveWorkflows('reservation.created')
  Novo hóspede         →    triggerType,                  → retorna workflows com esse gatilho
  Check-out, etc.          eventData                   → para cada um: executeWorkflow(workflow, data)
                         })                              → executa cada ação (e-mail, delay, etc.)
```

---

## 1. Quem dispara o workflow?

Algum ponto do backend que representa o **evento** chama:

```ts
WorkflowService.processTrigger({
  triggerType: 'reservation.created',   // ou 'guest.created', 'reservation.checkout', etc.
  eventData: { /* dados da reserva ou hóspede */ },
  propertyId: null,  // opcional
});
```

**Onde isso já existe:**

| Evento            | Onde é chamado              | triggerType usado   |
|-------------------|-----------------------------|---------------------|
| Novo hóspede      | `GuestController.create`    | `'new_guest'`      |
| Novo hóspede      | `BookingService` (ao criar hóspede na reserva) | `'new_guest'` |
| Nova reserva      | **Ainda não implementado**  | deveria ser `'reservation.created'` |

Ou seja: hoje só o **novo hóspede** dispara workflow; **nova reserva** (e outros eventos) precisam chamar `processTrigger` no lugar certo (ex: após criar a reserva no `ReservationController` ou no `BookingService.createReservation`).

---

## 2. Como o sistema sabe qual workflow executar?

No banco, cada workflow tem **passos** (`workflow_steps`). Um dos passos é do tipo **trigger** e está ligado a um **gatilho** (`workflow_triggers`). O gatilho tem um `config` em JSON, por exemplo:

- Nova Reserva: `{"event": "reservation.created"}`
- Novo Hóspede: `{"event": "guest.created"}`
- Check-out: `{"event": "reservation.checkout"}`

O código passa um `triggerType` (ex: `'reservation.created'`). O serviço:

1. Busca workflows **ativos** (`is_active = TRUE`).
2. Que tenham um passo do tipo **trigger** cujo gatilho tenha `config.event` igual ao `triggerType` (ou a um alias mapeado, ex: `new_guest` → `guest.created`).
3. Para cada workflow encontrado, chama `executeWorkflow(workflow, triggerData)`.

Ou seja: **quem “sabe”** qual workflow executar é a **consulta no banco** que cruza `workflows` + `workflow_steps` + `workflow_triggers` e filtra pelo evento.

---

## 3. Como a execução acontece?

Para cada workflow retornado:

1. **Registra a execução** em `workflow_executions` (status inicial, ex: `pending`/`running`).
2. **Percorre os passos** do workflow (em ordem):
   - Passo **trigger**: só identifica o evento; não “executa” nada.
   - Passo **delay**: espera o tempo configurado (ex: 24h).
   - Passo **action**: executa uma ação (e-mail, SMS, webhook, etc.).
3. Para cada **ação**, o serviço chama a função correspondente (ex: `executeSendEmail`) usando:
   - a **config** do passo (template_id, assunto, destinatário, etc.),
   - os **dados do evento** (para preencher variáveis como `[nome]`, `[numero-reserva]`, etc.).
4. Atualiza **workflow_executions** (status final, duração, erro se houver) e **workflows** (ex: `execution_count`, `last_executed_at`).

O envio de e-mail usa a **config** do passo (incluindo `template_id` da tabela `email_templates` quando você escolhe um template no editor).

---

## 4. Exemplo: Nova Reserva

**Objetivo:** ao criar uma reserva, disparar o workflow “Confirmação de Reserva” (e-mail + WhatsApp).

**O que precisa existir:**

1. **No banco (já existe com o seed):**
   - Gatilho “Nova Reserva” com `config = {"event": "reservation.created"}`.
   - Workflow “Confirmação de Reserva” com passo trigger (Nova Reserva) e passos de ação (Enviar Email, Enviar WhatsApp).

2. **No código (a implementar ou conferir):**
   - No lugar onde a **reserva é efetivamente criada** (ex: `ReservationController.create` ou `BookingService.createReservation`), **depois** de salvar:
     - Chamar `WorkflowService.processTrigger({ triggerType: 'reservation.created', eventData: { ...dados da reserva e hóspede... }, propertyId })`.
   - No `WorkflowService`:
     - `getActiveWorkflows('reservation.created')` deve usar o **novo schema** (workflows + steps + triggers) e retornar os workflows cujo gatilho tem `event = 'reservation.created'`.
     - `executeWorkflow` deve usar o **novo schema** (passos com `action_id` e `config`) e, para cada passo de ação, mapear `action_id` → tipo (ex: Enviar Email → `send_email`) e chamar a função correta (ex: `executeSendEmail` com `config` e `eventData`).

**Fluxo resumido:**

1. Usuário cria reserva na tela.
2. Backend salva a reserva.
3. Backend chama `processTrigger({ triggerType: 'reservation.created', eventData: reserva + hóspede })`.
4. `getActiveWorkflows('reservation.created')` retorna o workflow “Confirmação de Reserva”.
5. `executeWorkflow` roda os passos: Enviar Email (com template/config) e Enviar WhatsApp (com config).
6. E-mail e WhatsApp são enviados com os dados da reserva/hóspede.

---

## 5. Mapeamento triggerType (código) ↔ event (banco)

O código pode usar nomes curtos; o banco usa `event` no `config` do gatilho. Um mapeamento possível:

| Código (triggerType)   | event no config (banco)   |
|------------------------|----------------------------|
| `new_guest`            | `guest.created`           |
| `reservation.created`  | `reservation.created`     |
| `reservation.checkin`  | `reservation.checkin`     |
| `reservation.checkout`| `reservation.checkout`    |
| `reservation.cancelled` | `reservation.cancelled` |
| `payment.received`    | `payment.received`        |

Assim, tanto faz o código chamar `processTrigger({ triggerType: 'reservation.created', ... })` e o banco ter `{"event": "reservation.created"}`, ou o código usar um alias e o serviço traduzir para o `event` antes de buscar os workflows.

---

## 6. O que já está pronto e o que falta

**Já existe:**

- Chamada a `processTrigger` para **novo hóspede** (`GuestController`, `BookingService`).
- Estrutura de workflows no banco (novo schema: workflows, steps, triggers, actions).
- Execução de **e-mail** no `WorkflowService` (incluindo uso de `template_id` e variáveis).
- Registro de execuções em `workflow_executions` (no fluxo antigo).

**Falta:**

1. **getActiveWorkflows** no novo schema: buscar workflows ativos cujo passo trigger tenha `config->>'$.event'` igual ao evento (ou ao alias mapeado).
2. **executeWorkflow** adaptado ao novo schema: carregar passos (steps), ignorar trigger/delay ou tratá-los (delay = aguardar tempo), e para cada passo “action” mapear `action_id` (UUID da tabela `workflow_actions`) para o tipo de ação (email, sms, etc.) e chamar a função correspondente com `step.config` e `eventData`.
3. **Chamada a processTrigger** quando uma **reserva é criada** (e, se quiser, em check-in, check-out, cancelamento, pagamento), passando `triggerType` e `eventData` adequados.

Com isso, o fluxo “nova reserva → workflow Confirmação de Reserva → e-mail e WhatsApp” (e qualquer outro evento configurado) passa a funcionar de ponta a ponta.
