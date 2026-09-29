import styles from './PainelApresentacao.module.css';

const beneficios = [
  { icon: 'map', text: 'Mapa do que seu material cobre, e do que falta' },
  { icon: 'calendar', text: 'Roadmap semana a semana até a data da prova' },
  { icon: 'cards', text: 'Flashcards dos tópicos que mais caem' },
];

function BeneficioIcon({ tipo }: { tipo: string }) {
  if (tipo === 'calendar') {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true">
        <rect x="2.25" y="3.75" width="13.5" height="12" rx="1.5" />
        <path d="M5.5 2.25v3M12.5 2.25v3M2.5 7.25h13" />
      </svg>
    );
  }

  if (tipo === 'cards') {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true">
        <rect x="4.25" y="2.25" width="9.5" height="13.5" rx="1.25" />
        <path d="M6.5 5.5h5M6.5 8.5h5M6.5 11.5h3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="m2.25 4.25 4.5-2 4.5 2 4.5-2v11.5l-4.5 2-4.5-2-4.5 2z" />
      <path d="M6.75 2.25v11.5M11.25 4.25v11.5" />
    </svg>
  );
}

export function PainelApresentacao() {
  return (
    <section className={styles.panel} aria-label="Sobre o Your Journey">
      <p className={styles.brand}>Your Journey</p>
      <div className={styles.message}>
        <h1>
          Seu material.
          <br />
          Seu plano.
          <br />
          Sua prova.
        </h1>
        <p>
          Envie suas apostilas e provas antigas. A gente devolve o que estudar
          em cada dia até a data da prova.
        </p>
        <ul>
          {beneficios.map((beneficio) => (
            <li key={beneficio.text}>
              <span className={styles.icon} aria-hidden="true">
                <BeneficioIcon tipo={beneficio.icon} />
              </span>
              <span>{beneficio.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.footer}>
        Para quem estuda para o ENEM e para concurso público.
      </p>
    </section>
  );
}
