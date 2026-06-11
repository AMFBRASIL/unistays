import { AppDataSource } from '../config/database';
import { Property, PropertyType, PropertyStatus } from '../entities/Property.entity';
import { Unit, UnitStatus } from '../entities/Unit.entity';
import { User, UserStatus } from '../entities/User.entity';
import { RatePlan, RatePlanType, RatePlanStatus } from '../entities/RatePlan.entity';
import { UserGroup } from '../entities/UserGroup.entity';
import { hashPassword } from '../utils/bcrypt';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { QueryRunner } from 'typeorm';

export interface SetupWizardData {
  // Step 1 - Company
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  pais: string;
  fusoHorario: string;
  idioma: string;
  moeda: string;
  tipoOperacao: string;
  qtdEmpreendimentos: string;

  // Step 2 - Property
  nomeEmpreendimento: string;
  tipoEmpreendimento: string;
  endereco: string;
  cidade: string;
  estado: string;
  paisEmpreendimento: string;
  checkinPadrao: string;
  checkoutPadrao: string;
  politicaCancelamento: string;
  recepcao24h: boolean;
  telefoneEmpreendimento: string;
  emailEmpreendimento: string;
  websiteEmpreendimento: string;

  // Step 3 - Units
  modoCriacaoUnidades: string;
  unidades: Array<{
    id: string;
    identificador: string;
    tipo: string;
    capacidade: string;
    permiteOTA: boolean;
    permiteLongStay: boolean;
    smartLock: boolean;
    bloco: string;
    andar: string;
  }>;

  // Step 4 - Stay Models
  modeloHotel: boolean;
  modeloTemporada: boolean;
  modeloLongStay: boolean;
  configHotel: {
    minNoites: string;
    limpeza: string;
    contrato: boolean;
    caucao: boolean;
    cobranca: string;
  };
  configTemporada: {
    minNoites: string;
    limpeza: string;
    contrato: boolean;
    caucao: boolean;
    cobranca: string;
  };
  configLongStay: {
    minNoites: string;
    limpeza: string;
    contrato: boolean;
    caucao: boolean;
    cobranca: string;
  };

  // Step 5 - Rates
  modoCriacaoTarifas: string;
  tarifas: Array<{
    id: string;
    nome: string;
    valorBase: string;
    tipo: string;
    validadeInicio: string;
    validadeFim: string;
  }>;

  // Step 6 - Payments
  moedaPagamento: string;
  formasPagamento: {
    pix: boolean;
    cartao: boolean;
    boleto: boolean;
    dinheiro: boolean;
  };
  gateway: string;
  prePagamento: boolean;
  multaNoShow: string;

  // Step 7 - Email
  metodoEmail: string;
  provedorApi?: string;
  apiKey?: string;
  emailRemetente?: string;
  nomeRemetente?: string;
  servidorSmtp?: string;
  portaSmtp?: string;
  segurancaSmtp?: string;
  usuarioSmtp?: string;
  senhaSmtp?: string;
  limiteMensal?: string;
  brandingUnistays?: boolean;
  idiomaEmail?: string;
  replyTo?: string;
  templatesAtivos?: {
    confirmacaoReserva: boolean;
    checkinDigital: boolean;
    pagamentoRecebido: boolean;
    lembreteCheckout: boolean;
    avaliacaoPosEstadia: boolean;
  };

  // Step 8 - Users
  usuarios: Array<{
    id: string;
    nome: string;
    email: string;
    papel: string;
  }>;

  // Step 9 - Integrations
  integracoesAtivas: string[];
}

export class SetupService {
  /**
   * Processa a instalação completa do sistema baseado nos dados do wizard
   */
  static async processInstallation(data: SetupWizardData): Promise<{
    success: boolean;
    message: string;
    data: {
      propertyId: number;
      userIds: number[];
      ratePlanIds: number[];
      unitIds: number[];
    };
  }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      logger.info('Iniciando processo de instalação...');

      // 1. Criar usuários
      const userIds = await this.createUsers(data.usuarios, queryRunner);
      logger.info(`Usuários criados: ${userIds.length}`);

      // 2. Criar propriedade
      const property = await this.createProperty(data, userIds[0] || null, queryRunner);
      logger.info(`Propriedade criada: ${property.id} - ${property.name}`);

      // 3. Criar unidades
      const unitIds = await this.createUnits(data.unidades, property.id, queryRunner);
      logger.info(`Unidades criadas: ${unitIds.length}`);

      // 4. Criar tarifas
      const ratePlanIds = await this.createRatePlans(data.tarifas, property.id, queryRunner);
      logger.info(`Tarifas criadas: ${ratePlanIds.length}`);

      // 5. Configurar métodos de pagamento (se necessário)
      await this.configurePaymentMethods(data, property.id, queryRunner);

