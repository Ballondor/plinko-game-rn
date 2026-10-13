import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, LayoutChangeEvent, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Controls } from './src/components/Controls';
import { PlinkoBoard } from './src/components/PlinkoBoard';
import { computeLayout } from './src/game/board';
import { binColor, formatMultiplier, getMultipliers, Risk } from './src/game/multipliers';
import { LandedBall, round2, usePlinko } from './src/game/usePlinko';

const START_BALANCE = 1000;
const AUTO_INTERVAL_MS = 350;
const HISTORY_SIZE = 6;

type HistoryItem = { id: number; label: string; color: string };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Game />
    </SafeAreaProvider>
  );
}

function Game() {
  const [balance, setBalance] = useState(START_BALANCE);
  const [betText, setBetText] = useState('10');
  const [risk, setRisk] = useState<Risk>('medium');
  const [rows, setRows] = useState(12);
  const [autoOn, setAutoOn] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [binHits, setBinHits] = useState<number[]>([]);
  const [boardArea, setBoardArea] = useState<{ width: number; height: number } | null>(null);

  const multipliers = useMemo(() => getMultipliers(rows, risk), [rows, risk]);
  const layout = useMemo(
    () => (boardArea ? computeLayout(boardArea.width, boardArea.height, rows) : null),
    [boardArea, rows],
  );

  const bet = parseBet(betText);

  const handleLand = useCallback((ball: LandedBall) => {
    const bin = ball.trajectory.bin;
    const binCount = ball.trajectory.segments.length; // rows + 1
    setBalance((b) => round2(b + ball.payout));
    setBinHits((hits) => {
      const next = [...hits];
      next[bin] = (next[bin] ?? 0) + 1;
      return next;
    });
    setHistory((h) =>
      [{ id: ball.id, label: formatMultiplier(ball.multiplier), color: binColor(bin, binCount) }, ...h].slice(0, HISTORY_SIZE),
    );
    if (ball.multiplier >= 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const { balls, frameTime, drop, inFlight } = usePlinko(layout, handleLand);

  // 자동 모드 타이머에서 최신 상태를 읽기 위해 ref 사용
  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const dropOnce = useCallback(() => {
    if (!layout || bet <= 0 || bet > balanceRef.current) return false;
    balanceRef.current = round2(balanceRef.current - bet);
    setBalance(balanceRef.current);
    drop(bet, multipliers);
    return true;
  }, [layout, bet, multipliers, drop]);

  const dropRef = useRef(dropOnce);
  dropRef.current = dropOnce;

  useEffect(() => {
    if (!autoOn) return;
    dropRef.current();
    const id = setInterval(() => {
      if (!dropRef.current()) setAutoOn(false);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoOn]);

  const changeRows = (next: number) => {
    setRows(next);
    setBinHits([]);
  };

  const onBoardAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoardArea((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const broke = balance < 0.01 && !inFlight;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>PLINKO</Text>
          <View style={styles.balance}>
            <Text style={styles.balanceLabel}>잔액</Text>
            <Text style={styles.balanceValue}>{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <View style={styles.history}>
          {history.map((h) => (
            <View key={h.id} style={[styles.historyPill, { backgroundColor: h.color }]}>
              <Text style={styles.historyText}>{h.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.boardArea} onLayout={onBoardAreaLayout}>
          {layout && (
            <PlinkoBoard layout={layout} multipliers={multipliers} balls={balls} frameTime={frameTime} binHits={binHits} />
          )}
        </View>

        {broke ? (
          <Pressable style={styles.refill} onPress={() => setBalance(START_BALANCE)}>
            <Text style={styles.refillText}>잔액 다시 채우기</Text>
          </Pressable>
        ) : (
          <Controls
            betText={betText}
            onBetTextChange={setBetText}
            onHalveBet={() => setBetText(String(Math.max(0.01, round2(bet / 2))))}
            onDoubleBet={() => setBetText(String(Math.min(balance, round2(bet * 2)) || bet))}
            risk={risk}
            onRiskChange={setRisk}
            rows={rows}
            onRowsChange={changeRows}
            settingsLocked={inFlight || autoOn}
            canDrop={bet > 0 && bet <= balance}
            onDrop={dropOnce}
            autoOn={autoOn}
            onToggleAuto={() => setAutoOn((v) => !v)}
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

function parseBet(text: string) {
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) ? round2(n) : 0;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f1923',
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  balance: {
    backgroundColor: '#1e2a3a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: '#8b9cb3',
    fontSize: 11,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  history: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    height: 24,
  },
  historyPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  historyText: {
    color: '#1a1a2e',
    fontSize: 11,
    fontWeight: '800',
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  refill: {
    backgroundColor: '#00e701',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  refillText: {
    color: '#05310a',
    fontSize: 16,
    fontWeight: '800',
  },
});
