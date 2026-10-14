import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Controls } from './src/components/Controls';
import { PlinkoBoard } from './src/components/PlinkoBoard';
import { TableFelt } from './src/components/TableFelt';
import { computeLayout } from './src/game/board';
import { rankResults, Result } from './src/game/ranking';
import { getScores, MAX_MAX_SCORE, MIN_MAX_SCORE, parseMaxScore, scoreTone } from './src/game/scores';
import { Ball, usePlinko } from './src/game/usePlinko';
import { colors, font, palette, radius } from './src/theme';

const DEFAULT_MAX_SCORE = 10;
const TABLE_PADDING = 14; // 카지노 테이블(펠트) 안쪽 여백

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Game />
    </SafeAreaProvider>
  );
}

function Game() {
  const [maxScoreText, setMaxScoreText] = useState(String(DEFAULT_MAX_SCORE));
  const [maxScore, setMaxScore] = useState(DEFAULT_MAX_SCORE);
  const [name, setName] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [binHits, setBinHits] = useState<number[]>([]);
  const [boardArea, setBoardArea] = useState<{ width: number; height: number } | null>(null);

  // 줄 수 = 최고 점수, 도착 칸은 0 ~ maxScore점
  const scores = useMemo(() => getScores(maxScore), [maxScore]);
  const layout = useMemo(
    () =>
      boardArea
        ? computeLayout(boardArea.width - TABLE_PADDING * 2, boardArea.height - TABLE_PADDING * 2, maxScore)
        : null,
    [boardArea, maxScore],
  );

  const handleLand = useCallback((ball: Ball) => {
    const max = ball.trajectory.segments.length - 1; // 줄 수 = 최고 점수
    setBinHits((hits) => {
      const next = [...hits];
      next[ball.trajectory.bin] = (next[ball.trajectory.bin] ?? 0) + 1;
      return next;
    });
    setResults((r) => [...r, { id: ball.id, name: ball.name, score: ball.score, tone: scoreTone(ball.score, max) }]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const { balls, frameTime, drop, reset, inFlight } = usePlinko(layout, handleLand);
  const ranked = useMemo(() => rankResults(results), [results]);

  const changeMaxScoreText = (text: string) => {
    setMaxScoreText(text);
    const parsed = parseMaxScore(text);
    if (parsed !== null && parsed !== maxScore) {
      setMaxScore(parsed);
      setBinHits([]);
    }
  };

  // 입력칸이 비어 있거나 잘못돼 있어도 현재 보드의 점수를 기준으로 한 칸씩 움직인다
  const stepMaxScore = (delta: number) => {
    const next = Math.min(MAX_MAX_SCORE, Math.max(MIN_MAX_SCORE, maxScore + delta));
    setMaxScoreText(String(next));
    if (next !== maxScore) {
      setMaxScore(next);
      setBinHits([]);
    }
  };

  const maxScoreValid = parseMaxScore(maxScoreText) !== null;
  const trimmedName = name.trim();
  const canDrop = !!layout && maxScoreValid && trimmedName.length > 0;

  const dropBall = () => {
    if (!canDrop) return;
    drop(trimmedName, scores);
  };

  const resetAll = () => {
    reset();
    setResults([]);
    setBinHits([]);
    setName('');
    setMaxScoreText(String(DEFAULT_MAX_SCORE));
    setMaxScore(DEFAULT_MAX_SCORE);
    Keyboard.dismiss();
  };

  const confirmReset = () => {
    if (results.length === 0 && !inFlight) {
      resetAll();
      return;
    }
    Alert.alert('초기화', '모든 결과와 설정을 처음 상태로 되돌릴까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: resetAll },
    ]);
  };

  const onBoardAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoardArea((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        {/* 'position'은 화면 전체를 위로 밀어 올리기만 해서 보드 크기(=진행 중인 공 좌표)가 바뀌지 않는다 */}
        <KeyboardAvoidingView
          style={styles.fill}
          contentContainerStyle={styles.fill}
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
        >
          <View style={styles.header}>
            <View style={styles.brand}>
              <Text style={styles.title}>
                PLIN<Text style={styles.titleHighlight}>KO</Text>
              </Text>
              <Pressable style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]} onPress={confirmReset}>
                <Text style={styles.resetText}>초기화</Text>
              </Pressable>
            </View>
            <View style={styles.tableTag}>
              <Text style={styles.tableTagLabel}>TABLE</Text>
              <Text style={styles.tableTagValue}>01</Text>
              <Text style={styles.tableTagLabel}>LAS VEGAS</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.table} onLayout={onBoardAreaLayout}>
              {boardArea && <TableFelt width={boardArea.width} height={boardArea.height} />}
              <Text style={styles.feltPrint}>HIGH ROLLER · PLINKO</Text>
              {layout && (
                <PlinkoBoard layout={layout} scores={scores} balls={balls} frameTime={frameTime} binHits={binHits} />
              )}
              <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
                {ranked.map((r) => (
                  <View key={r.id} style={[styles.resultRow, r.rank === 1 && styles.resultRowFirst]}>
                    <Text style={[styles.resultRank, r.rank === 1 && styles.resultRankFirst]}>{r.rank}등</Text>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <View style={[styles.resultScore, { backgroundColor: r.tone.bg }]}>
                      <Text style={[styles.resultScoreText, { color: r.tone.fg }]}>{r.score}점</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <Controls
              maxScoreText={maxScoreText}
              onMaxScoreTextChange={changeMaxScoreText}
              onMaxScoreStep={stepMaxScore}
              canDecrement={maxScore > MIN_MAX_SCORE}
              canIncrement={maxScore < MAX_MAX_SCORE}
              maxScoreValid={maxScoreValid}
              maxScoreLocked={inFlight}
              name={name}
              onNameChange={setName}
              canDrop={canDrop}
              onDrop={dropBall}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fill: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  brand: {
    alignItems: 'flex-start',
    gap: 6,
  },
  title: {
    color: colors.text,
    fontFamily: font.black,
    fontSize: 48,
    lineHeight: 54,
  },
  titleHighlight: {
    color: palette.black,
    backgroundColor: palette.marquee,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: palette.blush,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  resetText: {
    color: palette.blush,
    fontFamily: font.bold,
    fontSize: 13,
  },
  tableTag: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  tableTagLabel: {
    color: colors.textMuted,
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  tableTagValue: {
    color: palette.primary,
    fontFamily: font.mono,
    fontWeight: '700',
    fontSize: 22,
  },
  pressed: {
    opacity: 0.75,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  table: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.crimson,
    borderRadius: radius.xl,
    // 로고 옐로를 옅게 쓴 테이블 레일
    borderWidth: 1,
    borderColor: 'rgba(255, 212, 0, 0.45)',
    overflow: 'hidden',
    padding: TABLE_PADDING,
  },
  feltPrint: {
    position: 'absolute',
    left: 18,
    top: 16,
    color: 'rgba(255, 179, 179, 0.55)',
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  results: {
    position: 'absolute',
    top: TABLE_PADDING,
    right: TABLE_PADDING,
    maxHeight: '90%',
  },
  resultsContent: {
    alignItems: 'flex-end',
    gap: 6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.black,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 8,
  },
  resultRowFirst: {
    borderColor: palette.primary,
  },
  resultRank: {
    color: colors.textMuted,
    fontFamily: font.mono,
    fontWeight: '700',
    fontSize: 12,
    minWidth: 28,
  },
  resultRankFirst: {
    color: palette.primary,
  },
  resultName: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 13,
    maxWidth: 96,
  },
  resultScore: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  resultScoreText: {
    fontFamily: font.mono,
    fontWeight: '700',
    fontSize: 12,
  },
});
