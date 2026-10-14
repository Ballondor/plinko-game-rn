import { Canvas, RadialGradient, Rect, RoundedRect, vec } from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { palette, radius } from '../theme';

const PRINT_INSET = 8; // 펠트에 인쇄된 안쪽 라인 위치

// 카지노 테이블 펠트: 크림슨 바탕 + 가장자리로 갈수록 어두워지는 조명 + 인쇄 라인
export const TableFelt = memo(function TableFelt({ width, height }: { width: number; height: number }) {
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height} color={palette.crimson} />
      <Rect x={0} y={0} width={width} height={height}>
        <RadialGradient
          c={vec(width / 2, height * 0.42)}
          r={Math.max(width, height) * 0.75}
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.55)']}
        />
      </Rect>
      <RoundedRect
        x={PRINT_INSET}
        y={PRINT_INSET}
        width={width - PRINT_INSET * 2}
        height={height - PRINT_INSET * 2}
        r={radius.lg}
        color="rgba(255, 179, 179, 0.28)"
        style="stroke"
        strokeWidth={1}
      />
    </Canvas>
  );
});
