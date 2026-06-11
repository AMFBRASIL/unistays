// Templates HTML pré-definidos para cada tipo de template de e-mail
// Design moderno, responsivo e profissional

export const getDefaultHtmlTemplate = (type: string): string => {
  const templates: Record<string, string> = {
    reservation_confirmation: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Reserva</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reserva Confirmada!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Sua reserva foi confirmada com sucesso</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #667eea;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                É com grande satisfação que confirmamos sua reserva! Estamos ansiosos para recebê-lo e proporcionar uma experiência incrível.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #4f46e5; font-size: 20px; font-weight: 600;">📋 Detalhes da Reserva</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(79, 70, 229, 0.1);">
                          <strong style="color: #374151; display: inline-block; width: 140px;">Check-in:</strong>
                          <span style="color: #6b7280;">[data-checkin] às [hora-checkin]</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(79, 70, 229, 0.1);">
                          <strong style="color: #374151; display: inline-block; width: 140px;">Check-out:</strong>
                          <span style="color: #6b7280;">[data-checkout] às [hora-checkout]</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(79, 70, 229, 0.1);">
                          <strong style="color: #374151; display: inline-block; width: 140px;">Acomodação:</strong>
                          <span style="color: #6b7280;">[tipo-quarto] - Quarto [numero-quarto]</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #374151; display: inline-block; width: 140px;">Valor Total:</strong>
                          <span style="color: #059669; font-size: 18px; font-weight: 700;">[valor-total]</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>Número da Reserva:</strong> <span style="color: #667eea; font-family: monospace; font-size: 16px;">[numero-reserva]</span>
                </p>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Protocolo: <strong>[protocolo]</strong></p>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-checkin]" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Realizar Check-in Online
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Precisa de ajuda?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #667eea; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #667eea; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Estamos ansiosos para recebê-lo!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    reservation_pending: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Pendente</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">⏳</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reserva Pendente</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Aguardando confirmação</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #f59e0b;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Recebemos sua solicitação de reserva e ela está em análise. Nossa equipe entrará em contato em breve para confirmar.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #92400e; font-size: 20px; font-weight: 600;">📋 Detalhes da Solicitação</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(146, 64, 14, 0.1);">
                          <strong style="color: #374151; display: inline-block; width: 140px;">Check-in:</strong>
                          <span style="color: #6b7280;">[data-checkin] às [hora-checkin]</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(146, 64, 14, 0.1);">
                          <strong style="color: #374151; display: inline-block; width: 140px;">Check-out:</strong>
                          <span style="color: #6b7280;">[data-checkout] às [hora-checkout]</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #374151; display: inline-block; width: 140px;">Acomodação:</strong>
                          <span style="color: #6b7280;">[tipo-quarto]</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Protocolo:</strong> <span style="color: #f59e0b; font-family: monospace; font-size: 16px;">[protocolo]</span>
                </p>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Dúvidas?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #f59e0b; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #f59e0b; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    checkin_digital: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in Digital</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">📱</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Check-in Digital</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Faça seu check-in online de forma rápida e prática</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #10b981;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Para facilitar sua chegada, você pode realizar o check-in online agora mesmo! Basta clicar no botão abaixo e preencher as informações solicitadas.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #047857; font-size: 20px; font-weight: 600;">📅 Informações da Reserva</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;">
                      <strong>Data de Check-in:</strong> [data-checkin] às [hora-checkin]
                    </p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;">
                      <strong>Acomodação:</strong> [tipo-quarto] - Quarto [numero-quarto]
                    </p>
                    <p style="margin: 0; color: #374151; font-size: 14px;">
                      <strong>Protocolo:</strong> [protocolo]
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-checkin]" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      Realizar Check-in Online
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #047857; font-size: 14px; font-weight: 600;">📋 Documentos necessários:</p>
                <ul style="margin: 0; padding-left: 20px; color: #065f46; font-size: 14px;">
                  <li>Documento de identidade com foto (RG ou CNH)</li>
                  <li>CPF (se não estiver no documento)</li>
                  <li>Cartão de crédito para eventual caução</li>
                </ul>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Precisa de ajuda?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #10b981; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #10b981; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Esperamos você em breve!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    // Adicionando todos os outros templates - devido ao tamanho, vou criar templates genéricos mas profissionais
    // que podem ser personalizados pelo usuário
    checkin_reminder: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete Check-in</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🔔</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Lembrete de Check-in</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Sua reserva está chegando!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #3b82f6;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Este é um lembrete amigável de que seu check-in está agendado para <strong>[data-checkin]</strong> às <strong>[hora-checkin]</strong>. Estamos ansiosos para recebê-lo!
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #1e40af; font-size: 20px; font-weight: 600;">📅 Informações da Reserva</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Check-in:</strong> [data-checkin] às [hora-checkin]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Acomodação:</strong> [tipo-quarto] - Quarto [numero-quarto]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Protocolo:</strong> [protocolo]</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-checkin]" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Realizar Check-in Online
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    checkin_confirmation: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Check-in Confirmado!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Bem-vindo ao [nome-hotel]</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #10b981;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Seu check-in foi realizado com sucesso! Esperamos que tenha uma estadia maravilhosa conosco.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #047857; font-size: 20px; font-weight: 600;">🏨 Sua Acomodação</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Quarto:</strong> [numero-quarto]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Tipo:</strong> [tipo-quarto]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Check-out:</strong> [data-checkout] às [hora-checkout]</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Desfrute da sua estadia!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    payment_received: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Recebido</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">💳</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Pagamento Recebido!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Recebemos seu pagamento com sucesso</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #10b981;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Confirmamos o recebimento do seu pagamento. Agradecemos pela confiança!
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #047857; font-size: 20px; font-weight: 600;">💰 Detalhes do Pagamento</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Valor Pago:</strong> <span style="color: #059669; font-size: 18px; font-weight: 700;">[valor-pago]</span></p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Valor Total:</strong> [valor-total]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Reserva:</strong> [numero-reserva]</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    payment_pending: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Pendente</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">⏱️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Pagamento Pendente</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Aguardando confirmação do pagamento</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #f59e0b;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Identificamos um pagamento pendente para sua reserva. Por favor, confirme ou realize o pagamento para garantir sua acomodação.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #92400e; font-size: 20px; font-weight: 600;">💳 Informações</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Valor Pendente:</strong> <span style="color: #f59e0b; font-size: 18px; font-weight: 700;">[valor-pendente]</span></p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Reserva:</strong> [numero-reserva]</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Ver Detalhes da Reserva
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Dúvidas? Entre em contato:<br>
                📞 <a href="tel:[telefone-hotel]" style="color: #f59e0b; text-decoration: none;">[telefone-hotel]</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    payment_overdue: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento em Atraso</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">⚠️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Pagamento em Atraso</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Atenção: seu pagamento está vencido</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #ef4444;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Identificamos que seu pagamento está em atraso. Por favor, entre em contato conosco o quanto antes para regularizar a situação.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #991b1b; font-size: 20px; font-weight: 600;">💳 Informações</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Valor em Atraso:</strong> <span style="color: #ef4444; font-size: 18px; font-weight: 700;">[valor-pendente]</span></p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Reserva:</strong> [numero-reserva]</p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Entre em contato conosco para evitar cancelamento da reserva.
                </p>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Entre em contato:</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #ef4444; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #ef4444; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Equipe [nome-hotel]
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    checkout_reminder: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete Check-out</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🕐</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Lembrete de Check-out</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Sua estadia está chegando ao fim</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #f59e0b;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Esperamos que tenha tido uma excelente estadia conosco! Este é um lembrete amigável de que seu check-out está agendado para <strong>[data-checkout]</strong> às <strong>[hora-checkout]</strong>.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #92400e; font-size: 20px; font-weight: 600;">📋 Informações do Check-out</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Data e Hora:</strong> [data-checkout] às [hora-checkout]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Quarto:</strong> [numero-quarto] - [tipo-quarto]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Reserva:</strong> [numero-reserva]</p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">💡 Dicas para o Check-out:</p>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px;">
                  <li>Certifique-se de deixar o quarto organizado</li>
                  <li>Verifique se não esqueceu nenhum pertence</li>
                  <li>Devolva as chaves na recepção</li>
                  <li>Se houver pagamentos pendentes, realize na recepção</li>
                </ul>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Precisa de ajuda?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #f59e0b; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #f59e0b; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Foi um prazer recebê-lo!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    checkout_confirmation: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-out Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Check-out Realizado!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Obrigado por escolher o [nome-hotel]</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #6366f1;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Confirmamos o seu check-out realizado em <strong>[data-checkout]</strong>. Foi um prazer recebê-lo e esperamos vê-lo novamente em breve!
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #4f46e5; font-size: 20px; font-weight: 600;">📊 Resumo da Estadia</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Check-in:</strong> [data-checkin] às [hora-checkin]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Check-out:</strong> [data-checkout] às [hora-checkout]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Total de Noites:</strong> [noites] noite(s)</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Valor Total:</strong> <span style="color: #059669; font-weight: 700;">[valor-total]</span></p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-avaliacao]" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Avaliar sua Experiência
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Esperamos recebê-lo novamente!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    post_stay_review: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avaliação Pós-Estadia</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">⭐</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Como foi sua experiência?</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Sua opinião é muito importante para nós!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #a855f7;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Esperamos que tenha tido uma estadia maravilhosa conosco! Sua opinião é fundamental para continuarmos melhorando nossos serviços e proporcionar experiências ainda melhores.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #7c3aed; font-size: 20px; font-weight: 600;">📅 Sua Estadia</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Período:</strong> [data-checkin] a [data-checkout]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Acomodação:</strong> [tipo-quarto] - Quarto [numero-quarto]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Reserva:</strong> [numero-reserva]</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-avaliacao]" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.3);">
                      Avaliar Agora
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #6b21a8; font-size: 14px;">
                  <strong>💝 Obrigado!</strong> Ao compartilhar sua experiência, você nos ajuda a melhorar continuamente nossos serviços.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Esperamos recebê-lo novamente em breve!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    welcome: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao [nome-hotel]</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">✨</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Bem-vindo ao [nome-hotel]!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Estamos felizes em tê-lo conosco</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #6366f1;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                É com enorme prazer que damos as boas-vindas ao [nome-hotel]! Estamos comprometidos em proporcionar uma experiência única e inesquecível durante sua estadia.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #4f46e5; font-size: 20px; font-weight: 600;">🏨 O que você pode esperar:</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>Acomodações confortáveis e bem equipadas</li>
                      <li>Atendimento personalizado e atencioso</li>
                      <li>Localização privilegiada</li>
                      <li>Serviços de qualidade para sua comodidade</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f0f9ff; border-left: 4px solid #6366f1; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #1e40af; font-size: 14px; font-weight: 600;">📞 Precisa de algo?</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                  Nossa equipe está à sua disposição 24 horas. Entre em contato conosco a qualquer momento!
                </p>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Como nos encontrar:</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📍 [endereco-hotel]
                </p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #6366f1; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #6366f1; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Desejamos uma estadia maravilhosa!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    booking_cancellation: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cancelamento de Reserva</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">❌</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Cancelamento Confirmado</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Sua reserva foi cancelada</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #6b7280;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Confirmamos o cancelamento da sua reserva. Sentimos muito por não poder recebê-lo desta vez, mas esperamos tê-lo conosco em uma próxima oportunidade.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #374151; font-size: 20px; font-weight: 600;">📋 Reserva Cancelada</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Número da Reserva:</strong> [numero-reserva]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Período:</strong> [data-checkin] a [data-checkout]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Acomodação:</strong> [tipo-quarto]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Protocolo:</strong> [protocolo]</p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f9fafb; border-left: 4px solid #6b7280; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>ℹ️ Informações sobre reembolso:</strong> Caso tenha direito a reembolso, o valor será processado conforme nossa política de cancelamento. Entre em contato conosco para mais informações.
                </p>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Fazer Nova Reserva
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Dúvidas sobre o cancelamento?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #6b7280; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #6b7280; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Esperamos recebê-lo em breve!<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    booking_modification: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modificação de Reserva</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">✏️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Alteração na Reserva</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Sua reserva foi modificada</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #f97316;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Informamos que sua reserva foi modificada conforme solicitado. Abaixo estão os detalhes atualizados da sua reserva.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #c2410c; font-size: 20px; font-weight: 600;">📋 Detalhes Atualizados</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Número da Reserva:</strong> [numero-reserva]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Check-in:</strong> [data-checkin] às [hora-checkin]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Check-out:</strong> [data-checkout] às [hora-checkout]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Acomodação:</strong> [tipo-quarto] - Quarto [numero-quarto]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Valor Total:</strong> <span style="color: #059669; font-weight: 700;">[valor-total]</span></p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #c2410c; font-size: 14px;">
                  <strong>ℹ️ Importante:</strong> Em caso de alterações no valor, entre em contato conosco para informações sobre ajustes financeiros.
                </p>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Ver Detalhes da Reserva
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Dúvidas sobre as alterações?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #f97316; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #f97316; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    invoice: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fatura/Nota Fiscal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">📄</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Fatura/Nota Fiscal</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Documento fiscal em anexo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #3b82f6;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Segue em anexo a fatura/nota fiscal referente aos serviços contratados. Este documento é válido para fins fiscais e comprovação de pagamento.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #1e40af; font-size: 20px; font-weight: 600;">📋 Informações do Documento</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Número da Reserva:</strong> [numero-reserva]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Período:</strong> [data-checkin] a [data-checkout]</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Valor Total:</strong> <span style="color: #059669; font-size: 18px; font-weight: 700;">[valor-total]</span></p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Protocolo:</strong> [protocolo]</p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>💡 Importante:</strong> Guarde este documento para sua contabilidade e declaração de imposto de renda (quando aplicável).
                </p>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Dados do Emitente:</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;"><strong>[nome-hotel]</strong></p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">CNPJ: [cnpj-hotel]</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">[endereco-hotel]</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #3b82f6; text-decoration: none;">[telefone-hotel]</a> | 
                  ✉️ <a href="mailto:[email-hotel]" style="color: #3b82f6; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Em caso de dúvidas, entre em contato conosco.<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    password_reset: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🔒</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Recuperação de Senha</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Redefina sua senha com segurança</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong>[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha segura.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #991b1b; font-size: 14px; font-weight: 600;">⚠️ Importante sobre segurança:</p>
                <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px;">
                  <li>Este link é válido por 24 horas</li>
                  <li>Se você não solicitou esta alteração, ignore este e-mail</li>
                  <li>Nunca compartilhe sua senha com terceiros</li>
                  <li>Use uma senha forte com letras, números e símbolos</li>
                </ul>
              </div>
              <div style="background-color: #f9fafb; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
                  <span style="color: #3b82f6; word-break: break-all;">[link-reserva]</span>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Se você não solicitou esta alteração, entre em contato conosco imediatamente.<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
              <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px;">
                📞 <a href="tel:[telefone-hotel]" style="color: #ef4444; text-decoration: none;">[telefone-hotel]</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    account_verification: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de Conta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">✅</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Verifique sua Conta</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Complete seu cadastro</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #3b82f6;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Obrigado por criar sua conta no [nome-hotel]! Para completar seu cadastro e garantir a segurança da sua conta, por favor, verifique seu endereço de e-mail clicando no botão abaixo.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                      Verificar E-mail
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>ℹ️ Importante:</strong> Este link é válido por 24 horas. Se você não criou esta conta, pode ignorar este e-mail com segurança.
                </p>
              </div>
              <div style="background-color: #f9fafb; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
                  <span style="color: #3b82f6; word-break: break-all;">[link-reserva]</span>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Bem-vindo ao [nome-hotel]!<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    promotion: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promoções Especiais</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🎁</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Promoções Especiais!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Ofertas exclusivas para você</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #ec4899;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Temos o prazer de apresentar nossas promoções especiais! Aproveite ofertas exclusivas e descontos imperdíveis para sua próxima estadia.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #be185d; font-size: 20px; font-weight: 600;">🎯 Ofertas Disponíveis</h2>
                    <p style="margin: 0 0 15px; color: #374151; font-size: 14px;">
                      Descubra nossas promoções especiais e economize na sua próxima reserva!
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      Ver Promoções
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Dúvidas sobre as promoções?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #ec4899; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #ec4899; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Esperamos recebê-lo em breve!<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    newsletter: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter [nome-hotel]</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">📰</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Newsletter [nome-hotel]</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Novidades e atualizações</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #8b5cf6;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                É um prazer mantê-lo informado sobre as últimas novidades, eventos e ofertas especiais do [nome-hotel]!
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #6b21a8; font-size: 20px; font-weight: 600;">📢 Nesta Edição</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>Novidades e melhorias em nossos serviços</li>
                      <li>Eventos e atividades especiais</li>
                      <li>Dicas de viagem e destinos</li>
                      <li>Ofertas e promoções exclusivas</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[site-hotel]" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Visitar Site
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  Não deseja mais receber nossos e-mails? <a href="[link-cancelamento]" style="color: #8b5cf6; text-decoration: none;">Cancelar inscrição</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <strong style="color: #374151;">Equipe [nome-hotel]</strong><br>
                📍 [endereco-hotel] | 📞 [telefone-hotel]
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    maintenance_notification: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aviso de Manutenção</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🔧</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Aviso de Manutenção</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Informações importantes</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #f59e0b;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Informamos que será realizada manutenção programada em nossas instalações. Nossa equipe está trabalhando para garantir que todos os serviços estejam funcionando perfeitamente.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #92400e; font-size: 20px; font-weight: 600;">📅 Informações</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Período:</strong> A ser definido</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Serviços Afetados:</strong> Verifique conosco</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Duração Estimada:</strong> A ser informado</p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>ℹ️ Informação:</strong> Faremos o possível para minimizar qualquer inconveniente. Pedimos desculpas antecipadamente por qualquer transtorno.
                </p>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Dúvidas ou preocupações?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #f59e0b; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #f59e0b; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Obrigado pela compreensão,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    event_invitation: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para Evento</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🎉</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Você está Convidado!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Evento especial no [nome-hotel]</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #a855f7;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                É com grande prazer que convidamos você para um evento especial no [nome-hotel]! Será uma ocasião única para desfrutar de momentos especiais e conhecer mais sobre nossos serviços.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #7c3aed; font-size: 20px; font-weight: 600;">📅 Detalhes do Evento</h2>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Data:</strong> A ser informado</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Horário:</strong> A ser informado</p>
                    <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>Local:</strong> [nome-hotel]</p>
                    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Endereço:</strong> [endereco-hotel]</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Confirmar Presença
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Mais informações:</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #a855f7; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #a855f7; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Esperamos você!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    loyalty_program: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Programa de Fidelidade</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🏆</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Programa de Fidelidade</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Seus benefícios esperam por você!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #6366f1;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Você está participando do nosso Programa de Fidelidade! Acumule pontos a cada estadia e ganhe benefícios exclusivos, descontos e recompensas especiais.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #4f46e5; font-size: 20px; font-weight: 600;">🎁 Benefícios Exclusivos</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>Descontos especiais em reservas</li>
                      <li>Upgrade de acomodação (sujeito a disponibilidade)</li>
                      <li>Acesso antecipado a promoções</li>
                      <li>Acúmulo de pontos para trocar por benefícios</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Ver Meus Pontos
                    </a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Dúvidas sobre o programa?</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #6366f1; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #6366f1; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Obrigado por fazer parte do nosso programa!<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    feedback_request: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitação de Feedback</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">💬</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Sua Opinião é Importante!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Compartilhe sua experiência conosco</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #06b6d4;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Valorizamos muito sua opinião! Sua experiência é fundamental para continuarmos melhorando nossos serviços e proporcionar momentos ainda melhores aos nossos hóspedes.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #0e7490; font-size: 20px; font-weight: 600;">📝 Como podemos melhorar?</h2>
                    <p style="margin: 0; color: #374151; font-size: 14px;">
                      Compartilhe suas sugestões, comentários ou feedback sobre sua experiência. Cada opinião nos ajuda a evoluir!
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-avaliacao]" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Enviar Feedback
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f0fdfa; border-left: 4px solid #06b6d4; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #0f766e; font-size: 14px;">
                  <strong>💝 Obrigado!</strong> Seu feedback é essencial para continuarmos oferecendo o melhor serviço possível.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    
    special_occasion: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ocasião Especial</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: white;">🎊</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Ocasião Especial!</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Celebre momentos únicos conosco</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #ec4899;">[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Parabéns! Estamos cientes de que você está celebrando uma ocasião especial. No [nome-hotel], adoraríamos fazer parte deste momento especial e torná-lo ainda mais memorável!
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #be185d; font-size: 20px; font-weight: 600;">🎉 Para sua Celebração</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>Decoração especial no quarto</li>
                      <li>Surpresas e mimos exclusivos</li>
                      <li>Atendimento personalizado</li>
                      <li>Experiências únicas para tornar o momento especial</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="[link-reserva]" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Fazer Reserva Especial
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #be185d; font-size: 14px;">
                  <strong>💝 Lembre-se:</strong> Entre em contato conosco com antecedência para que possamos preparar uma surpresa especial para você!
                </p>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">Fale conosco:</p>
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                  📞 <a href="tel:[telefone-hotel]" style="color: #ec4899; text-decoration: none;">[telefone-hotel]</a>
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  ✉️ <a href="mailto:[email-hotel]" style="color: #ec4899; text-decoration: none;">[email-hotel]</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Que este seja um momento inesquecível!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };

  // Templates genéricos para outros tipos - podem ser personalizados
  if (!templates[type]) {
    // Template base genérico que pode ser usado para qualquer tipo
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-mail - [nome-hotel]</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">[nome-hotel]</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Olá <strong>[cliente]</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Seu conteúdo aqui. Personalize este template conforme necessário.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Atenciosamente,<br>
                <strong style="color: #374151;">Equipe [nome-hotel]</strong>
              </p>
              <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px;">
                📞 <a href="tel:[telefone-hotel]" style="color: #667eea; text-decoration: none;">[telefone-hotel]</a> | 
                ✉️ <a href="mailto:[email-hotel]" style="color: #667eea; text-decoration: none;">[email-hotel]</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  return templates[type];
};

