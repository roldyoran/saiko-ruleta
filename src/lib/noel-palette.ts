// Paleta caramelo — la ruleta alterna rojo/crema en TODOS los modos
// (números y participantes). Única fuente para los hex que el canvas
// (spin-wheel) necesita. En CSS usa los tokens `@theme` (berry/cream…).
export const NOEL_CANDY_RED = "#d90429";
/** Etiqueta sobre crema: el mismo rojo vivido (4.66:1, AA). */
export const NOEL_CANDY_BERRY = "#d90429";
/** Etiqueta sobre rojo: marfil cálido. */
export const NOEL_LABEL_CREAM = "#f5f1e8";
/** Contorno de etiqueta: carbón cálido. */
export const NOEL_LABEL_STROKE = "#1c1917";
/** Línea divisoria entre segmentos: bronce. */
export const NOEL_LINE = "#3d2c10";

/** Fondos por índice: rojo, crema, rojo, crema… */
export const NOEL_CANDY_BG: string[] = [NOEL_CANDY_RED, NOEL_LABEL_CREAM];
/** Etiquetas a juego: crema sobre rojo, baya sobre crema. */
export const NOEL_CANDY_LABEL: string[] = [NOEL_LABEL_CREAM, NOEL_CANDY_BERRY];
