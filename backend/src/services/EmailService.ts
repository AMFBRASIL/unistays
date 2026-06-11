import nodemailer, { Transporter } from 'nodemailer';
import { AppError } from '@/middlewares/error.middleware';
import { AppDataSource } from '@/config/database';

interface SMTPConfig {
  server: string;
  port: number;
  security: 'tls' | 'ssl' | 'none';
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string | null;
}

interface APIConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'brevo' | 'resend' | 'postmark';
  apiKey: string;
  domain?: string | null;
  fromEmail: string;
  fromName: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string | null;
}

export class EmailService {
  private static getWelcomeEmailTemplate(fromName: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-mail de Teste - Unistays</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header com gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                🎉 Bem-vindo ao Unistays!
              </h1>
            </td>
          </tr>
          
          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Parabéns! Este é um <strong style="color: #667eea;">e-mail de teste</strong> enviado com sucesso através do sistema Unistays.
              </p>
              
              <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                  <strong style="color: #667eea;">✅ Configuração Validada!</strong><br>
                  Sua configuração de e-mail está funcionando perfeitamente. Agora você pode enviar e-mails transacionais através da plataforma.
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Este e-mail foi enviado por: <strong style="color: #667eea;">${fromName}</strong>
              </p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">
                  📧 Informações do Teste
                </h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e9ecef;">
                      <strong style="color: #333333;">Data/Hora:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e9ecef; text-align: right;">
                      ${new Date().toLocaleString('pt-BR', { 
                        dateStyle: 'long', 
                        timeStyle: 'short',
                        timeZone: 'America/Sao_Paulo'
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e9ecef;">
                      <strong style="color: #333333;">Status:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #10b981; font-size: 14px; border-bottom: 1px solid #e9ecef; text-align: right; font-weight: 600;">
                      ✓ Enviado com sucesso
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">
                      <strong style="color: #333333;">Sistema:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; text-align: right;">
                      Unistays PMS
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Se você recebeu este e-mail, significa que tudo está funcionando corretamente! 🚀
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px; line-height: 1.5;">
                Este é um e-mail automático de teste do sistema <strong style="color: #667eea;">Unistays</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} Unistays. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private static createSMTPTransporter(config: SMTPConfig): Transporter {
    const transporterConfig: any = {
      host: config.server,
      port: config.port,
      secure: config.security === 'ssl',
      auth: {
        user: config.username,
        pass: config.password,
      },
    };

    if (config.security === 'tls') {
      transporterConfig.requireTLS = true;
      transporterConfig.tls = {
        rejectUnauthorized: false, // Em produção, considere validar certificados
      };
    }

    return nodemailer.createTransport(transporterConfig);
  }

  private static async sendViaAPI(config: APIConfig, options: EmailOptions): Promise<void> {
    const emailData = {
      from: `"${options.fromName}" <${options.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
      replyTo: options.replyTo || options.fromEmail,
    };

    switch (config.provider) {
      case 'sendgrid': {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(config.apiKey);
        await sgMail.send(emailData);
        break;
      }
      case 'mailgun': {
        if (!config.domain) {
          throw new AppError('Domínio do Mailgun é obrigatório', 400);
        }
        if (!config.apiKey) {
          throw new AppError('API Key do Mailgun é obrigatória', 400);
        }
        try {
          const formData = require('form-data');
          const Mailgun = require('mailgun.js');
          const mailgun = new Mailgun(formData);
          const mg = mailgun.client({
            username: 'api',
            key: config.apiKey,
          });
          const messageData: any = {
            from: `"${options.fromName}" <${options.fromEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.subject,
            ...(options.replyTo ? { 'reply-to': options.replyTo } : {}),
          };
          await mg.messages.create(config.domain, messageData);
        } catch (error: any) {
          // Tratar erros específicos do Mailgun
          if (error.status === 401 || error.statusCode === 401) {
            throw new AppError(
              'Erro de autenticação no Mailgun: API Key inválida ou sem permissões. Verifique sua API Key e certifique-se de que o domínio está associado à sua conta.',
              401
            );
          }
          if (error.status === 400 || error.statusCode === 400) {
            throw new AppError(
              `Erro na requisição do Mailgun: ${error.message || 'Domínio inválido ou configuração incorreta'}`,
              400
            );
          }
          if (error.status === 404 || error.statusCode === 404) {
            throw new AppError(
              'Domínio do Mailgun não encontrado. Verifique se o domínio está correto e foi verificado na sua conta do Mailgun.',
              404
            );
          }
          throw error; // Re-lançar outros erros
        }
        break;
      }
      case 'ses': {
        const AWS = require('aws-sdk');
        const ses = new AWS.SES({
          region: 'us-east-1',
          accessKeyId: config.apiKey.split(':')[0],
          secretAccessKey: config.apiKey.split(':')[1],
        });
        await ses.sendEmail({
          Source: `"${options.fromName}" <${options.fromEmail}>`,
          Destination: { ToAddresses: [options.to] },
          Message: {
            Subject: { Data: options.subject },
            Body: {
              Html: { Data: options.html },
              Text: { Data: options.text || options.subject },
            },
          },
          ReplyToAddresses: [options.replyTo || options.fromEmail],
        }).promise();
        break;
      }
      case 'brevo': {
        const SibApiV3Sdk = require('@getbrevo/brevo');
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, config.apiKey);
        await apiInstance.sendTransacEmail({
          sender: { name: options.fromName, email: options.fromEmail },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text || options.subject,
        });
        break;
      }
      case 'resend': {
        const { Resend } = require('resend');
        const resend = new Resend(config.apiKey);
        await resend.emails.send({
          from: `${options.fromName} <${options.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          replyTo: options.replyTo || options.fromEmail,
        });
        break;
      }
      case 'postmark': {
        const postmark = require('postmark');
        const client = new postmark.ServerClient(config.apiKey);
        await client.sendEmail({
          From: `"${options.fromName}" <${options.fromEmail}>`,
          To: options.to,
          Subject: options.subject,
          HtmlBody: options.html,
          TextBody: options.text || options.subject,
          ReplyTo: options.replyTo || options.fromEmail,
        });
        break;
      }
      default:
        throw new AppError(`Provedor de e-mail não suportado: ${config.provider}`, 400);
    }
  }

  static async sendTestEmail(
    method: 'smtp' | 'api' | 'default',
    testEmail: string,
    config: SMTPConfig | APIConfig | null
  ): Promise<void> {
    if (!config) {
      throw new AppError('Configuração de e-mail não fornecida', 400);
    }

    const fromName = method === 'smtp' 
      ? (config as SMTPConfig).fromName 
      : (config as APIConfig).fromName;
    
    const fromEmail = method === 'smtp'
      ? (config as SMTPConfig).fromEmail
      : (config as APIConfig).fromEmail;

    const replyTo = method === 'smtp' 
      ? (config as SMTPConfig).replyTo 
      : undefined;

    const htmlContent = this.getWelcomeEmailTemplate(fromName);
    const textContent = `Bem-vindo ao Unistays!\n\nEste é um e-mail de teste enviado com sucesso através do sistema Unistays.\n\nE-mail enviado por: ${fromName}\nData/Hora: ${new Date().toLocaleString('pt-BR')}\nStatus: Enviado com sucesso\n\nSe você recebeu este e-mail, significa que tudo está funcionando corretamente!`;

    const emailOptions: EmailOptions = {
      to: testEmail,
      subject: '🎉 Teste de E-mail - Unistays',
      html: htmlContent,
      text: textContent,
      fromEmail,
      fromName,
      replyTo: replyTo && typeof replyTo === 'string' ? replyTo : undefined,
    };

    try {
      if (method === 'smtp') {
        const transporter = this.createSMTPTransporter(config as SMTPConfig);
        await transporter.verify(); // Verificar conexão
        const mailOptions: any = {
          from: `"${fromName}" <${fromEmail}>`,
          to: testEmail,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text,
        };
        if (emailOptions.replyTo && typeof emailOptions.replyTo === 'string') {
          mailOptions.replyTo = emailOptions.replyTo;
        }
        await transporter.sendMail(mailOptions);
      } else if (method === 'api') {
        await this.sendViaAPI(config as APIConfig, emailOptions);
      } else {
        throw new AppError('Método de envio não suportado para teste', 400);
      }
    } catch (error: any) {
      console.error('Erro ao enviar e-mail de teste:', error);
      
      // Se já é um AppError, relançar com a mensagem original
      if (error.isOperational && error.statusCode) {
        throw error;
      }
      
      // Tratar erros genéricos
      const statusCode = error.statusCode || error.status || 500;
      let message = error.message || 'Falha ao enviar e-mail de teste';
      
      // Melhorar mensagens de erro comuns
      if (statusCode === 401) {
        message = 'Erro de autenticação: Verifique suas credenciais (API Key, usuário/senha SMTP)';
      } else if (statusCode === 403) {
        message = 'Acesso negado: Verifique as permissões da sua conta ou API Key';
      } else if (statusCode === 400) {
        message = `Erro na configuração: ${error.message || 'Verifique todos os campos obrigatórios'}`;
      } else if (message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
        message = 'Erro de conexão: Não foi possível conectar ao servidor de e-mail. Verifique o servidor e porta SMTP.';
      } else if (message.includes('Invalid login')) {
        message = 'Credenciais inválidas: Usuário ou senha SMTP incorretos';
      }
      
      throw new AppError(message, statusCode);
    }
  }

  /**
   * Busca informações da empresa/propriedade para uso em variáveis de e-mail
   * Tenta buscar primeiro de properties, depois de general_settings (configuração global)
   * @param propertyId ID da propriedade (opcional)
   * @returns Objeto com informações padronizadas da empresa/propriedade
   */
  static async getCompanyInfo(propertyId?: number | null): Promise<{
    name: string | null;
    legalName: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    cnpj: string | null;
    taxId: string | null;
    wifiNetwork: string | null;
    wifiPassword: string | null;
  }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      let companyInfo: any = {
        name: null,
        legalName: null,
        address: null,
        phone: null,
        email: null,
        website: null,
        cnpj: null,
        taxId: null,
        wifiNetwork: null,
        wifiPassword: null,
      };

      const validPropertyId = propertyId !== null && propertyId !== undefined && !isNaN(Number(propertyId)) ? Number(propertyId) : null;

      // Se há propertyId, tentar buscar de properties primeiro
      if (validPropertyId) {
        try {
          const propertyQuery = `
            SELECT 
              name, address, phone, email, website, tax_id as taxId,
              wifi_network as wifiNetwork, wifi_password as wifiPassword
            FROM properties
            WHERE id = ? AND deleted_at IS NULL
          `;
          const propertyResults = await queryRunner.query(propertyQuery, [validPropertyId]);
          if (propertyResults.length > 0) {
            const prop = propertyResults[0];
            console.log('[EmailService.getCompanyInfo] Property raw data:', JSON.stringify(prop));
            companyInfo = {
              name: prop.name || null,
              legalName: null, // properties não tem legal_name
              address: prop.address || null,
              phone: prop.phone || null,
              email: prop.email || null,
              website: prop.website || null,
              cnpj: null, // properties não tem cnpj
              taxId: prop.taxId || prop.tax_id || null,
              wifiNetwork: prop.wifiNetwork || prop.wifi_network || null,
              wifiPassword: prop.wifiPassword || prop.wifi_password || null,
            };
          }
        } catch (error) {
          console.error('[EmailService.getCompanyInfo] Erro ao buscar informações da propriedade:', error);
        }
      }

      // Sempre tentar complementar com general_settings (global) para campos que estão vazios
      try {
        const generalSettingsQuery = `
          SELECT 
            hotel_name as hotelName,
            legal_name as legalName,
            address,
            contact_phone as contactPhone,
            contact_email as contactEmail,
            website,
            cnpj
          FROM general_settings
          WHERE property_id IS NULL
          ORDER BY created_at DESC
          LIMIT 1
        `;
        const generalSettingsResults = await queryRunner.query(generalSettingsQuery);
        if (generalSettingsResults.length > 0) {
          const gs = generalSettingsResults[0];
          // Preencher apenas campos que não foram encontrados em properties
          if (!companyInfo.name) companyInfo.name = gs.hotelName || null;
          if (!companyInfo.legalName) companyInfo.legalName = gs.legalName || null;
          if (!companyInfo.address) companyInfo.address = gs.address || null;
          if (!companyInfo.phone) companyInfo.phone = gs.contactPhone || null;
          if (!companyInfo.email) companyInfo.email = gs.contactEmail || null;
          if (!companyInfo.website) companyInfo.website = gs.website || null;
          if (!companyInfo.cnpj) companyInfo.cnpj = gs.cnpj || null;
          if (!companyInfo.taxId) companyInfo.taxId = gs.cnpj || null; // CNPJ também pode ser usado como taxId
        }
      } catch (error) {
        console.error('[EmailService.getCompanyInfo] Erro ao buscar configurações gerais:', error);
      }

      await queryRunner.release();
      return companyInfo;
    } catch (error: any) {
      await queryRunner.release();
      console.error('[EmailService.getCompanyInfo] Erro geral:', error);
      // Retornar objeto vazio em caso de erro, não quebrar o fluxo
      return {
        name: null,
        legalName: null,
        address: null,
        phone: null,
        email: null,
        website: null,
        cnpj: null,
        taxId: null,
        wifiNetwork: null,
        wifiPassword: null,
      };
    }
  }

  /**
   * Gera HTML e texto para e-mail com detalhes da reserva (uso no envio por SMTP/API)
   */
  static getReservationDetailsEmailContent(
    reservation: {
      reservationNumber?: string;
      checkIn?: Date | string;
      checkOut?: Date | string;
      checkInTime?: string | null;
      checkOutTime?: string | null;
      nights?: number;
      adults?: number;
      children?: number;
      totalAmount?: number;
      paidAmount?: number;
      balance?: number;
      currency?: string;
      ratePlan?: { name?: string } | null;
      specialRequests?: string | null;
      guest?: { firstName?: string; lastName?: string; email?: string; phone?: string } | null;
      property?: { name?: string; address?: string; phone?: string; email?: string } | null;
      unit?: { number?: string; roomType?: { name?: string } | null } | null;
    },
    companyName?: string | null
  ): { html: string; text: string } {
    const name = companyName || reservation.property?.name || 'Unistays';
    const guestName = reservation.guest
      ? [reservation.guest.firstName, reservation.guest.lastName].filter(Boolean).join(' ') || 'Hóspede'
      : 'Hóspede';
    const formatDate = (d: Date | string | undefined) => {
      if (!d) return '—';
      const dt = typeof d === 'string' ? new Date(d) : d;
      return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatCurrency = (v: number | undefined) => {
      if (v == null) return '—';
      return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: reservation.currency || 'BRL' });
    };
    const resNum = reservation.reservationNumber || '—';
    const checkIn = formatDate(reservation.checkIn);
    const checkOut = formatDate(reservation.checkOut);
    const checkInTime = reservation.checkInTime || '—';
    const checkOutTime = reservation.checkOutTime || '—';
    const nights = reservation.nights ?? 0;
    const adults = reservation.adults ?? 1;
    const children = reservation.children ?? 0;
    const roomName = reservation.unit?.roomType?.name || reservation.unit?.number || '—';
    const unitNumber = reservation.unit?.number ? ` (Unidade ${reservation.unit.number})` : '';
    const ratePlan = reservation.ratePlan?.name || '—';
    const total = formatCurrency(reservation.totalAmount);
    const paid = formatCurrency(reservation.paidAmount);
    const balance = formatCurrency(reservation.balance);
    const specialRequests = reservation.specialRequests?.trim() || null;
    const propertyName = reservation.property?.name || name;
    const propertyAddress = reservation.property?.address || '';
    const propertyPhone = reservation.property?.phone || '';
    const propertyEmail = reservation.property?.email || '';

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detalhes da Reserva - ${resNum}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Detalhes da sua reserva</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${propertyName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px 0; color: #333; font-size: 16px;">Olá, <strong>${guestName}</strong>!</p>
              <p style="margin: 0 0 20px 0; color: #555; font-size: 15px; line-height: 1.5;">Segue o resumo da sua reserva <strong>${resNum}</strong>.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Check-in</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${checkIn} ${checkInTime !== '—' ? checkInTime : ''}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Check-out</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${checkOut} ${checkOutTime !== '—' ? checkOutTime : ''}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Noites</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${nights}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Hóspedes</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${adults} adulto(s)${children ? `, ${children} criança(s)` : ''}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Acomodação</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${roomName}${unitNumber}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Plano tarifário</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${ratePlan}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Valor total</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${total}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Valor pago</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${paid}</td></tr>
                <tr><td style="padding: 10px 0; color: #666;">Restante</td><td style="padding: 10px 0; text-align: right; font-weight: 600;">${balance}</td></tr>
              </table>
              ${specialRequests ? `<p style="margin: 0 0 8px 0; color: #555; font-size: 14px;"><strong>Pedidos especiais:</strong></p><p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">${specialRequests}</p>` : ''}
              <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px; border-radius: 8px;">
                <p style="margin: 0 0 4px 0; color: #333; font-size: 14px; font-weight: 600;">${propertyName}</p>
                ${propertyAddress ? `<p style="margin: 0; color: #666; font-size: 13px;">${propertyAddress}</p>` : ''}
                ${propertyPhone ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">Tel: ${propertyPhone}</p>` : ''}
                ${propertyEmail ? `<p style="margin: 0; color: #666; font-size: 13px;">E-mail: ${propertyEmail}</p>` : ''}
              </div>
              <p style="margin: 20px 0 0 0; color: #888; font-size: 13px;">Este e-mail foi enviado pelo sistema Unistays. Em caso de dúvidas, entre em contato com a propriedade.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = [
      `Detalhes da sua reserva - ${propertyName}`,
      '',
      `Olá, ${guestName}!`,
      `Reserva: ${resNum}`,
      `Check-in: ${checkIn} ${checkInTime !== '—' ? checkInTime : ''}`,
      `Check-out: ${checkOut} ${checkOutTime !== '—' ? checkOutTime : ''}`,
      `Noites: ${nights} | Acomodação: ${roomName}${unitNumber}`,
      `Plano: ${ratePlan}`,
      `Valor total: ${total} | Pago: ${paid} | Restante: ${balance}`,
      specialRequests ? `Pedidos especiais: ${specialRequests}` : '',
      propertyAddress ? `Endereço: ${propertyAddress}` : '',
      propertyPhone ? `Tel: ${propertyPhone}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return { html, text };
  }

  /**
   * Mapeia slug do email_providers para o tipo APIConfig.provider (uso interno e no teste de conexão).
   */
  static mapProviderSlugToProvider(slug: string | null): APIConfig['provider'] {
    if (!slug) return 'sendgrid';
    const s = String(slug).toLowerCase();
    if (s === 'amazon-ses' || s === 'ses') return 'ses';
    if (s === 'sendgrid') return 'sendgrid';
    if (s === 'mailgun') return 'mailgun';
    if (s === 'brevo') return 'brevo';
    if (s === 'resend') return 'resend';
    if (s === 'postmark') return 'postmark';
    return 'sendgrid';
  }

  /**
   * Busca a configuração de e-mail ativa em smtp_configurations (mesma fonte da tela Configuração de E-mail).
   * O sistema usa uma única configuração para todo o envio (não há filtro por property_id).
   * Usado por sendEmail e pelo envio de testes.
   */
  static async getCurrentEmailConfigFromDb(_propertyId?: number | null): Promise<{
    method: 'smtp' | 'api';
    smtpConfig?: SMTPConfig;
    apiConfig?: APIConfig;
  } | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const query = `
        SELECT sc.id, sc.property_id, sc.name, sc.provider_type, sc.smtp_host, sc.smtp_port, sc.smtp_encryption,
               sc.smtp_username, sc.smtp_password, sc.api_key, sc.api_domain,
               ep.slug AS provider_slug
        FROM smtp_configurations sc
        LEFT JOIN email_providers ep ON ep.id = sc.email_provider_id
        WHERE sc.is_active = 1
        ORDER BY sc.is_default DESC, sc.created_at DESC
        LIMIT 1
      `;
      const rows = await queryRunner.query(query);
      if (rows.length === 0) {
        await queryRunner.release();
        return null;
      }

      const row = rows[0];
      await queryRunner.release();
      const configId = row.id;

      let fromEmail = row.smtp_username || '';
      let fromName = row.name || 'Unistays';
      let replyTo: string | null = row.smtp_username || null;
      try {
        const q2 = AppDataSource.createQueryRunner();
        const [idRow] = await q2.query(
          'SELECT sender_email, sender_name, reply_to_email FROM smtp_sender_identities WHERE smtp_configuration_id = ? AND is_default = 1 AND is_active = 1 LIMIT 1',
          [configId]
        );
        await q2.release();
        if (idRow) {
          fromEmail = idRow.sender_email || fromEmail;
          fromName = idRow.sender_name || fromName;
          replyTo = idRow.reply_to_email || idRow.sender_email || replyTo;
        }
      } catch {
        //
      }

      const providerType = (row.provider_type || 'smtp').toLowerCase();
      if (providerType === 'unistays' || providerType === 'default') {
        return null;
      }
      if (providerType === 'api') {
        const apiKey = row.api_key ?? row.api_key_encrypted ?? '';
        const provider = this.mapProviderSlugToProvider(row.provider_slug);
        return {
          method: 'api',
          apiConfig: {
            provider,
            apiKey,
            domain: row.api_domain || undefined,
            fromEmail,
            fromName,
          },
        };
      }

      const security = (row.smtp_encryption === 'ssl' ? 'ssl' : row.smtp_encryption === 'none' ? 'none' : 'tls') as 'tls' | 'ssl' | 'none';
      return {
        method: 'smtp',
        smtpConfig: {
          server: row.smtp_host || '',
          port: Number(row.smtp_port) || 587,
          security,
          username: row.smtp_username || '',
          password: row.smtp_password || '',
          fromEmail,
          fromName,
          replyTo: replyTo || undefined,
        },
      };
    } catch (err) {
      try {
        await queryRunner.release();
      } catch {
        //
      }
      throw err;
    }
  }

  /**
   * Envia um e-mail usando a configuração ativa em smtp_configurations (mesma da tela Configuração de E-mail).
   */
  static async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    propertyId?: number | null
  ): Promise<void> {
    const config = await this.getCurrentEmailConfigFromDb(propertyId);
    if (!config) {
      throw new AppError('Nenhuma configuração de e-mail ativa encontrada. Configure em Cadastros > Configuração de E-mail.', 404);
    }

    const emailOptions: EmailOptions = {
      to,
      subject,
      html,
      text: text || subject,
      fromEmail: config.method === 'smtp' ? config.smtpConfig!.fromEmail : config.apiConfig!.fromEmail,
      fromName: config.method === 'smtp' ? config.smtpConfig!.fromName : config.apiConfig!.fromName,
      replyTo: config.method === 'smtp' ? (config.smtpConfig!.replyTo || config.smtpConfig!.fromEmail) : config.apiConfig!.fromEmail,
    };

    try {
      if (config.method === 'smtp' && config.smtpConfig) {
        const transporter = this.createSMTPTransporter(config.smtpConfig);
        await transporter.sendMail({
          from: `"${emailOptions.fromName}" <${emailOptions.fromEmail}>`,
          to: emailOptions.to,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text,
          replyTo: emailOptions.replyTo || emailOptions.fromEmail,
        });
      } else if (config.method === 'api' && config.apiConfig) {
        await this.sendViaAPI(config.apiConfig, emailOptions);
      } else {
        throw new AppError('Método de e-mail não suportado', 400);
      }
    } catch (error: any) {
      if (error.isOperational && error.statusCode) {
        throw error;
      }
      const statusCode = error.statusCode || error.status || 500;
      const message = error.message || 'Falha ao enviar e-mail';
      throw new AppError(message, statusCode);
    }
  }
}
