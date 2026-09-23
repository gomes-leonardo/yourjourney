import { LlmProvider, ModelTier, LlmEmbeddingOptions, LlmCompletionOptions } from './llm-provider.interface.js';
import { GeminiProviderAdapter } from './adapters/gemini.adapter.js';
import { OpenAiProviderAdapter } from './adapters/openai.adapter.js';
import { DeepSeekProviderAdapter } from './adapters/deepseek.adapter.js';

export interface RouteOptions {
  provider?: 'gemini' | 'openai' | 'deepseek' | string;
  model?: string;
  tier?: ModelTier;
  dimensions?: number;
  temperature?: number;
  maxTokens?: number;
}

export class LlmRouterService {
  private providers: Map<string, LlmProvider> = new Map();
  private defaultProvider = 'gemini';

  constructor() {
    this.registerProvider(new GeminiProviderAdapter());
    this.registerProvider(new OpenAiProviderAdapter());
    this.registerProvider(new DeepSeekProviderAdapter());
  }

  registerProvider(provider: LlmProvider): void {
    this.providers.set(provider.providerName.toLowerCase(), provider);
  }

  getProvider(providerName?: string): LlmProvider {
    const targetName = (providerName || this.defaultProvider).toLowerCase();
    const provider = this.providers.get(targetName);
    if (!provider) {
      console.warn(`[LlmRouter] Provider '${targetName}' não encontrado. Usando '${this.defaultProvider}'.`);
      return this.providers.get(this.defaultProvider)!;
    }
    return provider;
  }

  async generateEmbedding(text: string, options?: RouteOptions): Promise<number[]> {
    const provider = this.getProvider(options?.provider);
    return provider.generateEmbedding(text, {
      model: options?.model,
      dimensions: options?.dimensions,
    });
  }

  async generateCompletion(prompt: string, options?: RouteOptions): Promise<string> {
    const provider = this.getProvider(options?.provider);

    // Resolve model based on tier if specific model was not provided
    let model = options?.model;
    if (!model && options?.tier) {
      model = this.resolveModelByTier(provider.providerName, options.tier);
    }

    return provider.generateCompletion(prompt, {
      model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });
  }

  private resolveModelByTier(providerName: string, tier: ModelTier): string {
    switch (providerName) {
      case 'gemini':
        switch (tier) {
          case ModelTier.FAST_LITE:
            return 'gemini-1.5-flash';
          case ModelTier.BALANCED:
            return 'gemini-1.5-flash';
          case ModelTier.REASONING_PRO:
            return 'gemini-1.5-pro';
          default:
            return 'gemini-1.5-flash';
        }
      case 'openai':
        switch (tier) {
          case ModelTier.FAST_LITE:
            return 'gpt-4o-mini';
          case ModelTier.BALANCED:
            return 'gpt-4o-mini';
          case ModelTier.REASONING_PRO:
            return 'gpt-4o';
          default:
            return 'gpt-4o-mini';
        }
      case 'deepseek':
        switch (tier) {
          case ModelTier.REASONING_PRO:
            return 'deepseek-reasoner';
          default:
            return 'deepseek-chat';
        }
      default:
        return 'gemini-1.5-flash';
    }
  }
}