      // 6. Configurar email (se necessário)
      await this.configureEmail(data, property.id, queryRunner);

      // 7. Configurar settings gerais
      await this.configureGeneralSettings(data, property.id, queryRunner);

      await queryRunner.commitTransaction();

      logger.info('Instalação concluída com sucesso!');

      return {
        success: true,
        message: 'Instalação concluída com sucesso!',
        data: {
          propertyId: property.id,
          userIds,
          ratePlanIds,
          unitIds,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Erro durante instalação:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cria usuários baseado nos dados do wizard
   */
  private static async createUsers(
    usuarios: SetupWizardData['usuarios'],
    queryRunner: QueryRunner
  ): Promise<number[]> {
    const userRepository = queryRunner.manager.getRepository(User);
    const userGroupRepository = queryRunner.manager.getRepository(UserGroup);
    const userIds: number[] = [];

    // Mapear papéis do frontend para roles do backend
    const roleMapping: Record<string, string> = {
      admin: 'super_admin',
      recepcao: 'receptionist',
      governanca: 'housekeeping',
      manutencao: 'housekeeping',
      financeiro: 'accountant',
    };

    for (const usuario of usuarios) {
      // Verificar se usuário já existe
      const existingUser = await userRepository.findOne({
        where: { email: usuario.email },
      });

      if (existingUser) {
        logger.warn(`Usuário ${usuario.email} já existe, pulando...`);
        userIds.push(existingUser.id);
        continue;
      }

      // Gerar senha temporária (usuário deve alterar no primeiro login)
      const tempPassword = await hashPassword('Temp123!@#');

      const user = userRepository.create({
        email: usuario.email,
        password: tempPassword,
        name: usuario.nome,
        status: UserStatus.ACTIVE,
        emailVerified: false,
      });

      // Associar ao grupo de usuários correspondente ANTES de salvar
      const groupName = this.getGroupNameForRole(usuario.papel);
      if (groupName) {
        const group = await userGroupRepository.findOne({
          where: { name: groupName },
        });

        if (group) {
          user.userGroupId = group.id;
        }
      }

      const savedUser = await userRepository.save(user);
      userIds.push(savedUser.id);

      // Também criar relação na tabela user_group_relations (se necessário)
      if (savedUser.userGroupId) {
        try {
          await queryRunner.manager.query(
            `INSERT INTO user_group_relations (user_id, group_id, created_at) 
             VALUES (?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE created_at = created_at`,
            [savedUser.id, savedUser.userGroupId]
          );
        } catch (error) {
          // Se a tabela não existir ou já tiver relação, apenas logar
          logger.warn('Erro ao criar relação user_group_relations:', error);
        }
      }

      logger.info(`Usuário criado: ${usuario.email} (${usuario.papel})`);
    }

    return userIds;
  }

  /**
   * Cria a propriedade baseada nos dados do wizard
   */
  private static async createProperty(
    data: SetupWizardData,
    ownerId: number | null,
    queryRunner: QueryRunner
  ): Promise<Property> {
    const propertyRepository = queryRunner.manager.getRepository(Property);

    // Mapear tipo do frontend para enum do backend
    const typeMapping: Record<string, PropertyType> = {
      hotel: PropertyType.HOTEL,
      'apart-hotel': PropertyType.APART_HOTEL,
      pousada: PropertyType.HOTEL,
      loft: PropertyType.LOFT,
      chacara: PropertyType.TEMPORADA,
      temporada: PropertyType.TEMPORADA,
      misto: PropertyType.HOTEL,
    };

    const propertyType = typeMapping[data.tipoEmpreendimento] || PropertyType.HOTEL;

    // Configurar settings da propriedade
    const settings = {
      timezone: data.fusoHorario || 'America/Sao_Paulo',
      currency: data.moeda || 'BRL',
      language: data.idioma || 'pt-BR',
      checkIn: data.checkinPadrao || '14:00',
      checkOut: data.checkoutPadrao || '12:00',
      reception24h: data.recepcao24h || false,
      cancellationPolicy: data.politicaCancelamento || '',
      operationType: data.tipoOperacao || 'hotel',
    };

    const property = propertyRepository.create({
      name: data.nomeEmpreendimento,
      type: propertyType,
      status: PropertyStatus.ACTIVE,
      address: data.endereco,
      city: data.cidade,
      state: data.estado,
      country: data.paisEmpreendimento || 'Brasil',
      phone: data.telefoneEmpreendimento || null,
      email: data.emailEmpreendimento || null,
      website: data.websiteEmpreendimento || null,
      taxId: data.cnpj || null,
      ownerId: ownerId,
      settings: settings,
      cleaningSchedule: this.mapCleaningSchedule(data),
    });

    const savedProperty = await propertyRepository.save(property);
    return savedProperty;
  }

  /**
   * Cria unidades baseadas nos dados do wizard
   */
  private static async createUnits(
    unidades: SetupWizardData['unidades'],
    propertyId: number,
    queryRunner: QueryRunner
  ): Promise<number[]> {
    const unitRepository = queryRunner.manager.getRepository(Unit);
    const unitIds: number[] = [];

    for (const unidade of unidades) {
      if (!unidade.identificador) {
        logger.warn('Unidade sem identificador, pulando...');
        continue;
      }

      const unit = unitRepository.create({
        propertyId: propertyId,
        number: unidade.identificador,
        name: unidade.identificador,
        floor: parseInt(unidade.andar) || 1,
        capacity: parseInt(unidade.capacidade) || 2,
        maxCapacity: parseInt(unidade.capacidade) || 2,
        status: UnitStatus.AVAILABLE,
        notes: JSON.stringify({
          permiteOTA: unidade.permiteOTA || false,
          permiteLongStay: unidade.permiteLongStay || false,
          smartLock: unidade.smartLock || false,
          bloco: unidade.bloco || '',
        }),
      });

      const savedUnit = await unitRepository.save(unit);
      const savedUnitEntity = Array.isArray(savedUnit) ? savedUnit[0] : savedUnit;
      unitIds.push(savedUnitEntity.id);
    }

    return unitIds;
  }

  /**
   * Cria planos de tarifa baseados nos dados do wizard
   */
  private static async createRatePlans(
    tarifas: SetupWizardData['tarifas'],
    propertyId: number,
    queryRunner: QueryRunner
  ): Promise<number[]> {
    const ratePlanRepository = queryRunner.manager.getRepository(RatePlan);
    const ratePlanIds: number[] = [];

    for (const tarifa of tarifas) {
      if (!tarifa.nome || !tarifa.valorBase) {
        logger.warn('Tarifa sem nome ou valor base, pulando...');
        continue;
      }

      // Gerar código único para a tarifa
      const code = tarifa.nome
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .substring(0, 50);

      const ratePlan = ratePlanRepository.create({
        propertyId: propertyId,
        name: tarifa.nome,
        code: code,
        type: tarifa.tipo === 'nao-reembolsavel' ? RatePlanType.PROMOTIONAL : RatePlanType.RACK,
        status: RatePlanStatus.ACTIVE,
        currency: 'BRL',
        baseRate: parseFloat(tarifa.valorBase) || 0,
        validFrom: tarifa.validadeInicio ? new Date(tarifa.validadeInicio) : null,
        validTo: tarifa.validadeFim ? new Date(tarifa.validadeFim) : null,
      });

      const savedRatePlan = await ratePlanRepository.save(ratePlan);
      ratePlanIds.push(savedRatePlan.id);
    }

    return ratePlanIds;
  }

  /**
   * Configura métodos de pagamento
   */
  private static async configurePaymentMethods(
    data: SetupWizardData,
    propertyId: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    // Inserir métodos de pagamento na tabela payment_methods
    // Nota: payment_methods não tem property_id, são métodos globais
    const paymentMethods = [];

    if (data.formasPagamento.pix) {
      paymentMethods.push({
        name: 'PIX',
        code: 'pix',
        type: 'pix',
        isActive: true,
      });
    }

    if (data.formasPagamento.cartao) {
      paymentMethods.push({
        name: 'Cartão de Crédito',
        code: 'credit_card',
        type: 'credit_card',
        isActive: true,
        details: data.gateway ? { gateway: data.gateway } : null,
      });
    }

    if (data.formasPagamento.boleto) {
      paymentMethods.push({
        name: 'Boleto',
        code: 'bank_transfer',
        type: 'bank_transfer',
        isActive: true,
      });
    }

    if (data.formasPagamento.dinheiro) {
      paymentMethods.push({
        name: 'Dinheiro',
        code: 'cash',
        type: 'cash',
        isActive: true,
      });
    }

    if (paymentMethods.length > 0) {
      for (const method of paymentMethods) {
        // Verificar se já existe
        const existing = await queryRunner.manager.query(
          `SELECT id FROM payment_methods WHERE code = ?`,
          [method.code]
        );

        if (existing.length === 0) {
          await queryRunner.manager.query(
            `INSERT INTO payment_methods 
             (uuid, name, code, type, is_active, details, created_at, updated_at)
             VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              method.name,
              method.code,
              method.type,
              method.isActive,
              method.details ? JSON.stringify(method.details) : null,
            ]
          );
        }
      }
    }
  }

  /**
   * Configura email
   */
  private static async configureEmail(
    data: SetupWizardData,
    propertyId: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    if (!data.metodoEmail) {
      return;
    }

    let emailConfig: any = {
      property_id: propertyId,
      method: data.metodoEmail,
      enabled: true,
      from_email: data.emailRemetente || null,
      from_name: data.nomeRemetente || null,
      language: data.idiomaEmail || 'pt-BR',
      reply_to: data.replyTo || null,
    };

    if (data.metodoEmail === 'api') {
      emailConfig = {
        ...emailConfig,
        provider: data.provedorApi || 'sendgrid',
        api_key: data.apiKey || null,
      };
    } else if (data.metodoEmail === 'smtp') {
      emailConfig = {
        ...emailConfig,
        smtp_host: data.servidorSmtp || null,
        smtp_port: parseInt(data.portaSmtp || '587'),
        smtp_secure: data.segurancaSmtp || 'tls',
        smtp_user: data.usuarioSmtp || null,
        smtp_password: data.senhaSmtp || null,
      };
    } else if (data.metodoEmail === 'unistays') {
      emailConfig = {
        ...emailConfig,
        monthly_limit: parseInt(data.limiteMensal || '1000'),
        branding: data.brandingUnistays || true,
      };
    }

    // Inserir ou atualizar configuração de email
    // Verificar se a tabela existe e tem a estrutura esperada
    try {
      await queryRunner.manager.query(
        `INSERT INTO email_configs 
         (uuid, property_id, method, enabled, from_email, from_name, language, reply_to, 
          provider, api_key, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password,
          monthly_limit, branding, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
           method = VALUES(method),
           enabled = VALUES(enabled),
           from_email = VALUES(from_email),
           from_name = VALUES(from_name),
           updated_at = NOW()`,
        [
          emailConfig.property_id,
          emailConfig.method,
          emailConfig.enabled ? 1 : 0,
          emailConfig.from_email,
          emailConfig.from_name,
          emailConfig.language,
          emailConfig.reply_to,
          emailConfig.provider || null,
          emailConfig.api_key || null,
          emailConfig.smtp_host || null,
          emailConfig.smtp_port || null,
          emailConfig.smtp_secure || null,
          emailConfig.smtp_user || null,
          emailConfig.smtp_password || null,
          emailConfig.monthly_limit || null,
          emailConfig.branding ? 1 : 0,
        ]
      );
    } catch (error: any) {
      // Se a tabela não existir, apenas logar o erro mas não falhar a instalação
      logger.warn('Tabela email_configs não encontrada ou estrutura diferente. Pulando configuração de email.', error);
    }
  }

  /**
   * Configura settings gerais
   */
  private static async configureGeneralSettings(
    data: SetupWizardData,
    propertyId: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    const settings = {
      company: {
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        cnpj: data.cnpj,
        pais: data.pais,
      },
      regional: {
        timezone: data.fusoHorario,
        language: data.idioma,
        currency: data.moeda,
      },
      stayModels: {
        hotel: data.modeloHotel,
        temporada: data.modeloTemporada,
        longStay: data.modeloLongStay,
        configHotel: data.configHotel,
        configTemporada: data.configTemporada,
        configLongStay: data.configLongStay,
      },
      payments: {
        prePayment: data.prePagamento,
        noShowPenalty: parseFloat(data.multaNoShow) || 0,
      },
      integrations: data.integracoesAtivas || [],
    };

    // Inserir ou atualizar configurações gerais
    try {
      await queryRunner.manager.query(
        `INSERT INTO general_settings 
         (uuid, property_id, settings, created_at, updated_at)
         VALUES (UUID(), ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
           settings = VALUES(settings),
           updated_at = NOW()`,
        [propertyId, JSON.stringify(settings)]
      );
    } catch (error: any) {
      // Se a tabela não existir, apenas logar o erro mas não falhar a instalação
      logger.warn('Tabela general_settings não encontrada ou estrutura diferente. Pulando configurações gerais.', error);
    }
  }

  /**
   * Mapeia o agendamento de limpeza
   */
  private static mapCleaningSchedule(data: SetupWizardData): string | null {
    if (data.modeloHotel && data.configHotel.limpeza) {
      return data.configHotel.limpeza === 'diaria' ? 'per-stay' : 'weekly';
    }
    if (data.modeloTemporada && data.configTemporada.limpeza) {
      return data.configTemporada.limpeza === 'semanal' ? 'weekly' : 'per-stay';
    }
    if (data.modeloLongStay && data.configLongStay.limpeza) {
      return data.configLongStay.limpeza === 'mensal' ? 'monthly' : 'biweekly';
    }
    return 'per-stay';
  }

  /**
   * Obtém o nome do grupo baseado no papel
   */
  private static getGroupNameForRole(papel: string): string | null {
    const mapping: Record<string, string> = {
      admin: 'Administradores',
      recepcao: 'Recepção',
      governanca: 'Housekeeping',
      manutencao: 'Housekeeping',
      financeiro: 'Financeiro',
    };
    return mapping[papel] || null;
  }
}
