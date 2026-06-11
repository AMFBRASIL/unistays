import { AppDataSource } from '@/config/database';
import { AppError } from '@/middlewares/error.middleware';

interface AiConfig {
  id: number;
  uuid: string;
  propertyId: number | null;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  name: string;
  apiKey: string | null;
  apiEndpoint: string | null;
  model: string | null;
  temperature: number | null;
  maxTokens: number | null;
  organizationId: string | null;
  projectId: string | null;
  region: string | null;
  customHeaders: Record<string, any> | null;
  customParams: Record<string, any> | null;
  isActive: boolean;
  isDefault: boolean;
}

export interface AIPromptOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Serviço centralizado para uso de IA no sistema
 * Busca automaticamente a configuração de IA ativa e permite uso em qualquer lugar
 */
export class IAService {
  /**
   * Buscar configuração de IA padrão ou ativa
   * @param propertyId ID da propriedade (opcional, para config específica)
   * @returns Configuração de IA ativa
   */
  static async getAiConfig(propertyId?: number): Promise<AiConfig | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      let query = `
        SELECT 
          id, uuid, property_id as propertyId, provider, name, api_key, api_endpoint,
          model, temperature, max_tokens as maxTokens, organization_id as organizationId,
          project_id as projectId, region, custom_headers as customHeaders, custom_params as customParams,
          is_active as isActive, is_default as isDefault
        FROM ai_configs 
        WHERE deleted_at IS NULL 
        AND is_active = TRUE
      `;

      const params: any[] = [];
      if (propertyId) {
        query += ` AND (property_id = ? OR property_id IS NULL)`;
        params.push(propertyId);
      } else {
        query += ` AND property_id IS NULL`;
      }

      query += ` ORDER BY is_default DESC, created_at ASC LIMIT 1`;

      const results = await queryRunner.query(query, params);
      await queryRunner.release();

      if (results.length === 0) {
        return null;
      }

      const row = results[0];

      // Parse JSON fields
      let customHeaders = null;
      let customParams = null;

      try {
        if (row.customHeaders) {
          customHeaders = typeof row.customHeaders === 'string' ? JSON.parse(row.customHeaders) : row.customHeaders;
        }
        if (row.customParams) {
          customParams = typeof row.customParams === 'string' ? JSON.parse(row.customParams) : row.customParams;
        }
      } catch (error) {
        // Ignore JSON parse errors
      }

