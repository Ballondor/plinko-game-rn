import { Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BoardLayout, pegPosition } from '../game/board';
import { binColor, formatMultiplier } from '../game/multipliers';
import { positionAt, segmentAt } from '../game/trajectory';
import { Ball } from '../game/usePlinko';

const FLASH_TIME = 0.18;

type Props = {
  layout: BoardLayout;
  multipliers: number[];
  balls: Ball[];
  frameTime: number;
  binHits: number[];
};

export function PlinkoBoard({ layout, multipliers, balls, frameTime, binHits }: Props) {
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
              color="#ffffff"
              opacity={0.5 * (1 - p)}
            />
          );
        })}
        {balls.map((ball) => {
          const { x, y } = positionAt(ball.trajectory, (frameTime - ball.startedAt) / 1000);
          return (
            <Circle key={ball.id} cx={x} cy={y} r={ballRadius}>
              <RadialGradient c={vec(x - ballRadius * 0.3, y - ballRadius * 0.3)} r={ballRadius * 1.3} colors={['#ff8fab', '#ff1f5a']} />
            </Circle>
          );
        })}
      </Canvas>
      <View style={[styles.bins, { paddingHorizontal: layout.gap / 2, height: layout.binHeight }]}>
        {multipliers.map((m, i) => (
          <Bin key={i} label={formatMultiplier(m)} color={binColor(i, multipliers.length)} width={layout.gap} hits={binHits[i] ?? 0} />
        ))}
      </View>
    </View>
  );
}

const PegLayer = memo(function PegLayer({ layout }: { layout: BoardLayout }) {
  return (
    <Group>
      {layout.pegs.map((p) => (
        <Circle key={`${p.row}-${p.index}`} cx={p.x} cy={p.y} r={layout.pegRadius} color="#e6ecf5" />
      ))}
    </Group>
  );
});

function Bin({ label, color, width, hits }: { label: string; color: string; width: number; hits: number }) {
  const offset = useRef(new Animated.Value(0)).current;

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
    <Animated.View style={{ width, paddingHorizontal: 1, transform: [{ translateY }] }}>
      <View style={[styles.bin, { backgroundColor: color, borderBottomColor: shade(color) }]}>
        <Text style={styles.binText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

// rgb(r, g, b) → 아래 테두리용으로 어둡게
function shade(rgb: string) {
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
  return `rgb(${Math.round(r * 0.6)}, ${Math.round(g * 0.6)}, ${Math.round(b * 0.6)})`;
}

const styles = StyleSheet.create({
  bins: {
    flexDirection: 'row',
  },
  bin: {
    flex: 1,
    borderRadius: 4,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  binText: {
    color: '#1a1a2e',
    fontWeight: '800',
    fontSize: 10,
  },
});
