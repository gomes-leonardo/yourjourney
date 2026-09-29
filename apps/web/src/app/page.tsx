import styles from './page.module.css';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:8080';

type Health = { status: string; service: string; uptimeSeconds: number };

async function buscarSaudeDaApi(): Promise<Health | null> {
  try {
    const resposta = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    return resposta.ok ? ((await resposta.json()) as Health) : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const saude = await buscarSaudeDaApi();

  return (
    <main className={styles.main}>
      <h1 className={styles.titulo}>Your Journey</h1>
      <p className={styles.subtitulo}>
        Plano de estudos adaptativo a partir do seu próprio material.
      </p>
      <section className={styles.cartao}>
        <h2 className={styles.cartaoTitulo}>API</h2>
        {saude ? (
          <>
            <p className={styles.ok}>Respondendo</p>
            <dl className={styles.lista}>
              <dt>Serviço</dt>
              <dd>{saude.service}</dd>
              <dt>No ar há</dt>
              <dd>{saude.uptimeSeconds}s</dd>
            </dl>
          </>
        ) : (
          <p className={styles.falhou}>
            A API não respondeu. Rode <code>make logs-api</code> para
            investigar.
          </p>
        )}
      </section>
    </main>
  );
}
