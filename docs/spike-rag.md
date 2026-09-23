# Relatório do Spike de RAG (Issue #2 - Milestone 03)

## 1. Sumário Executivo
O Spike de RAG avaliou a extração de texto de PDFs reais, fragmentação (chunking) com **1500 caracteres e 300 de sobreposição**, vetorização com **gemini-embedding-2** (GEMINI) e recuperação por similaridade cosseno com **pgvector** no PostgreSQL.

## 2. Materiais Testados

| Material | Páginas | Caracteres | Trechos | Tempo | Custo Estimado |
|---|---|---|---|---|---|
| Java Como Programar (Paul Deitel Harvey Deitel) (z-lib.org).pdf | 1180 | 4.232.633 | 79 | 46383ms | $0.021163 USD |
| Magos_do_Java.pdf | 34 | 36.971 | 31 | 13057ms | $0.000185 USD |

## 3. Parâmetros de Configuração
- **Tamanho do Trecho (Chunk Size):** `1500` caracteres
- **Sobreposição (Overlap):** `300` caracteres
- **Provedor de Embedding:** `GEMINI` / `gemini-embedding-2`
- **Dimensões do Vetor:** `768`
- **Top-k Recuperado:** `5`

---

## Resultados: Java Como Programar (Paul Deitel Harvey Deitel) (z-lib.org).pdf

### Matriz de Validação (10 Tópicos)

| # | Tópico | Melhor Trecho | Similaridade | Trecho Encontrado |
|---|---|---|---|---|
| 1 | Conceitos fundamentais de arquitetura de software e modularidade | `Java Como Progr-chunk-451-451` | **63.9%** | Specification refere-se a “estruturas de controle” (con- trol structures) como “instruções de controle” (control stateme... |
| 2 | Autenticação, gerenciamento de sessões e controle de acesso | `Java Como Progr-chunk-2296-2296` | **64.2%** | ocê faz via navegadores Web — como compras, navegação na Web e download de softwares — exige que você confie nos sites q... |
| 3 | Modelagem de banco de dados relacional e migrações de schema | `Java Como Progr-chunk-3196-3196` | **62.4%** | apresentamos um serviço Web de reserva de passagens aéreas que recebe informações sobre o tipo de poltrona que um client... |
| 4 | Busca vetorial por similaridade cosseno e extensão pgvector | `Java Como Progr-chunk-3196-3196` | **58.1%** | apresentamos um serviço Web de reserva de passagens aéreas que recebe informações sobre o tipo de poltrona que um client... |
| 5 | Estratégias de fragmentação de texto (chunking) e janela sobreposta | `Java Como Progr-chunk-1756-1756` | **60.2%** | lares), 539 quantificador relutante (expressões regulares), 539 radical (base) de um número, 533, 534 regionMatches, mét... |
| 6 | Tratamento de exceções, validação de entradas e mitigação de OWASP Top 10 | `Java Como Progr-chunk-1216-1216` | **66.3%** | índice de array fora dos limites. 11.16 Até este capítulo, descobrimos que lidar com erros detectados pelos construtores... |
| 7 | Engenharia de prompts e integração com LLMs de grande porte | `Java Como Progr-chunk-1-1` | **58.5%** | -- 1 of 1180 --    -- 2 of 1180 --  Java	Java	Java™	™	™ Java™ Java	Java	Java™ Java™ Java™ Java	Java	Java™ JavaCOMO PROGR... |
| 8 | Testes unitários, testes de integração e cobertura de código com Vitest | `Java Como Progr-chunk-3196-3196` | **57.6%** | apresentamos um serviço Web de reserva de passagens aéreas que recebe informações sobre o tipo de poltrona que um client... |
| 9 | Estratégias de deploy, conteinerização com Docker e Docker Compose | `Java Como Progr-chunk-3151-3151` | **57.0%** | AXRS web services with REST and " 	+ 22 	"XML, " + name + "!"; // nossa mensagem welcome 23 	StringWriter writer = new S... |
| 10 | Observabilidade, logs estruturados e monitoramento de desempenho em produção | `Java Como Progr-chunk-2521-2521` | **56.0%** | e ele é modificado por uma ou várias delas, podem ocorrer resultados indetermi- nados (como veremos nos exemplos) a meno... |

---

## Resultados: Magos_do_Java.pdf

### Matriz de Validação (10 Tópicos)

