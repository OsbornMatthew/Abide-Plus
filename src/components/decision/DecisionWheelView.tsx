import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import { useApp } from '../../context/AppContext';
import { DecisionWheel, WheelOption } from '../../types/decision';
import {
  RotateCw,
  Plus,
  Edit3,
  Trash2,
  History,
  Sparkles,
  Award,
  ChevronDown,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface DecisionWheelViewProps {
  onOpenCreateWheel: () => void;
  onOpenEditWheel: (wheel: DecisionWheel) => void;
  onOpenHistory: () => void;
}

const WHEEL_SIZE = 280;
const RADIUS = WHEEL_SIZE / 2;

export const DecisionWheelView: React.FC<DecisionWheelViewProps> = ({
  onOpenCreateWheel,
  onOpenEditWheel,
  onOpenHistory,
}) => {
  const {
    theme,
    settings,
    decisionWheels,
    activeWheelId,
    setActiveWheelId,
    deleteDecisionWheel,
    recordDecisionResult,
    decisionResults,
  } = useApp();

  const isTamil = settings.displayLanguage === 'ta';
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerResult, setWinnerResult] = useState<WheelOption | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const currentAngleRef = useRef(0);

  const activeWheel =
    decisionWheels.find((w) => w.id === activeWheelId) ||
    decisionWheels[0] || {
      id: 'default',
      title: 'Decide with God',
      options: [
        { id: '1', text: 'Option A', color: '#F59E0B' },
        { id: '2', text: 'Option B', color: '#10B981' },
      ],
      createdAt: new Date().toISOString(),
    };

  const options = activeWheel.options || [];
  const numSlices = Math.max(1, options.length);
  const sliceAngle = 360 / numSlices;

  // Spin Wheel Physics
  const handleSpin = () => {
    if (isSpinning || options.length === 0) return;

    setIsSpinning(true);
    setWinnerResult(null);

    // Random winner index
    const winnerIndex = Math.floor(Math.random() * options.length);
    const winningOption = options[winnerIndex];

    // Pointer is at the TOP (270 degrees in SVG coordinates)
    // Slice i occupies [i * sliceAngle, (i + 1) * sliceAngle]
    // To land center of slice i at the top pointer (270 deg):
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = 270 - targetSliceCenter;

    // Minimum 5 full rotations (1800 deg) plus target offset
    const currentRot = currentAngleRef.current;
    const extraRotations = 360 * 6; // 6 spins
    const normalizedCurrent = currentRot % 360;
    const delta = ((targetAngle - normalizedCurrent) % 360 + 360) % 360;
    const finalAngle = currentRot + extraRotations + delta;

    spinAnim.setValue(currentRot);

    Animated.timing(spinAnim, {
      toValue: finalAngle,
      duration: 4000,
      easing: Easing.bezier(0.12, 0.8, 0.2, 1), // Realistic friction deceleration
      useNativeDriver: true,
    }).start(async () => {
      currentAngleRef.current = finalAngle;
      setIsSpinning(false);
      setWinnerResult(winningOption);
      setShowWinnerModal(true);

      // Record result to history
      await recordDecisionResult({
        wheelId: activeWheel.id,
        wheelTitle: activeWheel.title,
        selectedOption: winningOption.text,
        optionColor: winningOption.color,
      });
    });
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const handleDeleteActiveWheel = () => {
    const confirmMsg = isTamil
      ? `"${activeWheel.title}" சக்கரத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`
      : `Delete "${activeWheel.title}" wheel?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        deleteDecisionWheel(activeWheel.id);
      }
      return;
    }

    Alert.alert(
      isTamil ? 'சக்கரத்தை நீக்கு' : 'Delete Wheel',
      confirmMsg,
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        {
          text: isTamil ? 'நீக்கு' : 'Delete',
          style: 'destructive',
          onPress: () => deleteDecisionWheel(activeWheel.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.wheelHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionSubtitle, { color: theme.primary }]}>
            ✨ {isTamil ? 'தீர்மானச் சக்கரம்' : 'SPIRITUAL DECISION MAKER'}
          </Text>
          <Text style={[styles.sectionMainTitle, { color: theme.text }]}>
            {decisionWheels.length > 0
              ? isTamil
                ? activeWheel.titleTa || activeWheel.title
                : activeWheel.title
              : isTamil
              ? 'தீர்மானச் சக்கரம்'
              : 'Spiritual Decision Maker'}
          </Text>
        </View>

        <View style={styles.headerActionBtns}>
          <TouchableOpacity
            style={[styles.smallIconBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
            onPress={onOpenHistory}
            activeOpacity={0.7}
          >
            <History size={16} color={theme.text} />
            {decisionResults.length > 0 && (
              <View style={[styles.historyBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.historyBadgeText}>{decisionResults.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {decisionWheels.length > 0 && (
            <TouchableOpacity
              style={[styles.smallIconBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
              onPress={() => onOpenEditWheel(activeWheel)}
              activeOpacity={0.7}
            >
              <Edit3 size={15} color={theme.primary} />
            </TouchableOpacity>
          )}

          {decisionWheels.length > 0 && (
            <TouchableOpacity
              style={[styles.smallIconBtn, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
              onPress={handleDeleteActiveWheel}
              activeOpacity={0.7}
            >
              <Trash2 size={15} color={theme.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {decisionWheels.length === 0 ? (
        <View style={[styles.emptyWheelCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <Sparkles size={36} color={theme.primary} />
          <Text style={[styles.emptyWheelTitle, { color: theme.text }]}>
            {isTamil ? 'தீர்மானச் சக்கரங்கள் எதுவும் இல்லை' : 'No Decision Wheels Yet'}
          </Text>
          <Text style={[styles.emptyWheelDesc, { color: theme.textMuted }]}>
            {isTamil
              ? 'வேத வாசிப்பு, ஜெபப் பரிந்துரை அல்லது அன்றாட காரியங்களுக்கு உங்கள் சொந்த சக்கரங்களை உருவாக்கவும்.'
              : 'Create custom spinning wheels for Scripture focus, prayer intentions, or daily choices.'}
          </Text>
          <TouchableOpacity
            style={[styles.createFirstWheelBtn, { backgroundColor: theme.primary }]}
            onPress={onOpenCreateWheel}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#000" />
            <Text style={styles.createFirstWheelBtnText}>
              {isTamil ? 'புதிய சக்கரத்தை உருவாக்கு' : 'Create Decision Wheel'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Wheel Pills Horizontal Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wheelsPillsRow}
          >
            {decisionWheels.map((wheel) => {
              const isSelected = wheel.id === activeWheel.id;
              return (
                <TouchableOpacity
                  key={wheel.id}
                  style={[
                    styles.wheelPill,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                    },
                    theme.cardShadow,
                  ]}
                  onPress={() => {
                    if (!isSpinning) {
                      setActiveWheelId(wheel.id);
                      setWinnerResult(null);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.wheelPillText,
                      { color: isSelected ? '#000' : theme.text },
                    ]}
                  >
                    {isTamil ? wheel.titleTa || wheel.title : wheel.title}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* New Wheel Button */}
            <TouchableOpacity
              style={[styles.newWheelPill, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}
              onPress={onOpenCreateWheel}
              activeOpacity={0.8}
            >
              <Plus size={14} color={theme.primary} />
              <Text style={[styles.newWheelPillText, { color: theme.primary }]}>
                {isTamil ? 'புதிய சக்கரம்' : 'New Wheel'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* SPINNING WHEEL STAGE */}
          <View style={styles.wheelStage}>
            {/* Pointer Arrow Indicator (Pointing Downwards at Top) */}
            <View style={styles.pointerContainer}>
              <View style={[styles.pointerTriangle, { borderTopColor: theme.primary }]} />
            </View>

            {/* Outer Glow Ring */}
            <View
              style={[
                styles.wheelOuterRing,
                {
                  borderColor: theme.primary + '55',
                  backgroundColor: theme.card,
                },
                theme.cardShadow,
              ]}
            >
              <Animated.View
                style={{
                  width: WHEEL_SIZE,
                  height: WHEEL_SIZE,
                  transform: [{ rotate: spinInterpolate }],
                }}
              >
                <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
                  <G>
                    {options.map((opt, i) => {
                      const startAngle = i * sliceAngle;
                      const endAngle = (i + 1) * sliceAngle;
                      const startRad = (Math.PI / 180) * startAngle;
                      const endRad = (Math.PI / 180) * endAngle;
                      const midRad = (Math.PI / 180) * (startAngle + sliceAngle / 2);

                      const x1 = RADIUS + RADIUS * Math.cos(startRad);
                      const y1 = RADIUS + RADIUS * Math.sin(startRad);
                      const x2 = RADIUS + RADIUS * Math.cos(endRad);
                      const y2 = RADIUS + RADIUS * Math.sin(endRad);

                      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                      const pathData = `M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

                      // Text Label positioning along radial arm
                      const textDist = RADIUS * 0.65;
                      const tx = RADIUS + textDist * Math.cos(midRad);
                      const ty = RADIUS + textDist * Math.sin(midRad);
                      const rotDeg = startAngle + sliceAngle / 2;

                      const displayText =
                        opt.text.length > 18 ? opt.text.substring(0, 16) + '...' : opt.text;

                      return (
                        <G key={opt.id || i}>
                          <Path d={pathData} fill={opt.color || '#F59E0B'} stroke="#070B14" strokeWidth="2.5" />
                          <SvgText
                            x={tx}
                            y={ty}
                            fill="#FFFFFF"
                            fontSize={numSlices > 8 ? 10 : 11.5}
                            fontWeight="800"
                            textAnchor="middle"
                            alignmentBaseline="central"
                            transform={`rotate(${rotDeg}, ${tx}, ${ty})`}
                          >
                            {displayText}
                          </SvgText>
                        </G>
                      );
                    })}
                  </G>

                  {/* Decorative Center Ring */}
                  <Circle cx={RADIUS} cy={RADIUS} r={28} fill="#070B14" stroke={theme.cardBorder} strokeWidth="3" />
                </Svg>
              </Animated.View>

              {/* Central Spin Button Overlay */}
              <TouchableOpacity
                style={[
                  styles.centerSpinBtn,
                  {
                    backgroundColor: theme.primary,
                    borderColor: '#070B14',
                  },
                ]}
                onPress={handleSpin}
                disabled={isSpinning || options.length === 0}
                activeOpacity={0.85}
              >
                <RotateCw size={18} color="#000" />
                <Text style={styles.centerSpinText}>
                  {isSpinning ? (isTamil ? 'சுழல்கிறது...' : 'SPINNING') : (isTamil ? 'சுழற்று' : 'SPIN')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* OPTIONS LIST & EDIT PROMPT */}
          <View style={[styles.optionsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
            <View style={styles.optionsCardHeader}>
              <Text style={[styles.optionsTitle, { color: theme.text }]}>
                🎯 {isTamil ? 'சக்கரத்தின் தேர்வுகள்' : 'Current Wheel Choices'} ({options.length})
              </Text>
              <TouchableOpacity onPress={() => onOpenEditWheel(activeWheel)}>
                <Text style={[styles.editLinkText, { color: theme.primary }]}>
                  + {isTamil ? 'மாற்றுக / சேர்க்க' : 'Edit Choices'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionsChipsGrid}>
              {options.map((opt, idx) => (
                <View
                  key={opt.id || idx}
                  style={[styles.optChip, { backgroundColor: theme.cardAlt, borderColor: opt.color }]}
                >
                  <View style={[styles.optDot, { backgroundColor: opt.color }]} />
                  <Text style={[styles.optChipText, { color: theme.text }]} numberOfLines={1}>
                    {opt.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* WINNER RESULT POPUP BANNER */}
      {showWinnerModal && winnerResult && (
        <View style={[styles.winnerBanner, { backgroundColor: theme.card, borderColor: theme.primary }, theme.cardShadow]}>
          <View style={[styles.winnerIconBadge, { backgroundColor: theme.primary + '25' }]}>
            <Sparkles size={24} color={theme.primary} />
          </View>

          <Text style={[styles.winnerHeading, { color: theme.primary }]}>
            🎉 {isTamil ? 'தேர்வு முடிந்தது!' : 'DECISION MADE!'}
          </Text>

          <View style={[styles.winnerChoiceBox, { backgroundColor: winnerResult.color + '22', borderColor: winnerResult.color }]}>
            <Text style={[styles.winnerChoiceText, { color: theme.text }]}>
              {winnerResult.text}
            </Text>
          </View>

          <View style={styles.winnerActionRow}>
            <TouchableOpacity
              style={[styles.spinAgainBtn, { backgroundColor: theme.primary }]}
              onPress={handleSpin}
            >
              <RotateCw size={14} color="#000" />
              <Text style={styles.spinAgainText}>
                {isTamil ? 'மீண்டும் சுழற்ற' : 'Spin Again'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeWinnerBtn, { backgroundColor: theme.cardAlt }]}
              onPress={() => setShowWinnerModal(false)}
            >
              <Text style={[styles.closeWinnerText, { color: theme.textMuted }]}>
                {isTamil ? 'முடிவு' : 'Dismiss'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  wheelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  historyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  historyBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },
  wheelsPillsRow: {
    gap: 8,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  wheelPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  wheelPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  newWheelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  newWheelPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  wheelStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    position: 'relative',
  },
  pointerContainer: {
    position: 'absolute',
    top: -12,
    zIndex: 10,
    alignItems: 'center',
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  wheelOuterRing: {
    width: WHEEL_SIZE + 16,
    height: WHEEL_SIZE + 16,
    borderRadius: (WHEEL_SIZE + 16) / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerSpinBtn: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  centerSpinText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  optionsCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  optionsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  optionsTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  editLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  optionsChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    maxWidth: '100%',
  },
  optDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  winnerBanner: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
  },
  winnerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  winnerHeading: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  winnerChoiceBox: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    width: '100%',
    alignItems: 'center',
  },
  winnerChoiceText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  winnerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.md,
    width: '100%',
  },
  spinAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  spinAgainText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  closeWinnerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeWinnerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWheelCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: 10,
  },
  emptyWheelTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyWheelDesc: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  createFirstWheelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: 6,
  },
  createFirstWheelBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
});
