import { LlmProvider, LlmEmbeddingOptions, LlmCompletionOptions } from '../llm-provider.interface.js';

export class GeminiProviderAdapter implements LlmProvider {
  readonly providerName = 'gemini';

  private apiKey: string;
  private defaultEmbeddingModel = 'gemini-embedding-2';
  private defaultCompletionModel = 'gemini-2.5-flash';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '';
  }

  async generateEmbedding(text: string, options?: LlmEmbeddingOptions): Promise<number[]> {
    const model = options?.model || process.env.LLM_MODEL_EMBEDDING || this.defaultEmbeddingModel;
    const dimensions = options?.dimensions || 768;

    if (this.apiKey) {
      try {
        const body: Record<string, any> = {
          model: `models/${model}`,
          content: { parts: [{ text }] },
        };
        if (dimensions) {
          body.outputDimensionality = dimensions;
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as { embedding?: { values?: number[] } };
        if (data.embedding?.values) {
          return data.embedding.values;
        }
      } catch (err) {
        console.warn(`[GeminiAdapter] Real API call failed (${(err as Error).message}). Falling back to deterministic vector.`);
      }
    }

    // Fallback/Mock embedding generator (deterministic 768-dim vector for testing offline)
    return this.generateDeterministicVector(text, 768);
  }

  async generateCompletion(prompt: string, options?: LlmCompletionOptions): Promise<string> {
    const model = options?.model || process.env.LLM_MODEL_GERACAO || this.defaultCompletionModel;

    if (this.apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: options?.temperature ?? 0.2,
                maxOutputTokens: options?.maxTokens ?? 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } catch (err) {
        console.warn(`[GeminiAdapter] Completion call failed (${(err as Error).message}).`);
      }
    }

    return `[Gemini Mock Response for model ${model}]: Resposta gerada sobre: ${prompt.slice(0, 100)}...`;
  }

  private generateDeterministicVector(text: string, dimensions: number): number[] {
    const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 2147483647, 0);
    const vector: number[] = [];
    let normSq = 0;
    for (let i = 0; i < dimensions; i++) {
      const val = Math.sin(hash + i);
      vector.push(val);
      normSq += val * val;
    }
    const norm = Math.sqrt(normSq) || 1;
    return vector.map((v) => v / norm);
  }
}
