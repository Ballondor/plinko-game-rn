import { useCallback, useEffect, useRef, useState } from 'react';
import { BoardLayout } from './board';
import { createTrajectory, Trajectory } from './trajectory';

export type Ball = {
  id: number;
  name: string;
  score: number;
  trajectory: Trajectory;
  startedAt: number; // ms
};

const now = () => performance.now();

// 공 생성과 프레임 루프를 관리한다. 공이 칸에 닿으면 onLand가 호출된다.
export function usePlinko(layout: BoardLayout | null, onLand: (ball: Ball) => void) {
  const ballsRef = useRef<Ball[]>([]);
  const nextId = useRef(1);
  const onLandRef = useRef(onLand);
  useEffect(() => {
    onLandRef.current = onLand;
  }, [onLand]);

  // 렌더링용 스냅샷. 루프는 ref를 갱신하고 매 프레임 스냅샷을 상태로 내보낸다.
  const [frame, setFrame] = useState<{ balls: Ball[]; time: number }>(() => ({ balls: [], time: now() }));
  const [running, setRunning] = useState(false);

  const drop = useCallback(
    (name: string, scores: number[]) => {
      if (!layout) return;
      const trajectory = createTrajectory(layout);
      ballsRef.current.push({
        id: nextId.current++,
        name,
        score: scores[trajectory.bin],
        trajectory,
        startedAt: now(),
      });
      setFrame({ balls: [...ballsRef.current], time: now() });
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
      landed.forEach((b) => onLandRef.current(b));
      setFrame({ balls: [...ballsRef.current], time: t });
      if (ballsRef.current.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // 떨어지는 중인 공을 모두 없앤다 (onLand는 호출되지 않음)
  const reset = useCallback(() => {
    ballsRef.current = [];
    setFrame({ balls: [], time: now() });
    setRunning(false);
  }, []);

  return { balls: frame.balls, frameTime: frame.time, drop, reset, inFlight: running };
}
