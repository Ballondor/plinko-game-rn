export type Risk = 'low' | 'medium' | 'high';

export const MIN_ROWS = 8;
export const MAX_ROWS = 16;

// 가장자리 → 중앙 절반만 정의하고 좌우 대칭으로 펼친다.
const HALF_TABLE: Record<number, Record<Risk, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1, 0.5],
    medium: [13, 3, 1.3, 0.7, 0.4],
    high: [29, 4, 1.5, 0.3, 0.2],
  },
  9: {
    low: [5.6, 2, 1.6, 1, 0.7],
    medium: [18, 4, 1.7, 0.9, 0.5],
    high: [43, 7, 2, 0.6, 0.2],
  },
  10: {
    low: [8.9, 3, 1.4, 1.1, 1, 0.5],
    medium: [22, 5, 2, 1.4, 0.6, 0.4],
    high: [76, 10, 3, 0.9, 0.3, 0.2],
  },
  11: {
    low: [8.4, 3, 1.9, 1.3, 1, 0.7],
    medium: [24, 6, 3, 1.8, 0.7, 0.5],
    high: [120, 14, 5.2, 1.4, 0.4, 0.2],
  },
  12: {
    low: [10, 3, 1.6, 1.4, 1.1, 1, 0.5],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2],
  },
  13: {
    low: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7],
    medium: [43, 13, 6, 3, 1.3, 0.7, 0.4],
    high: [260, 37, 11, 4, 1, 0.2, 0.2],
  },
  14: {
    low: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5],
    medium: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2],
    high: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2],
  },
  15: {
    low: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7],
    medium: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3],
    high: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2],
  },
  16: {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2],
  },
};

export function getMultipliers(rows: number, risk: Risk): number[] {
  const half = HALF_TABLE[rows][risk];
  const binCount = rows + 1;
  const mirrored = [...half].reverse();
  // 칸 수가 홀수면 중앙 칸이 중복되지 않도록 하나 뺀다.
  return binCount % 2 === 1 ? [...half, ...mirrored.slice(1)] : [...half, ...mirrored];
}

export function formatMultiplier(m: number): string {
  return m >= 100 ? `${m}` : `${m}x`;
}

// 칸 위치(가장자리일수록 뜨거운 색)에 따른 색상
export function binColor(index: number, binCount: number): string {
  const center = (binCount - 1) / 2;
  const t = center === 0 ? 0 : Math.abs(index - center) / center; // 0 중앙 ~ 1 가장자리
  const from = [255, 192, 0]; // 노랑
  const to = [255, 0, 63]; // 빨강
  const c = from.map((v, i) => Math.round(v + (to[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
