import { LlmProvider, LlmEmbeddingOptions, LlmCompletionOptions } from '../llm-provider.interface.js';

export class OpenAiProviderAdapter implements LlmProvider {
  readonly providerName = 'openai';

  private apiKey: string;
  private defaultEmbeddingModel = 'text-embedding-3-small';
  private defaultCompletionModel = 'gpt-4o-mini';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async generateEmbedding(text: string, options?: LlmEmbeddingOptions): Promise<number[]> {
    const model = options?.model || this.defaultEmbeddingModel;

    if (this.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            input: text,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API HTTP ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
        if (data.data?.[0]?.embedding) {
          return data.data[0].embedding;
        }
      } catch (err) {
        console.warn(`[OpenAIAdapter] API call failed (${(err as Error).message}). Falling back to deterministic vector.`);
      }
    }

    return this.generateDeterministicVector(text, 1536);
  }

  async generateCompletion(prompt: string, options?: LlmCompletionOptions): Promise<string> {
    const model = options?.model || this.defaultCompletionModel;

    if (this.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options?.temperature ?? 0.2,
            max_tokens: options?.maxTokens ?? 1024,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API HTTP ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return text;
        }
      } catch (err) {
        console.warn(`[OpenAIAdapter] Completion call failed (${(err as Error).message}).`);
      }
    }

    return `[OpenAI Mock Response for model ${model}]: Resposta gerada sobre: ${prompt.slice(0, 100)}...`;
  }

  private generateDeterministicVector(text: string, dimensions: number): number[] {
    const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 2147483647, 0);
    const vector: number[] = [];
    let normSq = 0;
    for (let i = 0; i < dimensions; i++) {
      const val = Math.cos(hash + i * 2);
      vector.push(val);
      normSq += val * val;
    }
    const norm = Math.sqrt(normSq) || 1;
    return vector.map((v) => v / norm);
  }
}
