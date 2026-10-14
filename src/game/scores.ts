import { palette } from '../theme';

// 도착 칸 점수는 왼쪽부터 0, 1, …, maxScore. 줄 수는 maxScore와 같다.
export const MIN_MAX_SCORE = 1;
export const MAX_MAX_SCORE = 50;

export function getScores(maxScore: number): number[] {
  return Array.from({ length: maxScore + 1 }, (_, i) => i);
}

// 입력값이 범위 안의 정수일 때만 반환한다.
export function parseMaxScore(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const n = Number(text);
  return n >= MIN_MAX_SCORE && n <= MAX_MAX_SCORE ? n : null;
}

// 점수 구간별 칸 색 (팔레트 원색만 사용): 하위 1/3 블러시, 중간 화이트, 상위 1/3 프라이머리. 글자는 모두 검정.
export function scoreTone(score: number, maxScore: number): { bg: string; fg: string } {
  const t = maxScore === 0 ? 0 : score / maxScore;
  const bg = t >= 2 / 3 ? palette.primary : t >= 1 / 3 ? palette.white : palette.blush;
  return { bg, fg: palette.black };
}
