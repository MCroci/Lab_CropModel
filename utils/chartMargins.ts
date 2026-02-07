/**
 * Margini standard per i grafici Recharts.
 * Valori sufficienti per evitare il taglio di titoli assi (X/Y) e label.
 * - left: 55px per label Y ruotata (-90°)
 * - bottom: 40px per label X
 * - right: 55px per grafici con doppio asse Y
 */
export const CHART_MARGIN = {
  top: 20,
  right: 30,
  left: 55,
  bottom: 40
} as const;

/** Margini per grafici con doppio asse Y (più spazio a destra) */
export const CHART_MARGIN_DUAL_Y = {
  ...CHART_MARGIN,
  right: 55
} as const;
