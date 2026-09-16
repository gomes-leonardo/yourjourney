import styles from './page.module.css';

// Dentro do Docker o front roda em um conteiner e a API em outro. Para um
// conteiner falar com o outro, o endereco e o nome do servico no compose
// (http://api:8080), e nao localhost -- localhost, aqui dentro, seria o
// proprio conteiner do front. Rodando fora do Docker, o .env aponta para
// localhost e tudo continua funcionando.
const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:8080';

type Health = { status: string; service: string; uptimeSeconds: number };

async function buscarSaudeDaApi(): Promise<Health | null> {
  try {
    const resposta = await fetch(`${API_URL}/health`, { cache: 'no-store' });

    if (!resposta.ok) {
      return null;
    }

    return (await resposta.json()) as Health;
  } catch {
    // A API pode simplesmente nao estar de pe. Isso nao pode derrubar a pagina:
    // quem esta subindo o projeto pela primeira vez precisa ver o motivo na tela.
    return null;
  }
}

export default async function Home() {
  const saude = await buscarSaudeDaApi();

  return (
    <main className={styles.main}>
      <h1 className={styles.titulo}>Your Journey</h1>
      <p className={styles.subtitulo}>
        Estrutura inicial do projeto. Front-end no ar.
      </p>

      <section className={styles.cartao}>
        <h2 className={styles.cartaoTitulo}>API</h2>

        {saude ? (
          <>
            <p className={styles.ok}>Respondendo</p>
            <dl className={styles.lista}>
              <dt>Servico</dt>
              <dd>{saude.service}</dd>
              <dt>No ar ha</dt>
              <dd>{saude.uptimeSeconds}s</dd>
            </dl>
          </>
        ) : (
          <>
            <p className={styles.falhou}>Nao respondeu</p>
            <p className={styles.ajuda}>
              Tentamos <code>{API_URL}/health</code>. Rode{' '}
              <code>make logs-api</code> para ver o motivo.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
