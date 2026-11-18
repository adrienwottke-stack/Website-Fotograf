// Blocksatz-Reihen für Galerien (R4, Sandro 18.11.): Jede Reihe füllt die
// volle Breite von Rand zu Rand. Nur eine einzelne letzte Vorschau darf links
// stehen bleiben und rechts Platz lassen. Die Reihenfolge bleibt erhalten,
// neue Bilder ordnen sich automatisch ein.
//
// Eine Reihe ist so hoch wie Breite / Summe der Seitenverhältnisse. `target` ist
// die gewünschte Summe pro Reihe (bei 1080 px Breite: 2.6 ≈ 415 px Höhe). Die
// Aufteilung minimiert die Abweichung aller Reihen von dieser Höhe.

export type JustifiedRow<T> = {
  items: T[];
  ratio: number;
  // 'full': volle Breite. 'loose': einzelne letzte Vorschau links in Zielhöhe.
  // 'capped': zu wenige Elemente für volle Breite (z. B. zwei Hochformat-Filme),
  // daher in begrenzter Höhe mittig.
  fit: 'full' | 'loose' | 'capped';
  width: number; // Anteil der Galeriebreite in Prozent (ohne Lücken gerechnet)
};

export function justifyRows<T>(
  items: T[],
  ratioOf: (item: T) => number,
  { target = 2.6, maxPerRow = 5, minFill = 0.55 } = {},
): JustifiedRow<T>[] {
  const n = items.length;
  if (!n) return [];
  const ratios = items.map(ratioOf);
  const best: number[] = Array(n + 1).fill(Infinity);
  const from: number[] = Array(n + 1).fill(0);
  const looseEnd: boolean[] = Array(n + 1).fill(false);
  best[0] = 0;
  for (let end = 1; end <= n; end++) {
    let sum = 0;
    for (let start = end - 1; start >= 0 && end - start <= maxPerRow; start--) {
      sum += ratios[start];
      let cost = Math.log(sum / target) ** 2;
      let loose = false;
      // Eine einzelne letzte Vorschau darf links stehen, statt die Reihe zu sprengen.
      if (end === n && end - start === 1 && sum < target) {
        const looseCost = 0.2;
        if (looseCost < cost) { cost = looseCost; loose = true; }
      }
      if (best[start] + cost < best[end]) {
        best[end] = best[start] + cost;
        from[end] = start;
        looseEnd[end] = loose;
      }
    }
  }
  const rows: JustifiedRow<T>[] = [];
  for (let end = n; end > 0; end = from[end]) {
    const start = from[end];
    const ratio = ratios.slice(start, end).reduce((a, b) => a + b, 0);
    const loose = end === n && looseEnd[end];
    const capped = !loose && ratio < target * minFill;
    // Lose: gleiche Höhe wie eine normale Reihe. Begrenzt: höchstens 1,3-fache Reihenhöhe.
    const width = loose ? Math.min(100, (100 * ratio) / target) : capped ? Math.min(100, (130 * ratio) / target) : 100;
    rows.unshift({ items: items.slice(start, end), ratio, fit: loose ? 'loose' : capped ? 'capped' : 'full', width });
  }
  return rows;
}
