import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 - 100
  color: string;
  bgColor?: string;
  label?: string;
  subLabel?: string;
  centerText?: string;
  showPercent?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 90,
  strokeWidth = 8,
  progress,
  color,
  bgColor = '#1E293B',
  label,
  subLabel,
  centerText,
  showPercent = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            stroke={bgColor}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            stroke={color}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View style={styles.centerContainer}>
          {centerText ? (
            <Text style={[styles.centerText, { color }]}>{centerText}</Text>
          ) : showPercent ? (
            <Text style={[styles.percentText, { color }]}>{clampedProgress}%</Text>
          ) : null}
        </View>
      </View>

      {label && <Text style={styles.label}>{label}</Text>}
      {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  centerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 6,
  },
  subLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
});
