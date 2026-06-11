# Template de Confirmação de Reserva – Variáveis

Use estes placeholders no HTML e substitua por valores reais ao enviar o e-mail.

## Variáveis disponíveis

| Placeholder         | Exemplo                    | Descrição                          |
|--------------------|----------------------------|------------------------------------|
| `{{guestName}}`    | Maria Silva                | Nome completo do hóspede          |
| `{{reservationNumber}}` | RES-123456             | Número/código da reserva           |
| `{{propertyName}}` | Pousada do Mar             | Nome da propriedade                |
| `{{checkIn}}`      | 15/02/2025                 | Data de check-in (dd/mm/aaaa)      |
| `{{checkOut}}`     | 18/02/2025                 | Data de check-out                  |
| `{{checkInTime}}`  | 14:00                      | Horário de check-in (opcional)     |
| `{{checkOutTime}}` | 12:00                      | Horário de check-out (opcional)   |
| `{{nights}}`       | 3                          | Quantidade de noites               |
| `{{adults}}`       | 2                          | Número de adultos                  |
| `{{children}}`    | 1                          | Número de crianças                 |
| `{{roomName}}`     | Quarto Duplo               | Nome do tipo de acomodação         |
| `{{unitNumber}}`  | 101                        | Número da unidade (opcional)       |
| `{{ratePlan}}`     | Diária                     | Nome do plano tarifário            |
| `{{total}}`        | R$ 1.500,00                 | Valor total da reserva             |
| `{{paid}}`         | R$ 500,00                   | Valor já pago                      |
| `{{balance}}`      | R$ 1.000,00                 | Valor restante a pagar             |
| `{{specialRequests}}` | Late checkout          | Pedidos especiais (ou vazio)       |
| `{{propertyAddress}}` | Rua das Flores, 100     | Endereço da propriedade            |
| `{{propertyPhone}}`  | (11) 3333-4444            | Telefone da propriedade            |
| `{{propertyEmail}}` | contato@pousada.com      | E-mail da propriedade             |

## Arquivos

- **reservation_confirmation.html** – Versão com CSS interno e suporte a blocos condicionais (estilo Mustache: `{{#var}}...{{/var}}`). Use em sistemas que suportem Mustache/Handlebars.
- **reservation_confirmation_simple.html** – Versão com placeholders simples `{{var}}` e estilos inline (melhor para e-mails). Substitua cada `{{var}}` pelo valor ou deixe em branco quando não houver dado.

## Uso no backend (Unistays)

O `EmailService.getReservationDetailsEmailContent()` já monta o HTML com os dados da reserva. Para usar este HTML como base no template de e-mail do sistema, você pode:

1. Copiar o conteúdo de `reservation_confirmation_simple.html` para o corpo do template na tela de **Templates de E-mail** (ou tabela `workflow_email_templates` / equivalente).
2. Garantir que o backend substitua os placeholders pelos mesmos nomes ao renderizar (ex.: Handlebars, ou um `replace` com objeto `{ guestName, reservationNumber, ... }`).

Formato de datas e moeda no backend: `toLocaleDateString('pt-BR')` e `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`.
