import { useCallback, useEffect, useRef, useState } from 'react';
import { BoardLayout } from './board';
import { createTrajectory, Trajectory } from './trajectory';

export type Ball = {
  id: number;
  bet: number;
  multiplier: number;
  trajectory: Trajectory;
  startedAt: number; // ms
};

export type LandedBall = Ball & { payout: number };

const now = () => performance.now();

// 공 생성과 프레임 루프를 관리한다. 공이 칸에 닿으면 onLand가 호출된다.
export function usePlinko(layout: BoardLayout | null, onLand: (ball: LandedBall) => void) {
  const ballsRef = useRef<Ball[]>([]);
  const nextId = useRef(1);
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

  const [frameTime, setFrameTime] = useState(now);
  const [running, setRunning] = useState(false);

  const drop = useCallback(
    (bet: number, multipliers: number[]) => {
      if (!layout) return;
      const trajectory = createTrajectory(layout);
      ballsRef.current.push({
        id: nextId.current++,
        bet,
        multiplier: multipliers[trajectory.bin],
        trajectory,
        startedAt: now(),
      });
      setRunning(true);
    },
    [layout],
  );

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      const t = now();
      const landed: Ball[] = [];
      ballsRef.current = ballsRef.current.filter((b) => {
        const done = (t - b.startedAt) / 1000 >= b.trajectory.totalDuration;
        if (done) landed.push(b);
        return !done;
      });
      landed.forEach((b) => onLandRef.current({ ...b, payout: round2(b.bet * b.multiplier) }));
      setFrameTime(t);
      if (ballsRef.current.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return { balls: ballsRef.current, frameTime, drop, inFlight: running };
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
