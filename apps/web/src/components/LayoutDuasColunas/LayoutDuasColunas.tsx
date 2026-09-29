import type { ReactNode } from 'react';
import styles from './LayoutDuasColunas.module.css';

export function LayoutDuasColunas({
  painel,
  children,
}: {
  painel: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={styles.layout}>
      {painel}
      <section className={styles.content}>{children}</section>
    </main>
  );
}
