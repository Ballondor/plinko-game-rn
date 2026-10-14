export type Result = { id: number; name: string; score: number; tone: { bg: string; fg: string } };
export type RankedResult = Result & { rank: number };

// 점수 내림차순으로 정렬해 순위를 매긴다. 동점이면 같은 순위(1, 1, 3…)이고 먼저 도착한 순서로 둔다.
export function rankResults(results: Result[]): RankedResult[] {
  const sorted = [...results].sort((a, b) => b.score - a.score || a.id - b.id);
  return sorted.map((r, i) => ({
    ...r,
    rank: i > 0 && sorted[i - 1].score === r.score ? sorted.findIndex((s) => s.score === r.score) + 1 : i + 1,
  }));
}
