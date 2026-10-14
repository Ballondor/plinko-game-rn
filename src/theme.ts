import { Platform } from 'react-native';

// 디자인 시스템 팔레트 (톤 보정 없이 그대로 사용, 색 위 텍스트는 흑/백으로 대비 확보)
export const palette = {
  primary: '#00b6ff', // CTA·강조
  black: '#000000',
  white: '#ffffff',
  crimson: '#972121', // 카지노 테이블 펠트
  blush: '#ffb3b3',
  marquee: '#ffd400', // 템플릿 티커/위험표시 밴드용 옐로
};

export const colors = {
  bg: palette.black,
  surface: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.14)',
  borderStrong: 'rgba(255, 255, 255, 0.28)',
  text: palette.white,
  textMuted: 'rgba(255, 255, 255, 0.6)',
  onPrimary: palette.black,
};

// 라운딩: 카드 rounded-xl(12), 버튼·입력 rounded-lg(8), 알약형 full
export const radius = { lg: 8, xl: 12, full: 9999 };

export const font = {
  regular: 'Pretendard-Regular',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  black: 'Pretendard-Black',
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
};