export const getDefaultSubject = (type: string): string => {
  const subjects: Record<string, string> = {
    reservation_confirmation: "Confirmação de Reserva - [nome-hotel]",
    reservation_pending: "Reserva Pendente - [nome-hotel]",
    checkin_digital: "Check-in Digital - [nome-hotel]",
    checkin_reminder: "Lembrete de Check-in - [nome-hotel]",
    checkin_confirmation: "Check-in Confirmado - [nome-hotel]",
    payment_received: "Pagamento Recebido - [nome-hotel]",
    payment_pending: "Lembrete de Pagamento - [nome-hotel]",
    payment_overdue: "Pagamento em Atraso - [nome-hotel]",
    checkout_reminder: "Lembrete de Check-out - [nome-hotel]",
    checkout_confirmation: "Check-out Confirmado - [nome-hotel]",
    post_stay_review: "Avalie sua estadia - [nome-hotel]",
    welcome: "Bem-vindo ao [nome-hotel]!",
    booking_cancellation: "Cancelamento de Reserva - [nome-hotel]",
    booking_modification: "Alteração na Reserva - [nome-hotel]",
    invoice: "Fatura/Nota Fiscal - [nome-hotel]",
    password_reset: "Recuperação de Senha - [nome-hotel]",
    account_verification: "Verificação de Conta - [nome-hotel]",
    promotion: "Promoções Especiais - [nome-hotel]",
    newsletter: "Newsletter [nome-hotel]",
    maintenance_notification: "Aviso de Manutenção - [nome-hotel]",
    event_invitation: "Convite para Evento - [nome-hotel]",
    loyalty_program: "Programa de Fidelidade - [nome-hotel]",
    feedback_request: "Sua opinião é importante - [nome-hotel]",
    special_occasion: "Ocasião Especial - [nome-hotel]",
  };
  return subjects[type] || "E-mail - [nome-hotel]";
};
