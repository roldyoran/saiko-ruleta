// Paleta navideña "Medianoche" — única fuente de verdad para los colores
// que la librería de canvas (spin-wheel) necesita como valores hex.
// En CSS y plantillas usa siempre los tokens de `@theme` (gold/pine/berry…)
// en vez de estos valores: así el tema cambia en un solo lugar.

/** Etiqueta de segmentos: marfil cálido (luz de vela). */
export const NOEL_LABEL_CREAM = "#f5f1e8";
/** Contorno de etiqueta: carbón cálido. */
export const NOEL_LABEL_STROKE = "#1c1917";
/** Línea divisoria entre segmentos: bronce. */
export const NOEL_LINE = "#3d2c10";

/** Modo números: trío navideño (rojo/verde/dorado, 2 tonos cada uno). */
export const NOEL_NUMBER_DEFAULTS: string[] = [
  "#c1272d",
  "#0f7a3d",
  "#b45309",
  "#a31621",
  "#15803d",
  "#8a5a00",
];

/** Nuevos participantes: verdes, rojos, dorados y petróleo vivos. */
export const NOEL_SEGMENT_COLORS: string[] = [
  "#15803d",
  "#b91c1c",
  "#b45309",
  "#0e7490",
  "#dc2626",
  "#4d7c0f",
  "#166534",
  "#7f1d1d",
  "#92400e",
  "#155e75",
  "#713f12",
  "#065f46",
];

/** Fallback cuando la paleta se agota. */
export const NOEL_SEGMENT_FALLBACK = "#15803d";