      return {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        provider: row.provider,
        name: row.name,
        apiKey: row.api_key,
        apiEndpoint: row.api_endpoint,
        model: row.model,
        temperature: row.temperature ? parseFloat(row.temperature) : null,
        maxTokens: row.maxTokens ? parseInt(row.maxTokens, 10) : null,
        organizationId: row.organizationId,
        projectId: row.projectId,
        region: row.region,
        customHeaders,
        customParams,
        isActive: Boolean(row.isActive),
        isDefault: Boolean(row.isDefault),
      };
    } catch (error) {
      await queryRunner.release();
      throw error;
    }
  }

  /**
   * Verificar se há configuração de IA disponível
   */
  static async isAvailable(propertyId?: number): Promise<boolean> {
    const config = await this.getAiConfig(propertyId);
    return config !== null;
  }

  /**
   * Enviar prompt para a IA configurada
   * @param prompt Texto do prompt
   * @param options Opções adicionais (temperature, maxTokens, model, systemPrompt)
   * @param propertyId ID da propriedade (opcional)
   * @returns Resposta da IA
   */
  static async sendPrompt(
    prompt: string,
    options: AIPromptOptions = {},
    propertyId?: number
  ): Promise<AIResponse> {
    const config = await this.getAiConfig(propertyId);

    if (!config) {
      throw new AppError('Nenhuma configuração de IA ativa encontrada. Configure uma IA em Configurações > IA.', 400);
    }

    if (!config.apiKey) {
      throw new AppError('API Key não configurada para o provedor de IA', 400);
    }

    // Usar opções fornecidas ou valores padrão da config
    const temperature = options.temperature ?? config.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? config.maxTokens ?? 1000;
    const model = options.model ?? config.model ?? this.getDefaultModel(config.provider);

    // Roteamento para o provedor correto
    switch (config.provider) {
      case 'openai':
        return await this.callOpenAI(config, prompt, { temperature, maxTokens, model, systemPrompt: options.systemPrompt });
      case 'anthropic':
        return await this.callAnthropic(config, prompt, { temperature, maxTokens, model, systemPrompt: options.systemPrompt });
      case 'google':
        return await this.callGoogle(config, prompt, { temperature, maxTokens, model, systemPrompt: options.systemPrompt });
      case 'azure':
        return await this.callAzure(config, prompt, { temperature, maxTokens, model, systemPrompt: options.systemPrompt });
      case 'custom':
        return await this.callCustom(config, prompt, { temperature, maxTokens, model, systemPrompt: options.systemPrompt });
      default:
        throw new AppError(`Provedor de IA não suportado: ${config.provider}`, 400);
    }
  }

  /**
   * Obter modelo padrão para o provedor
   */
  private static getDefaultModel(provider: string): string {
    const defaults: Record<string, string> = {
      openai: 'gpt-4',
      anthropic: 'claude-3-opus-20240229',
      google: 'gemini-pro',
      azure: 'gpt-4',
      custom: 'custom',
    };
    return defaults[provider] || 'gpt-4';
  }

  /**
   * Modelos OpenAI válidos (exemplos): gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo.
   * GPT-5 / GPT-5.x não existem na API. Nomes inválidos usam fallback.
   */
  private static resolveOpenAIModel(configured: string | null | undefined): string {
    const fallback = 'gpt-4o-mini';
    const raw = (configured || '').trim();
    if (!raw) return fallback;
    const lower = raw.toLowerCase();
    // GPT-5 / GPT-5.x não existem na OpenAI; usar fallback
    if (lower.startsWith('gpt-5') || lower.startsWith('gpt5')) {
      console.warn('[IAService] Modelo "' + raw + '" não existe na OpenAI. Usando fallback:', fallback);
      return fallback;
    }
    return raw;
  }

  /**
   * Chamada para OpenAI
   * Usa sempre os dados configurados na tabela ai_configs (API key, model, etc.)
   */
  private static async callOpenAI(
    config: AiConfig,
    prompt: string,
    options: AIPromptOptions & { systemPrompt?: string }
  ): Promise<AIResponse> {
    const apiKey = config.apiKey?.trim() || null;
    if (!apiKey) {
      throw new AppError(
        'API Key da OpenAI não configurada. Configure a chave na tela Configuração de IA (módulo IA em /registrations).',
        400
      );
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const model = IAService.resolveOpenAIModel(options.model);
    const body = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    if (config.organizationId) {
      headers['OpenAI-Organization'] = config.organizationId;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      let message = `OpenAI API error: ${response.status}`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error?.message) message = parsed.error.message;
      } catch {
        if (errBody) message = errBody.slice(0, 200);
      }
      throw new AppError(message, response.status >= 500 ? 502 : 400);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      model?: string;
    };

    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    if (!content) {
      throw new AppError('Resposta vazia da OpenAI', 502);
    }

    return {
      content,
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  /**
   * Chamada para Anthropic Claude
   */
  private static async callAnthropic(
    config: AiConfig,
    prompt: string,
    options: AIPromptOptions & { systemPrompt?: string }
  ): Promise<AIResponse> {
    // TODO: Implementar chamada real à Anthropic API
    throw new AppError('Integração com Anthropic ainda não implementada. Em desenvolvimento.', 501);
  }

  /**
   * Chamada para Google Gemini
   */
  private static async callGoogle(
    config: AiConfig,
    prompt: string,
    options: AIPromptOptions & { systemPrompt?: string }
  ): Promise<AIResponse> {
    // TODO: Implementar chamada real à Google Gemini API
    throw new AppError('Integração com Google Gemini ainda não implementada. Em desenvolvimento.', 501);
  }

  /**
   * Chamada para Azure OpenAI
   */
  private static async callAzure(
    config: AiConfig,
    prompt: string,
    options: AIPromptOptions & { systemPrompt?: string }
  ): Promise<AIResponse> {
    // TODO: Implementar chamada real à Azure OpenAI API
    throw new AppError('Integração com Azure OpenAI ainda não implementada. Em desenvolvimento.', 501);
  }

  /**
   * Chamada para API customizada
   */
  private static async callCustom(
    config: AiConfig,
    prompt: string,
    options: AIPromptOptions & { systemPrompt?: string }
  ): Promise<AIResponse> {
    if (!config.apiEndpoint) {
      throw new AppError('Endpoint não configurado para provedor customizado', 400);
    }

    // TODO: Implementar chamada real à API customizada
    // const headers = {
    //   'Content-Type': 'application/json',
    //   ...(config.customHeaders || {}),
    // };
    // 
    // const body = {
    //   prompt,
    //   ...(options.systemPrompt && { systemPrompt: options.systemPrompt }),
    //   temperature: options.temperature,
    //   maxTokens: options.maxTokens,
    //   model: options.model,
    //   ...(config.customParams || {}),
    // };
    //
    // const response = await fetch(config.apiEndpoint, {
    //   method: 'POST',
    //   headers,
    //   body: JSON.stringify(body),
    // });

    throw new AppError('Integração com API customizada ainda não implementada. Em desenvolvimento.', 501);
  }
}
