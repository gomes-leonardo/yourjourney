/**
 * O formato exato que sai da API.
 *
 * Num MVC clássico a View é a tela. Nesta API não exists tela: a tela é o
 * front-end em Next.js, que é outra aplicação. O papel mais próximo de View
 * aqui é o DTO de saída, porque é ele que decide o que o cliente enxerga.
 */
export class HealthResponseDto {
  status: 'ok';
  service: string;
  uptimeSeconds: number;
  timestamp: string;
}