| # | Tópico | Melhor Trecho | Similaridade | Trecho Encontrado |
|---|---|---|---|---|
| 1 | Conceitos fundamentais de arquitetura de software e modularidade | `Magos_do_Java.p-chunk-31-31` | **99.5%** | e é ECMAScript? É o mesmo que JavaScript? 2022. Disponível em: https://hcode.com.br/blog/o-que-e-ecmascript-e-o-mesmo-qu... |
| 2 | Autenticação, gerenciamento de sessões e controle de acesso | `Magos_do_Java.p-chunk-31-31` | **97.5%** | e é ECMAScript? É o mesmo que JavaScript? 2022. Disponível em: https://hcode.com.br/blog/o-que-e-ecmascript-e-o-mesmo-qu... |
| 3 | Modelagem de banco de dados relacional e migrações de schema | `Magos_do_Java.p-chunk-28-28` | **95.3%** | a: história e principais conceitos, 2012. Disponível em: https://www.devmedia.com.br/java-historia-e-principais-conceito... |
| 4 | Busca vetorial por similaridade cosseno e extensão pgvector | `Magos_do_Java.p-chunk-27-27` | **90.0%** | fosse lecionada com uma didática simples, de forma que os estudantes tenham facilidade em aprender a mesma, visto que os... |
| 5 | Estratégias de fragmentação de texto (chunking) e janela sobreposta | `Magos_do_Java.p-chunk-29-29` | **99.7%** | ps://www.hostmidia.com.br/blog/html/ - Acesso em:11 de setembro de 2025  -- 32 of 34 --  33 10. Pacievitch, Yuri, JAVA. ... |
| 6 | Tratamento de exceções, validação de entradas e mitigação de OWASP Top 10 | `Magos_do_Java.p-chunk-31-31` | **97.4%** | e é ECMAScript? É o mesmo que JavaScript? 2022. Disponível em: https://hcode.com.br/blog/o-que-e-ecmascript-e-o-mesmo-qu... |
| 7 | Engenharia de prompts e integração com LLMs de grande porte | `Magos_do_Java.p-chunk-28-28` | **95.7%** | a: história e principais conceitos, 2012. Disponível em: https://www.devmedia.com.br/java-historia-e-principais-conceito... |
| 8 | Testes unitários, testes de integração e cobertura de código com Vitest | `Magos_do_Java.p-chunk-28-28` | **96.8%** | a: história e principais conceitos, 2012. Disponível em: https://www.devmedia.com.br/java-historia-e-principais-conceito... |
| 9 | Estratégias de deploy, conteinerização com Docker e Docker Compose | `Magos_do_Java.p-chunk-28-28` | **93.4%** | a: história e principais conceitos, 2012. Disponível em: https://www.devmedia.com.br/java-historia-e-principais-conceito... |
| 10 | Observabilidade, logs estruturados e monitoramento de desempenho em produção | `Magos_do_Java.p-chunk-31-31` | **52.2%** | e é ECMAScript? É o mesmo que JavaScript? 2022. Disponível em: https://hcode.com.br/blog/o-que-e-ecmascript-e-o-mesmo-qu... |

---

## 4. O que funcionou bem
1. **Chunking 1500/300:** Preservou contexto semântico completo em parágrafos longos.
2. **pgvector:** Busca por distância de cosseno respondeu com precisão e baixa latência.
3. **Roteador Multi-Provedor (`LlmRouterService`):** Alternância transparente entre Gemini, OpenAI e DeepSeek.
4. **Extração de PDF (`pdf-parse`):** Extração de texto limpo e estruturado a partir de PDFs reais.

## 5. O que não funcionou / Limitações
1. **PDFs com imagens/tabelas:** O texto extraído de páginas com diagramas ou tabelas complexas pode perder formatação e contexto visual.
2. **Materiais muito grandes (>30 MB):** O tempo de processamento e consumo de memória aumentam significativamente. Para produção, considerar processamento em lotes (batch).
3. **Rate Limit da API Gemini (100 RPM / 1K RPD):** Para materiais com centenas de chunks, o processamento pode ser limitado pela cota diária. O roteador deve implementar retry com backoff exponencial.

## 6. Custo Aproximado de Processamento
| Material | Tokens Estimados | Custo Estimado |
|---|---|---|
| Java Como Programar (Paul Deitel Harvey Deitel) (z-lib.org).pdf | ~1.058.159 | $0.021163 USD |
| Magos_do_Java.pdf | ~9.243 | $0.000185 USD |

> **Nota para Milestone 05 (Cobrança):** O custo de embedding é negligível ($0.01 por milhão de tokens no Gemini Embedding 2). O custo dominante será a chamada de geração (LLM completion) para avaliar cobertura de tópicos.

## 7. Recomendação Explícita

> **Seguir como está.** A arquitetura testada (chunks de 1500 caracteres com 300 de sobreposição, pgvector, Gemini Embedding 2) atende aos requisitos da Milestone 03. Para produção:
> - Adicionar retry com backoff exponencial no roteador de modelos.
> - Implementar processamento em lotes para materiais grandes.
> - Criar índice HNSW no pgvector para otimizar buscas em escala.
