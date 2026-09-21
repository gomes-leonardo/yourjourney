import { randomInt } from 'node:crypto';
import { describe, it, expect, vi } from 'vitest';
import { generateConfirmationCode } from './confirmation-code.js';

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return { ...actual, randomInt: vi.fn(actual.randomInt) };
});

describe('generateConfirmationCode', () => {
  it('sempre devolve exatamente 6 dígitos', () => {
    for (let i = 0; i < 500; i++) {
      expect(generateConfirmationCode()).toMatch(/^\d{6}$/);
    }
  });

  it('completa com zeros à esquerda quando o número sorteado é pequeno', () => {
    vi.mocked(
      randomInt as (min: number, max: number) => number,
    ).mockReturnValueOnce(42);

    expect(generateConfirmationCode()).toBe('000042');
  });

  it('sorteia entre 0 e 999999, pela fonte criptográfica do Node', () => {
    generateConfirmationCode();

    expect(randomInt).toHaveBeenLastCalledWith(0, 1_000_000);
  });
});
