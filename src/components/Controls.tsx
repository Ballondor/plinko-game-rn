import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MAX_ROWS, MIN_ROWS, Risk } from '../game/multipliers';

type Props = {
  betText: string;
  onBetTextChange: (text: string) => void;
  onHalveBet: () => void;
  onDoubleBet: () => void;
  risk: Risk;
  onRiskChange: (risk: Risk) => void;
  rows: number;
  onRowsChange: (rows: number) => void;
  settingsLocked: boolean;
  canDrop: boolean;
  onDrop: () => void;
  autoOn: boolean;
  onToggleAuto: () => void;
};

const RISKS: { value: Risk; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '중간' },
  { value: 'high', label: '높음' },
];

export function Controls(props: Props) {
  const { settingsLocked, rows } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>베팅 금액</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={props.betText}
          onChangeText={props.onBetTextChange}
          keyboardType="decimal-pad"
          editable={!props.autoOn}
          selectTextOnFocus
        />
        <SmallButton label="½" onPress={props.onHalveBet} disabled={props.autoOn} />
        <SmallButton label="2×" onPress={props.onDoubleBet} disabled={props.autoOn} />
      </View>

      <Text style={styles.label}>위험도</Text>
      <View style={styles.segment}>
        {RISKS.map((r) => (
          <Pressable
            key={r.value}
            style={[styles.segmentItem, props.risk === r.value && styles.segmentItemActive]}
            onPress={() => props.onRiskChange(r.value)}
            disabled={settingsLocked}
          >
            <Text style={[styles.segmentText, settingsLocked && styles.disabledText]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>줄 수</Text>
      <View style={styles.row}>
        <SmallButton label="−" onPress={() => props.onRowsChange(rows - 1)} disabled={settingsLocked || rows <= MIN_ROWS} />
        <View style={styles.rowsValue}>
          <Text style={styles.rowsText}>{rows}</Text>
        </View>
        <SmallButton label="+" onPress={() => props.onRowsChange(rows + 1)} disabled={settingsLocked || rows >= MAX_ROWS} />
      </View>

      <View style={[styles.row, { marginTop: 14 }]}>
        <Pressable
          style={({ pressed }) => [styles.dropButton, !props.canDrop && styles.buttonDisabled, pressed && styles.pressed]}
          onPress={props.onDrop}
          disabled={!props.canDrop || props.autoOn}
        >
          <Text style={styles.dropText}>공 떨어뜨리기</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.autoButton, props.autoOn && styles.autoButtonOn, pressed && styles.pressed]}
          onPress={props.onToggleAuto}
        >
          <Text style={styles.autoText}>{props.autoOn ? '정지' : '자동'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SmallButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.smallButton, disabled && styles.buttonDisabled, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e2a3a',
    borderRadius: 14,
    padding: 14,
  },
  label: {
    color: '#8b9cb3',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f1923',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallButton: {
    minWidth: 46,
    backgroundColor: '#2f4157',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#0f1923',
    borderRadius: 8,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  segmentItemActive: {
    backgroundColor: '#2f4157',
  },
  segmentText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledText: {
    opacity: 0.4,
  },
  rowsValue: {
    flex: 1,
    backgroundColor: '#0f1923',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  rowsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dropButton: {
    flex: 1,
    backgroundColor: '#00e701',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 14,
  },
  dropText: {
    color: '#05310a',
    fontSize: 16,
    fontWeight: '800',
  },
  autoButton: {
    width: 76,
    backgroundColor: '#2f4157',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoButtonOn: {
    backgroundColor: '#ff3b5c',
  },
  autoText: {
    color: '#fff',
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.75,
  },
});
