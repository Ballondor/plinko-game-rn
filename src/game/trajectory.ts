import { BoardLayout, binCenterX, pegPosition } from './board';

type Segment = {
  t0: number; // 세그먼트 시작 시각(초, 공 생성 기준)
  duration: number;
  x0: number;
  y0: number;
  x1: number;
  vy0: number;
  // 이 세그먼트 시작 시 부딪힌 핀 (첫 낙하 구간은 없음)
  peg?: { row: number; index: number };
};

export type Trajectory = {
  bin: number;
  gravity: number;
  segments: Segment[];
  totalDuration: number;
};

// 결과는 공정한 이항분포(각 줄에서 좌/우 50%)로 먼저 정하고,
// 그 경로를 따라 포물선으로 튕기는 애니메이션을 만든다.
export function createTrajectory(layout: BoardLayout, random: () => number = Math.random): Trajectory {
  const { rows, gap, pegRadius, ballRadius, width, height } = layout;
  const contactOffset = pegRadius + ballRadius;

  // 한 줄을 약 0.2초에 내려가도록 중력을 핀 간격에 비례해 정한다.
  const rowTime = 0.2;
  const bounce = gap * 0.3;
  const g = ((Math.sqrt(2 * bounce) + Math.sqrt(2 * bounce + 2 * gap)) / rowTime) ** 2;

  const durationFor = (vy0: number, dy: number) => (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * dy)) / g;

  const segments: Segment[] = [];
  let t = 0;
  let rights = 0;
  let x = width / 2 + (random() - 0.5) * gap * 0.15;
  let y = ballRadius;
  let vy0 = 0;
  let peg: Segment['peg'];

  for (let r = 0; r < rows; r++) {
    const target = pegPosition(layout, r, 1 + rights);
    const x1 = target.x + (random() - 0.5) * gap * 0.12;
    const y1 = target.y - contactOffset;
    const duration = durationFor(vy0, y1 - y);
    segments.push({ t0: t, duration, x0: x, y0: y, x1, vy0, peg });

    t += duration;
    x = x1;
    y = y1;
    peg = { row: r, index: 1 + rights };
    vy0 = -Math.sqrt(2 * g * bounce * (0.75 + random() * 0.5));
    if (random() < 0.5) rights++;
  }

  // 마지막 핀에서 칸으로 떨어지는 구간
  const bin = rights;
  const binX = binCenterX(layout, bin);
  const duration = durationFor(vy0, height - y);
  segments.push({ t0: t, duration, x0: x, y0: y, x1: binX, vy0, peg });
  t += duration;

  return { bin, gravity: g, segments, totalDuration: t };
}

export function positionAt(traj: Trajectory, elapsed: number) {
  const seg = segmentAt(traj, elapsed);
  const s = Math.min(Math.max(elapsed - seg.t0, 0), seg.duration);
  return {
    x: seg.x0 + ((seg.x1 - seg.x0) * s) / seg.duration,
    y: seg.y0 + seg.vy0 * s + 0.5 * traj.gravity * s * s,
  };
}

export function segmentAt(traj: Trajectory, elapsed: number): Segment {
  const { segments } = traj;
  for (let i = segments.length - 1; i >= 0; i--) {
    if (elapsed >= segments[i].t0) return segments[i];
  }
  return segments[0];
}
