import { BlurMask, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { memo, useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BoardLayout, pegPosition } from '../game/board';
import { scoreTone } from '../game/scores';
import { positionAt, segmentAt } from '../game/trajectory';
import { Ball } from '../game/usePlinko';
import { font, palette } from '../theme';

const FLASH_TIME = 0.18;
const TICK_WIDTH = 28;

type Props = {
  layout: BoardLayout;
  scores: number[];
  balls: Ball[];
  frameTime: number;
  binHits: number[];
};

export function PlinkoBoard({ layout, scores, balls, frameTime, binHits }: Props) {
  const { width, height, ballRadius, pegRadius } = layout;

  return (
    <View style={{ width }}>
      <Canvas style={{ width, height }}>
        <PegLayer layout={layout} />
        {balls.map((ball) => {
          const elapsed = (frameTime - ball.startedAt) / 1000;
          const seg = segmentAt(ball.trajectory, elapsed);
          if (!seg.peg) return null;
          const p = (elapsed - seg.t0) / FLASH_TIME;
          if (p < 0 || p > 1) return null;
          const peg = pegPosition(layout, seg.peg.row, seg.peg.index);
          return (
            <Circle
              key={`f${ball.id}`}
              cx={peg.x}
              cy={peg.y}
              r={pegRadius * (1 + 2.5 * p)}
              color={palette.white}
              opacity={0.6 * (1 - p)}
            />
          );
        })}
        {balls.map((ball) => {
          const { x, y } = positionAt(ball.trajectory, (frameTime - ball.startedAt) / 1000);
          return (
            <Group key={ball.id}>
              {/* 은은한 발광 */}
              <Circle cx={x} cy={y} r={ballRadius * 1.9} color={palette.primary} opacity={0.45}>
                <BlurMask blur={ballRadius * 1.2} style="normal" />
              </Circle>
              <Circle cx={x} cy={y} r={ballRadius}>
                <RadialGradient
                  c={vec(x - ballRadius * 0.35, y - ballRadius * 0.35)}
                  r={ballRadius * 1.4}
                  colors={[palette.white, palette.primary]}
                />
              </Circle>
            </Group>
          );
        })}
      </Canvas>
      <View style={[styles.bins, { paddingHorizontal: layout.gap / 2, height: layout.binHeight }]}>
        {scores.map((score, i) => (
          <Bin
            key={i}
            label={layout.labelEvery === 0 ? `${score}` : ''}
            tone={scoreTone(score, scores.length - 1)}
            width={layout.gap}
            fontSize={layout.binFontSize}
            hits={binHits[i] ?? 0}
          />
        ))}
      </View>
      {layout.labelEvery > 0 && (
        <View style={styles.tickRow}>
          {scores
            .filter((score) => score % layout.labelEvery === 0 || score === scores.length - 1)
            .map((score) => (
              <Text key={score} style={[styles.tick, { left: layout.gap * (score + 1) - TICK_WIDTH / 2 }]}>
                {score}
              </Text>
            ))}
        </View>
      )}
    </View>
  );
}

// 핀: 펠트 위에 살짝 그림자를 드리운 흰 핀
const PegLayer = memo(function PegLayer({ layout }: { layout: BoardLayout }) {
  const r = layout.pegRadius;
  const shadow = Math.max(0.8, r * 0.35);
  return (
    <Group>
      <Group color="rgba(0, 0, 0, 0.45)">
        {layout.pegs.map((p) => (
          <Circle key={`s${p.row}-${p.index}`} cx={p.x + shadow * 0.4} cy={p.y + shadow} r={r} />
        ))}
      </Group>
      {layout.pegs.map((p) => (
        <Circle key={`${p.row}-${p.index}`} cx={p.x} cy={p.y} r={r}>
          <RadialGradient c={vec(p.x - r * 0.35, p.y - r * 0.35)} r={r * 1.6} colors={[palette.white, 'rgba(255, 255, 255, 0.7)']} />
        </Circle>
      ))}
    </Group>
  );
});

type BinProps = { label: string; tone: { bg: string; fg: string }; width: number; fontSize: number; hits: number };

function Bin({ label, tone, width, fontSize, hits }: BinProps) {
  const [offset] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (hits === 0) return;
    offset.setValue(0);
    Animated.sequence([
      Animated.timing(offset, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.spring(offset, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [hits, offset]);

  const translateY = offset.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });

  return (
    <Animated.View style={{ width, paddingHorizontal: width < 10 ? 0.5 : 1, transform: [{ translateY }] }}>
      <View style={[styles.bin, { borderTopColor: tone.bg }]}>
        {/* 공이 들어오면 포켓이 칸 색으로 잠깐 빛난다 */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: tone.bg, opacity: offset.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]} />
        <Text style={[styles.binText, { color: tone.bg, fontSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bins: {
    flexDirection: 'row',
  },
  tickRow: {
    height: 16,
  },
  tick: {
    position: 'absolute',
    top: 2,
    width: TICK_WIDTH,
    textAlign: 'center',
    color: palette.blush,
    fontFamily: font.mono,
    fontSize: 10,
  },
  bin: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  binText: {
    fontFamily: font.mono,
    fontWeight: '700',
    fontSize: 10,
  },
});
