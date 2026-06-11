# Variáveis dinâmicas em templates de e-mail (Workflows)

As variáveis abaixo são substituídas automaticamente no **assunto** e no **corpo HTML** dos e-mails enviados pela ação **Enviar Email** dos workflows.

**Onde estão definidas:** `backend/src/services/WorkflowService.ts`, método `executeSendEmail`, objeto `variableMap` (por volta das linhas 778–823).

**Formato:** use no template exatamente como está, entre colchetes, por exemplo: `[nome]`, `[numero-reserva]`.

---

## Hóspede / Cliente

| Variável           | Descrição                         | Exemplo / origem      |
|--------------------|-----------------------------------|------------------------|
| `[cliente]`        | Nome do hóspede (primeiro nome)   | João                  |
| `[nome]`           | Nome do hóspede (primeiro nome)   | João                  |
| `[nome-cliente]`   | Nome do hóspede (primeiro nome)   | João                  |
| `[sobrenome]`      | Sobrenome do hóspede              | Silva                 |
| `[sobrenome-cliente]` | Sobrenome do hóspede           | Silva                 |
| `[nome-completo]`  | Nome e sobrenome                   | João Silva            |
| `[email]`          | E-mail do hóspede                  | joao@email.com        |
| `[email-cliente]`  | E-mail do hóspede                  | joao@email.com        |
| `[telefone]`       | Telefone do hóspede                | (11) 99999-9999       |
| `[telefone-cliente]` | Telefone do hóspede             | (11) 99999-9999       |
| `[cpf-cliente]`    | CPF/documento do hóspede          | 123.456.789-00        |
| `[documento-cliente]` | Documento do hóspede           | 123.456.789-00        |
| `[cpf]`            | CPF/documento do hóspede           | 123.456.789-00        |
| `[documento]`       | Documento do hóspede               | 123.456.789-00        |

---

## Reserva

| Variável           | Descrição                         | Exemplo / origem      |
|--------------------|-----------------------------------|------------------------|
| `[numero-reserva]` | Número/código da reserva           | 12345 ou confirmationCode |
| `[protocolo]`      | Protocolo / código da reserva       | RES123456             |
| `[data-checkin]`   | Data de check-in                   | 2025-02-01            |
| `[data-checkout]`  | Data de check-out                  | 2025-02-05            |
| `[hora-checkin]`   | Hora de check-in (se disponível)  | 14:00                 |
| `[hora-checkout]`  | Hora de check-out (se disponível) | 12:00                 |
| `[noites]`         | Quantidade de noites               | 4                     |
| `[numero-quarto]`  | Número da unidade/quarto           | 101                   |
| `[tipo-quarto]`    | Tipo da acomodação                 | Apartamento          |
| `[adultos]`        | Número de adultos                  | 2                     |
| `[criancas]`       | Número de crianças                 | 1                     |

---

## Financeiro

| Variável           | Descrição                         | Exemplo / origem      |
|--------------------|-----------------------------------|------------------------|
| `[valor-total]`    | Valor total da reserva/pagamento  | 1500.00               |
| `[valor]`          | Valor (total ou do evento)        | 1500.00               |
| `[valor-pago]`     | Valor já pago                     | 500.00                |
| `[valor-pendente]` | Valor pendente                    | 1000.00               |
| `[valor-diaria]`   | Valor da diária                   | 375.00                |
| `[moeda]`          | Moeda (padrão: R$)                | R$                    |

---

## Hotel / Propriedade

| Variável           | Descrição                         | Exemplo / origem      |
|--------------------|-----------------------------------|------------------------|
| `[nome-hotel]`     | Nome da propriedade/empresa       | Unistays / Config     |
| `[endereco-hotel]` | Endereço da propriedade            | Rua X, 123            |
| `[telefone-hotel]` | Telefone da propriedade           | (11) 3333-4444        |
| `[email-hotel]`     | E-mail de contato da propriedade  | contato@hotel.com     |
| `[site-hotel]`     | Site da propriedade               | https://...           |
| `[cnpj-hotel]`     | CNPJ / documento da propriedade   | 12.345.678/0001-90    |

---

## Observações

- **Origem dos dados:** quando o gatilho é de **reserva** (ex.: Nova Reserva, Check-out), os dados do hóspede vêm de `eventData.guest` e os da reserva de `eventData.reservation`; o serviço normaliza isso antes de montar o `variableMap`.
- **Substituição:** é feita no HTML e no assunto; qualquer ocorrência exata da variável (ex.: `[nome]`) é trocada pelo valor. Valores vazios deixam a string vazia.
- **Hotel/Propriedade:** vêm de `EmailService.getCompanyInfo(propertyId)` e da configuração de e-mail (remetente), não do evento.
