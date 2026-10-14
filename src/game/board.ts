export type BoardLayout = {
  rows: number;
  width: number;
  height: number; // 캔버스(핀 영역) 높이
  gap: number; // 핀 간격
  pegRadius: number;
  ballRadius: number;
  binHeight: number;
  binFontSize: number;
  // 칸이 좁아 칸 안에 점수를 못 쓸 때 칸 아래에 눈금 숫자를 몇 칸마다 표시할지 (0이면 칸 안에 표시)
  labelEvery: number;
  pegs: { x: number; y: number; row: number; index: number }[];
};

// 핀 영역 위·아래 여백 (핀 간격 배수)
const TOP_PAD = 1.2;
const BOTTOM_PAD = 0.8;
const LABEL_ROW_HEIGHT = 16;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const binHeightFor = (gap: number) => clamp(gap * 1.3, 24, 48);

// 사용 가능한 영역에 맞춰 핀 간격을 정한다.
// 마지막 줄은 rows + 2개의 핀, 그 사이에 rows + 1개의 칸이 놓인다.
export function computeLayout(maxWidth: number, maxHeight: number, rows: number): BoardLayout {
  const rowsSpan = rows - 1 + TOP_PAD + BOTTOM_PAD;
  // 점수판 높이도 핀 간격에 비례(1.3배)한다고 보고 먼저 계산한 뒤, 최소/최대 높이로 잘렸으면 다시 맞춘다
  let gap = Math.min(maxWidth / (rows + 2), maxHeight / (rowsSpan + 1.3));
  const labelRow = labelInterval(gap) > 0 ? LABEL_ROW_HEIGHT : 0;
  gap = Math.max(4, Math.min(gap, (maxHeight - binHeightFor(gap) - labelRow) / rowsSpan));

  const width = gap * (rows + 2);
  const height = gap * rowsSpan;
  const binHeight = binHeightFor(gap);
  const binFontSize = clamp(gap * 0.5, 10, 20);
  const pegRadius = Math.max(2, gap * 0.16);
  const ballRadius = Math.max(3, gap * 0.26); // 줄이 많아 칸이 좁아도 공이 핀보다 잘 보이도록

  const pegs: BoardLayout['pegs'] = [];
  for (let r = 0; r < rows; r++) {
    const count = r + 3;
    for (let j = 0; j < count; j++) {
      pegs.push({ ...pegPosition({ width, gap }, r, j), row: r, index: j });
    }
  }

  return { rows, width, height, gap, pegRadius, ballRadius, binHeight, binFontSize, labelEvery: labelInterval(gap), pegs };
}

// 칸 너비가 충분하면 칸 안에, 아니면 눈금 숫자끼리 겹치지 않도록 1·2·5·10칸 간격으로 표시
function labelInterval(gap: number) {
  if (gap >= 16) return 0;
  return [1, 2, 5, 10].find((n) => n * gap >= 22) ?? 10;
}

export function pegPosition(layout: Pick<BoardLayout, 'width' | 'gap'>, row: number, index: number) {
  const { width, gap } = layout;
  return {
    x: width / 2 + (index - (row + 2) / 2) * gap,
    y: gap * TOP_PAD + row * gap,
  };
}

export function binCenterX(layout: BoardLayout, bin: number) {
  return layout.width / 2 + (bin - layout.rows / 2) * layout.gap;
}
