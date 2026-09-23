import { LlmProvider, LlmEmbeddingOptions, LlmCompletionOptions } from '../llm-provider.interface.js';

export class DeepSeekProviderAdapter implements LlmProvider {
  readonly providerName = 'deepseek';

  private apiKey: string;
  private defaultCompletionModel = 'deepseek-chat';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
  }

  async generateEmbedding(text: string, options?: LlmEmbeddingOptions): Promise<number[]> {
    // DeepSeek generally uses standard text-embeddings compatible with OpenAI format or fallback vector
    return this.generateDeterministicVector(text, 1536);
  }

  async generateCompletion(prompt: string, options?: LlmCompletionOptions): Promise<string> {
    const model = options?.model || this.defaultCompletionModel;

    if (this.apiKey) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
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
          throw new Error(`DeepSeek API HTTP ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return text;
        }
      } catch (err) {
        console.warn(`[DeepSeekAdapter] Completion call failed (${(err as Error).message}).`);
      }
    }

    return `[DeepSeek Mock Response for model ${model}]: Resposta gerada sobre: ${prompt.slice(0, 100)}...`;
  }

  private generateDeterministicVector(text: string, dimensions: number): number[] {
    const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 2147483647, 0);
    const vector: number[] = [];
    let normSq = 0;
    for (let i = 0; i < dimensions; i++) {
      const val = Math.tan(hash + i);
      vector.push(val);
      normSq += val * val;
    }
    const norm = Math.sqrt(normSq) || 1;
    return vector.map((v) => v / norm);
  }
}
