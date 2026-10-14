import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MAX_MAX_SCORE, MIN_MAX_SCORE } from '../game/scores';
import { colors, font, palette, radius } from '../theme';

type Props = {
  maxScoreText: string;
  onMaxScoreTextChange: (text: string) => void;
  onMaxScoreStep: (delta: number) => void;
  canDecrement: boolean;
  canIncrement: boolean;
  maxScoreValid: boolean;
  maxScoreLocked: boolean;
  name: string;
  onNameChange: (text: string) => void;
  canDrop: boolean;
  onDrop: () => void;
};

export function Controls(props: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>점수 범위</Text>
      <View style={styles.row}>
        <View style={styles.fixedScore}>
          <Text style={styles.fixedScoreText}>0</Text>
        </View>
        <Text style={styles.tilde}>~</Text>
        <StepButton label="−" onPress={() => props.onMaxScoreStep(-1)} disabled={props.maxScoreLocked || !props.canDecrement} />
        <TextInput
          style={[styles.input, styles.scoreInput, !props.maxScoreValid && styles.inputInvalid]}
          value={props.maxScoreText}
          onChangeText={props.onMaxScoreTextChange}
          keyboardType="number-pad"
          maxLength={2}
          editable={!props.maxScoreLocked}
          selectTextOnFocus
        />
        <StepButton label="+" onPress={() => props.onMaxScoreStep(1)} disabled={props.maxScoreLocked || !props.canIncrement} />
        <Text style={styles.unit}>점</Text>
      </View>
      {!props.maxScoreValid && (
        <Text style={styles.hint}>
          {MIN_MAX_SCORE}~{MAX_MAX_SCORE} 사이 숫자를 입력해 주세요
        </Text>
      )}

      <Text style={styles.label}>참석자 이름</Text>
      <TextInput
        style={[styles.input, styles.nameInput]}
        value={props.name}
        onChangeText={props.onNameChange}
        placeholder="이름을 입력하세요"
        placeholderTextColor={colors.textMuted}
        maxLength={12}
        returnKeyType="go"
        onSubmitEditing={() => props.canDrop && props.onDrop()}
      />

      <Pressable
        style={({ pressed }) => [styles.dropButton, !props.canDrop && styles.disabled, pressed && styles.pressed]}
        onPress={props.onDrop}
        disabled={!props.canDrop}
      >
        <Text style={styles.dropText}>공 떨어뜨리기</Text>
      </Pressable>
    </View>
  );
}

function StepButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.stepButton, disabled && styles.disabled, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
    >
      <Text style={styles.stepButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 24,
    paddingTop: 16,
  },
  label: {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    backgroundColor: palette.black,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  scoreInput: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.mono,
    fontWeight: '700',
  },
  nameInput: {
    fontFamily: font.semibold,
  },
  inputInvalid: {
    borderColor: palette.blush,
  },
  fixedScore: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixedScoreText: {
    color: colors.textMuted,
    fontFamily: font.mono,
    fontWeight: '700',
    fontSize: 18,
  },
  stepButton: {
    width: 44,
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 22,
  },
  tilde: {
    color: colors.textMuted,
    fontFamily: font.mono,
    fontSize: 16,
  },
  unit: {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: 15,
  },
  hint: {
    color: palette.blush,
    fontFamily: font.regular,
    fontSize: 12,
    marginTop: 6,
  },
  dropButton: {
    marginTop: 16,
    backgroundColor: palette.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    paddingVertical: 16,
  },
  dropText: {
    color: colors.onPrimary,
    fontFamily: font.black,
    fontSize: 18,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.75,
  },
});
