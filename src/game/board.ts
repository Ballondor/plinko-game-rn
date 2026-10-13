export type BoardLayout = {
  rows: number;
  width: number;
  height: number; // 캔버스(핀 영역) 높이
  gap: number; // 핀 간격
  pegRadius: number;
  ballRadius: number;
  binHeight: number;
  pegs: { x: number; y: number; row: number; index: number }[];
};

// 사용 가능한 영역에 맞춰 핀 간격을 정한다.
// 마지막 줄은 rows + 2개의 핀, 그 사이에 rows + 1개의 칸이 놓인다.
export function computeLayout(maxWidth: number, maxHeight: number, rows: number): BoardLayout {
  const binHeight = 28;
  const gap = Math.max(4, Math.min(maxWidth / (rows + 2), (maxHeight - binHeight - 8) / (rows + 1.4)));
  const width = gap * (rows + 2);
  const height = gap * (rows + 1.4);
  const pegRadius = Math.max(2, gap * 0.11);
  const ballRadius = gap * 0.24;

  const pegs: BoardLayout['pegs'] = [];
  for (let r = 0; r < rows; r++) {
    const count = r + 3;
    for (let j = 0; j < count; j++) {
      pegs.push({ ...pegPosition({ width, gap }, r, j), row: r, index: j });
    }
  }

  return { rows, width, height, gap, pegRadius, ballRadius, binHeight, pegs };
}

export function pegPosition(layout: Pick<BoardLayout, 'width' | 'gap'>, row: number, index: number) {
  const { width, gap } = layout;
  return {
    x: width / 2 + (index - (row + 2) / 2) * gap,
    y: gap * 1.5 + row * gap,
  };
}

export function binCenterX(layout: BoardLayout, bin: number) {
  return layout.width / 2 + (bin - layout.rows / 2) * layout.gap;
}
