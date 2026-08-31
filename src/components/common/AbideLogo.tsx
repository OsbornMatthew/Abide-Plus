import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useApp } from '../../context/AppContext';

interface AbideLogoProps {
  fontSize?: number;
  showIconImage?: boolean;
  iconSize?: number;
}

export const AbideLogo: React.FC<AbideLogoProps> = ({
  fontSize = 22,
  showIconImage = false,
  iconSize = 34,
}) => {
  const { settings } = useApp();
  const isDark = settings.isDarkMode;

  const plusSize = Math.round(fontSize * 1.6); // Extra Bold & Prominent

  return (
    <View style={styles.container}>
      {showIconImage && (
        <Image
          source={require('../../../assets/icon.png')}
          style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }}
          resizeMode="cover"
        />
      )}

      <View style={styles.textContainer}>
        <Text style={[styles.abideText, { fontSize, color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          Abide
        </Text>
        {/* Bold Vibrant Gradient '+' Symbol matching user icon */}
        <Svg width={plusSize * 1.05} height={plusSize * 1.25} style={styles.svgPlus}>
          <Defs>
            <SvgGradient id="rainbowPlusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FBBF24" />
              <Stop offset="25%" stopColor="#F97316" />
              <Stop offset="55%" stopColor="#EC4899" />
              <Stop offset="80%" stopColor="#8B5CF6" />
              <Stop offset="100%" stopColor="#06B6D4" />
            </SvgGradient>
          </Defs>
          <SvgText
            fill="url(#rainbowPlusGrad)"
            fontSize={plusSize}
            fontWeight="900"
            stroke="url(#rainbowPlusGrad)"
            strokeWidth="0.8"
            x="2"
            y={fontSize * 1.12}
            textAnchor="start"
          >
            +
          </SvgText>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  abideText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  svgPlus: {
    marginLeft: 2,
    marginTop: -4,
  },
});
