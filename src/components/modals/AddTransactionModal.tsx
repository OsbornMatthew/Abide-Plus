import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { TransactionType, IncomeCategory, ExpenseCategory, GivingCategory, SavingsCategory } from '../../types/finance';
import {
  X,
  Check,
  Heart,
  ArrowDown,
  ArrowUp,
  Sparkles,
  Coins,
  Calendar,
  PenLine,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  defaultCategory?: string;
  defaultDate?: string; // YYYY-MM-DD
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Business',
  'Freelance',
  'Investments',
  'Gift',
  'Firstfruits',
  'Other Income',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Debt & Loans',
  'Housing & Rent',
  'Groceries & Food',
  'Transport & Fuel',
  'Utilities & Bills',
  'Healthcare & Meds',
  'Family & Kids',
  'Education',
  'Personal Care',
  'Leisure & Dining',
  'Miscellaneous',
];

const GIVING_CATEGORIES: GivingCategory[] = [
  'Tithe (10%)',
  'Firstfruits',
  'Missions & Evang.',
  'Church Building',
  'Benevolence / Alms',
  'Sunday Offering',
  'Thanksgiving Offering',
];

const SAVINGS_CATEGORIES: SavingsCategory[] = [
  'Emergency Fund',
  'Future Investments',
  'Family & Kids',
  'Children Education',
  'Home & Land',
  'Church Project',
  'General Savings',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  defaultType = 'expense',
  defaultCategory,
  defaultDate,
}) => {
  const { theme, settings, addTransaction } = useApp();
  const isTamil = settings.displayLanguage === 'ta';
  const currencySym = settings.currency.symbol;

  const todayStr = new Date().toISOString().split('T')[0];
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(defaultCategory || 'Groceries & Food');
  const [note, setNote] = useState('');
  const [recipientOrSource, setRecipientOrSource] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate || todayStr);

  // Compute next month 1st date
  const nextMonthFirstStr = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  })();

  // Reset or update state whenever modal opens or defaultType changes
  useEffect(() => {
    if (visible) {
      setType(defaultType);
      if (defaultCategory) {
        setCategory(defaultCategory);
      } else {
        if (defaultType === 'income') setCategory('Salary');
        else if (defaultType === 'expense') setCategory('Groceries & Food');
        else if (defaultType === 'tithe') setCategory('Tithe (10%)');
        else if (defaultType === 'savings') setCategory('Emergency Fund');
        else if (defaultType === 'offering') setCategory('Missions & Evang.');
        else if (defaultType === 'benevolence') setCategory('Benevolence / Alms');
      }
      setAmount('');
      setNote('');
      setRecipientOrSource('');
      setSelectedDate(defaultDate || todayStr);
    }
  }, [visible, defaultType, defaultCategory, defaultDate, todayStr]);

  const getCategoryLabel = (cat: string) => {
    if (!isTamil) return cat;
    switch (cat) {
      case 'Debt & Loans':
        return 'கடன் & தவணைகள் (EMI)';
      case 'Housing & Rent':
        return 'வீட்டு வாடகை';
      case 'Groceries & Food':
        return 'மளிகை & உணவு';
      case 'Transport & Fuel':
        return 'போக்குவரத்து & எரிபொருள்';
      case 'Utilities & Bills':
        return 'மின்சாரம் & கட்டணங்கள்';
      case 'Healthcare & Meds':
        return 'மருத்துவம் & மருந்துகள்';
      case 'Family & Kids':
        return 'குடும்பம் & குழந்தைகள்';
      case 'Education':
        return 'கல்வி & பயிற்சிகள்';
      case 'Personal Care':
        return 'தனிநபர் பராமரிப்பு';
      case 'Leisure & Dining':
        return 'உணவகம் & பொழுதுபோக்கு';
      case 'Miscellaneous':
        return 'இதர செலவுகள்';
      case 'Salary':
        return 'சம்பளம்';
      case 'Business':
        return 'தொழில் வருமானம்';
      case 'Freelance':
        return 'கூலி / பகுதிநேரம்';
      case 'Investments':
        return 'முதலீட்டு வருவாய்';
      case 'Gift':
        return 'அன்பளிப்பு';
      case 'Firstfruits':
        return 'முதற்பலன்';
      case 'Other Income':
        return 'பிற வரவுகள்';
      case 'Emergency Fund':
        return 'அவசரக்கால நிதி';
      case 'Future Investments':
        return 'எதிர்கால முதலீடு';
      case 'Children Education':
        return 'பிள்ளைகள் உயர்கல்வி';
      case 'Home & Land':
        return 'வீடு & நிலம்';
      case 'Church Project':
        return 'சபை திட்ட நிதி';
      case 'General Savings':
        return 'பொது சேமிப்பு';
      default:
        return cat;
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') setCategory('Salary');
    else if (newType === 'expense') setCategory('Groceries & Food');
    else if (newType === 'tithe') setCategory('Tithe (10%)');
    else if (newType === 'savings') setCategory('Emergency Fund');
    else if (newType === 'offering') setCategory('Missions & Evang.');
    else if (newType === 'benevolence') setCategory('Benevolence / Alms');
  };

  // Select category list based on type
  const availableCategories: string[] =
    type === 'income'
      ? INCOME_CATEGORIES
      : type === 'expense'
      ? EXPENSE_CATEGORIES
      : type === 'savings'
      ? SAVINGS_CATEGORIES
      : GIVING_CATEGORIES;

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await addTransaction({
      type,
      amount: numAmount,
      category: category.trim() || 'General',
      note: note.trim() || undefined,
      recipientOrSource: recipientOrSource.trim() || undefined,
      date: selectedDate,
    });

    onClose();
  };

  const parsedAmount = parseFloat(amount) || 0;
  const titheAmount = Math.round(parsedAmount * 0.1 * 100) / 100;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdropDismiss} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          {/* Top Sheet Drag Handle */}
          <View style={styles.sheetHandleBar}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.textMuted + '35' }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.headerIconCircle, { backgroundColor: theme.primary + '18' }]}>
                {type === 'income' ? (
                  <ArrowDown size={18} color={theme.incomeColor} />
                ) : type === 'expense' ? (
                  <ArrowUp size={18} color={theme.expenseColor} />
                ) : type === 'savings' ? (
                  <Coins size={18} color={theme.balanceColor} />
                ) : (
                  <Heart size={18} color={theme.primary} />
                )}
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {type === 'income'
                    ? (isTamil ? 'வருமானம் சேர்க்க' : 'Add Income')
                    : type === 'expense'
                    ? (isTamil ? 'செலவு பதிய' : 'Log Expense')
                    : type === 'savings'
                    ? (isTamil ? 'சேமிப்பு ஒதுக்கீடு' : 'Add Savings')
                    : (isTamil ? 'தசமபாகம் / காணிக்கை' : 'Tithe & Giving')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                  {isTamil ? 'காரியஸ்த நிதிப்பதிவு' : 'Stewardship Financial Entry'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]}>
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* 4 Main Type Selector Tabs: Income | Expense | Tithe | Savings */}
            <View style={[styles.typeSelector, { backgroundColor: theme.cardAlt }]}>
              {/* Income (Inflow Arrow) */}
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'income' && { backgroundColor: theme.incomeColor },
                ]}
                onPress={() => handleTypeChange('income')}
              >
                <ArrowDown size={14} color={type === 'income' ? '#000' : theme.textMuted} />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'income' ? '#000' : theme.textMuted },
                  ]}
                >
                  {isTamil ? 'வருமானம்' : 'Income'}
                </Text>
              </TouchableOpacity>

              {/* Expense (Outflow Arrow) */}
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'expense' && { backgroundColor: theme.expenseColor },
                ]}
                onPress={() => handleTypeChange('expense')}
              >
                <ArrowUp size={14} color={type === 'expense' ? '#FFF' : theme.textMuted} />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'expense' ? '#FFF' : theme.textMuted },
                  ]}
                >
                  {isTamil ? 'செலவு' : 'Expense'}
                </Text>
              </TouchableOpacity>

              {/* Tithe */}
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  (type === 'tithe' || type === 'offering' || type === 'benevolence') && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => handleTypeChange('tithe')}
              >
                <Heart
                  size={13}
                  color={
                    type === 'tithe' || type === 'offering' || type === 'benevolence'
                      ? '#000'
                      : theme.textMuted
                  }
                />
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color:
                        type === 'tithe' || type === 'offering' || type === 'benevolence'
                          ? '#000'
                          : theme.textMuted,
                    },
                  ]}
                >
                  {isTamil ? 'தசமபாகம்' : 'Tithe'}
                </Text>
              </TouchableOpacity>

              {/* Savings */}
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'savings' && { backgroundColor: theme.balanceColor },
                ]}
                onPress={() => handleTypeChange('savings')}
              >
                <Coins size={13} color={type === 'savings' ? '#FFF' : theme.textMuted} />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'savings' ? '#FFF' : theme.textMuted },
                  ]}
                >
                  {isTamil ? 'சேமிப்பு' : 'Savings'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sub-giving pills if in Giving mode */}
            {(type === 'tithe' || type === 'offering' || type === 'benevolence') && (
              <View style={styles.subGivingTabs}>
                {(['tithe', 'offering', 'benevolence'] as TransactionType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.subPill,
                      {
                        backgroundColor: type === t ? theme.primary + '30' : theme.cardAlt,
                        borderColor: type === t ? theme.primary : 'transparent',
                      },
                    ]}
                    onPress={() => handleTypeChange(t)}
                  >
                    <Text
                      style={[
                        styles.subPillText,
                        { color: type === t ? theme.primary : theme.textMuted },
                      ]}
                    >
                      {t === 'tithe'
                        ? isTamil
                          ? 'தசமபாகம் (10%)'
                          : 'Tithe (10%)'
                        : t === 'offering'
                        ? isTamil
                          ? 'காணிக்கை'
                          : 'Offering'
                        : isTamil
                        ? 'தர்மம்'
                        : 'Alms'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date & Month Selection */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  {isTamil ? 'தேதி / மாதம்' : 'Date / Month'}
                </Text>
                <Text style={[styles.activeDateText, { color: theme.primary }]}>
                  {selectedDate}
                </Text>
              </View>

              {/* Quick Date Chips (Today | 1st of This Month | Next Month 1st) */}
              <View style={styles.dateChipsRow}>
                <TouchableOpacity
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: selectedDate === todayStr ? theme.primary : theme.cardAlt,
                      borderColor: selectedDate === todayStr ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedDate(todayStr)}
                >
                  <Text style={[styles.dateChipText, { color: selectedDate === todayStr ? '#000' : theme.text }]}>
                    {isTamil ? 'இன்று' : 'Today'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: selectedDate === nextMonthFirstStr ? theme.primary : theme.cardAlt,
                      borderColor: selectedDate === nextMonthFirstStr ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedDate(nextMonthFirstStr)}
                >
                  <Text style={[styles.dateChipText, { color: selectedDate === nextMonthFirstStr ? '#000' : theme.text }]}>
                    {isTamil ? 'அடுத்த மாதம் (Next Month)' : 'Next Month'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Manual Date Input */}
              <TextInput
                style={[styles.dateInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'தொகை' : 'Amount'} ({currencySym})
              </Text>
              <View style={[styles.amountInputRow, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
                <Text style={[styles.currencyPrefix, { color: theme.primary }]}>{currencySym}</Text>
                <TextInput
                  style={[styles.amountInput, { color: theme.text }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>
            </View>

            {/* Tithe Auto Calculation Helper when Income is entered */}
            {type === 'income' && parsedAmount > 0 && (
              <View style={[styles.titheHelperBox, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '40' }]}>
                <Sparkles size={16} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.titheHelperTitle, { color: theme.primary }]}>
                    {isTamil ? '10% தசமபாகக் கணிப்பு:' : '10% Tithe Allocation:'}
                  </Text>
                  <Text style={[styles.titheHelperValue, { color: theme.text }]}>
                    {currencySym}{titheAmount.toLocaleString()} {isTamil ? '(மல்கியா 3:10)' : '(Malachi 3:10)'}
                  </Text>
                </View>
              </View>
            )}

            {/* Category selection */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  {isTamil ? 'பிரிவு (Category)' : 'Category'}
                </Text>
                {category.trim() ? (
                  <View style={[styles.activeCategoryPill, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.activeCategoryPillText, { color: theme.primary }]}>
                      ✓ {category}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Preset Category Chips */}
              <View style={styles.categoryGrid}>
                {availableCategories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.cardAlt,
                          borderColor: isSelected ? theme.primary : theme.cardBorder,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: isSelected ? '#000' : theme.text },
                        ]}
                      >
                        {getCategoryLabel(cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Manual Category Writing Field */}
              <View style={styles.manualCategoryWrapper}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <PenLine size={13} color={theme.primary} />
                  <Text style={[styles.manualCategoryLabel, { color: theme.textMuted }]}>
                    {isTamil ? 'அல்லது சொந்தப் பிரிவை நேரடியாக எழுதவும்:' : 'Or type a custom category manually:'}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.manualCategoryInput,
                    {
                      backgroundColor: theme.cardAlt,
                      borderColor: availableCategories.includes(category) ? theme.cardBorder : theme.primary,
                      color: theme.text,
                    },
                  ]}
                  placeholder={
                    isTamil
                      ? 'உங்கள் சொந்தப் பிரிவை உள்ளிடவும் (எ.கா. புத்தகங்கள், பரிசு)'
                      : 'Type custom category (e.g. Books, Gift, Tuition)...'
                  }
                  placeholderTextColor={theme.textMuted}
                  value={category}
                  onChangeText={(text) => setCategory(text)}
                />
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted }]}>
                {isTamil ? 'குறிப்பு' : 'Note'}
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder={isTamil ? 'விவரம்...' : 'Details...'}
                placeholderTextColor={theme.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Recipient */}
            {(type === 'tithe' || type === 'offering' || type === 'benevolence') && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  {isTamil ? 'பெறுநர் / திருச்சபை' : 'Recipient / Ministry'}
                </Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder={isTamil ? 'எ.கா. உள்ளூர் சபை' : 'e.g. Local Church Storehouse'}
                  placeholderTextColor={theme.textMuted}
                  value={recipientOrSource}
                  onChangeText={setRecipientOrSource}
                />
              </View>
            )}

            {/* Single Clean Save Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor:
                    type === 'expense'
                      ? theme.expenseColor
                      : type === 'income'
                      ? theme.incomeColor
                      : type === 'savings'
                      ? theme.balanceColor
                      : theme.primary,
                  opacity: parsedAmount > 0 ? 1 : 0.5,
                },
              ]}
              disabled={parsedAmount <= 0}
              onPress={handleSubmit}
            >
              <Check size={18} color={type === 'expense' || type === 'savings' ? '#FFF' : '#000'} />
              <Text
                style={[
                  styles.submitBtnText,
                  { color: type === 'expense' || type === 'savings' ? '#FFF' : '#000' },
                ]}
              >
                {isTamil ? 'சேமிக்கவும்' : 'Save Record'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)', // Soft, subtle, non-disturbing dark fade
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
  },
  sheetHandleBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
    gap: 2,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  typeTabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subGivingTabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  subPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  subPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
  },
  activeDateText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  dateChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '700',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '900',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
  },
  titheHelperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  titheHelperTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  titheHelperValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    fontSize: 13,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  activeCategoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  activeCategoryPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  manualCategoryWrapper: {
    marginTop: spacing.sm + 2,
  },
  manualCategoryLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  manualCategoryInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});
