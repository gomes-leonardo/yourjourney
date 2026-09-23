export interface LlmEmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface LlmCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export enum ModelTier {
  EMBEDDING = 'EMBEDDING',
  FAST_LITE = 'FAST_LITE',
  BALANCED = 'BALANCED',
  REASONING_PRO = 'REASONING_PRO',
}

export interface LlmProvider {
  readonly providerName: string;
  generateEmbedding(text: string, options?: LlmEmbeddingOptions): Promise<number[]>;
  generateCompletion(prompt: string, options?: LlmCompletionOptions): Promise<string>;
}
