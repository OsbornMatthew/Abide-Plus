import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import { TransactionType } from '../types/finance';
import {
  HandCoins,
  Heart,
  Coins,
  Trash2,
  ShieldCheck,
  Calendar,
  Wallet,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowDown,
  ArrowUp,
  ArrowDownLeft,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../theme/spacing';

export const FinanceScreen: React.FC = () => {
  const { theme, settings, transactions, deleteTransaction } = useApp();
  const isTamil = settings.displayLanguage === 'ta';
  const currencySym = settings.currency.symbol;

  // Active month navigation: Store as Date object set to 1st of month
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense' | 'giving' | 'savings'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setCurrentViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const selectedYear = currentViewDate.getFullYear();
  const selectedMonth = currentViewDate.getMonth(); // 0-indexed
  const selectedYearMonthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const startOfMonthStr = `${selectedYearMonthStr}-01`;

  const monthNameFormatted = currentViewDate.toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Previous month name for carry-forward display
  const prevMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const prevMonthNameFormatted = prevMonthDate.toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', {
    month: 'long',
  });

  const isCurrentMonthNow = (() => {
    const now = new Date();
    return now.getFullYear() === selectedYear && now.getMonth() === selectedMonth;
  })();

  // 1. Calculate Carried-Forward Opening Balance from all months prior to this month
  const carriedForwardBalance = useMemo(() => {
    let priorIncome = 0;
    let priorExpense = 0;
    let priorGiving = 0;
    let priorSavings = 0;

    transactions.forEach((tx) => {
      if (tx.date && tx.date < startOfMonthStr) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') priorIncome += amt;
        else if (tx.type === 'expense') priorExpense += amt;
        else if (tx.type === 'savings') priorSavings += amt;
        else if (tx.type === 'tithe' || tx.type === 'offering' || tx.type === 'benevolence') {
          priorGiving += amt;
        }
      }
    });

    return priorIncome - priorExpense - priorGiving - priorSavings;
  }, [transactions, startOfMonthStr]);

  // 2. Filter transactions strictly for this selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t.date) return false;
      return t.date.startsWith(selectedYearMonthStr);
    });
  }, [transactions, selectedYearMonthStr]);

  // 3. Compute totals specifically for the selected month
  const monthlyMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    let tithes = 0;
    let offerings = 0;
    let benevolence = 0;
    let savings = 0;

    monthlyTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        income += amt;
      } else if (tx.type === 'expense') {
        expense += amt;
      } else if (tx.type === 'tithe') {
        tithes += amt;
      } else if (tx.type === 'offering') {
        offerings += amt;
      } else if (tx.type === 'benevolence') {
        benevolence += amt;
      } else if (tx.type === 'savings') {
        savings += amt;
      }
    });

    const totalGiving = tithes + offerings + benevolence;
    const expectedTithe = Math.round(income * 0.1);
    const monthNetOnly = income - expense - totalGiving - savings;
    const totalAvailableBalance = carriedForwardBalance + monthNetOnly;

    return {
      income,
      expense,
      tithes,
      totalGiving,
      savings,
      expectedTithe,
      monthNetOnly,
      totalAvailableBalance,
    };
  }, [monthlyTransactions, carriedForwardBalance]);

  const filteredTransactions = monthlyTransactions.filter((t) => {
    if (activeFilter === 'expense') return t.type === 'expense';
    if (activeFilter === 'income') return t.type === 'income';
    if (activeFilter === 'savings') return t.type === 'savings';
    if (activeFilter === 'giving')
      return t.type === 'tithe' || t.type === 'offering' || t.type === 'benevolence';
    return true;
  });

  // Direct open helper for specific transaction types
  const openModal = (tType: TransactionType) => {
    setModalDefaultType(tType);
    setShowAddModal(true);
  };

  // Tithe status for selected month
  const isTitheFulfilled =
    monthlyMetrics.expectedTithe > 0 &&
    monthlyMetrics.tithes >= monthlyMetrics.expectedTithe;

  // Digital chart data computation (Expense by Category for the selected month)
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + (Number(t.amount) || 0);
      });
    const total = monthlyMetrics.expense || 1;
    return Object.entries(map)
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: Math.round((amt / total) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions, monthlyMetrics.expense]);

  const chartColors = [
    theme.expenseColor,
    theme.primary,
    theme.accentCyan,
    theme.accentPurple,
    theme.accentSage,
    '#FB7185',
    '#F472B6',
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isTamil ? 'செலவுகள் & நிதி' : 'Expenses & Finances'}
        subtitle={
          isTamil
            ? `${monthNameFormatted} மாத கணக்கு`
            : `${monthNameFormatted} Records`
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* MONTH SELECTOR BAR */}
        <View style={[styles.monthNavCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <TouchableOpacity
            style={[styles.monthNavBtn, { backgroundColor: theme.cardAlt }]}
            onPress={handlePrevMonth}
          >
            <ChevronLeft size={16} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthCenterCol}
            onPress={handleResetToCurrentMonth}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color={theme.primary} />
              <Text style={[styles.monthNavTitle, { color: theme.text }]}>
                {monthNameFormatted}
              </Text>
            </View>
            {!isCurrentMonthNow && (
              <Text style={[styles.jumpToCurrentText, { color: theme.primary }]}>
                {isTamil ? 'நடப்பு மாதத்திற்குச் செல்' : 'Tap to return to This Month'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.monthNavBtn, { backgroundColor: theme.cardAlt }]}
            onPress={handleNextMonth}
          >
            <ChevronRight size={16} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* MONTHLY NET BALANCE & CARRY-FORWARD CARD */}
        <View style={[styles.balanceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <View style={styles.balanceHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Wallet size={18} color={theme.balanceColor} />
              <Text style={[styles.balanceLabel, { color: theme.textMuted }]}>
                {isTamil ? `${monthNameFormatted} மொத்த இருப்பு` : `${monthNameFormatted} Total Balance`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.newLogBtn, { backgroundColor: theme.primary }]}
              onPress={() => openModal('expense')}
            >
              <Plus size={13} color="#000" />
              <Text style={styles.newLogBtnText}>{isTamil ? 'புதியது' : 'New'}</Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.balanceAmount,
              { color: monthlyMetrics.totalAvailableBalance >= 0 ? theme.balanceColor : theme.danger },
            ]}
          >
            {currencySym}{monthlyMetrics.totalAvailableBalance.toLocaleString()}
          </Text>

          {/* Automatic Carry-Forward Banner from Previous Month */}
          {carriedForwardBalance !== 0 && (
            <View style={[styles.carryForwardRow, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
              <ArrowDownLeft size={13} color={carriedForwardBalance >= 0 ? theme.incomeColor : theme.danger} />
              <Text style={[styles.carryForwardLabel, { color: theme.textMuted }]}>
                {isTamil
                  ? `${prevMonthNameFormatted} மாதத்திலிருந்து தொடரும் இருப்பு:`
                  : `Carried forward from ${prevMonthNameFormatted}:`}
              </Text>
              <Text
                style={[
                  styles.carryForwardVal,
                  { color: carriedForwardBalance >= 0 ? theme.incomeColor : theme.danger },
                ]}
              >
                {carriedForwardBalance >= 0 ? '+' : ''}{currencySym}{carriedForwardBalance.toLocaleString()}
              </Text>
            </View>
          )}

          {/* 4-Column Breakdown for Selected Month: Income | Expense | Tithe | Savings */}
          <View style={[styles.balanceBreakdownRow, { borderTopColor: theme.cardBorder }]}>
            {/* Income */}
            <TouchableOpacity style={styles.balanceSubCol} onPress={() => openModal('income')} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <ArrowDown size={12} color={theme.incomeColor} />
                <Text style={[styles.balanceSubLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'வரவு' : 'Income'}
                </Text>
              </View>
              <Text style={[styles.balanceSubVal, { color: theme.incomeColor }]}>
                +{currencySym}{monthlyMetrics.income.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <View style={[styles.vertDivider, { backgroundColor: theme.cardBorder }]} />

            {/* Expense */}
            <TouchableOpacity style={styles.balanceSubCol} onPress={() => openModal('expense')} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <ArrowUp size={12} color={theme.expenseColor} />
                <Text style={[styles.balanceSubLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'செலவு' : 'Expense'}
                </Text>
              </View>
              <Text style={[styles.balanceSubVal, { color: theme.expenseColor }]}>
                -{currencySym}{monthlyMetrics.expense.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <View style={[styles.vertDivider, { backgroundColor: theme.cardBorder }]} />

            {/* Tithe */}
            <TouchableOpacity style={styles.balanceSubCol} onPress={() => openModal('tithe')} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Heart size={11} color={theme.titheColor} />
                <Text style={[styles.balanceSubLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'தசமபாகம்' : 'Tithe'}
                </Text>
              </View>
              <Text style={[styles.balanceSubVal, { color: theme.titheColor }]}>
                {currencySym}{monthlyMetrics.totalGiving.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <View style={[styles.vertDivider, { backgroundColor: theme.cardBorder }]} />

            {/* Savings (Coins Icon) */}
            <TouchableOpacity style={styles.balanceSubCol} onPress={() => openModal('savings')} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Coins size={11} color={theme.balanceColor} />
                <Text style={[styles.balanceSubLabel, { color: theme.textMuted }]}>
                  {isTamil ? 'சேமிப்பு' : 'Savings'}
                </Text>
              </View>
              <Text style={[styles.balanceSubVal, { color: theme.balanceColor }]}>
                {currencySym}{monthlyMetrics.savings.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 DIRECT LOG ACTION TILES (Income | Expense | Tithe | Savings) */}
        <View style={styles.actionTilesRow}>
          {/* Income */}
          <TouchableOpacity
            style={[styles.directLogTile, { backgroundColor: theme.incomeColor }, theme.cardShadow]}
            onPress={() => openModal('income')}
            activeOpacity={0.8}
          >
            <ArrowDown size={16} color="#FFF" />
            <Text style={[styles.directLogTileText, { color: '#FFF' }]}>
              {isTamil ? 'வரவு' : 'Income'}
            </Text>
          </TouchableOpacity>

          {/* Expense */}
          <TouchableOpacity
            style={[styles.directLogTile, { backgroundColor: theme.expenseColor }, theme.cardShadow]}
            onPress={() => openModal('expense')}
            activeOpacity={0.8}
          >
            <ArrowUp size={16} color="#FFF" />
            <Text style={[styles.directLogTileText, { color: '#FFF' }]}>
              {isTamil ? 'செலவு' : 'Expense'}
            </Text>
          </TouchableOpacity>

          {/* Tithe */}
          <TouchableOpacity
            style={[styles.directLogTile, { backgroundColor: theme.primary }, theme.cardShadow]}
            onPress={() => openModal('tithe')}
            activeOpacity={0.8}
          >
            <Heart size={15} color="#000" />
            <Text style={[styles.directLogTileText, { color: '#000' }]}>
              {isTamil ? 'தசமபாகம்' : 'Tithe'}
            </Text>
          </TouchableOpacity>

          {/* Savings (Coins) */}
          <TouchableOpacity
            style={[styles.directLogTile, { backgroundColor: theme.balanceColor }, theme.cardShadow]}
            onPress={() => openModal('savings')}
            activeOpacity={0.8}
          >
            <Coins size={15} color="#FFF" />
            <Text style={[styles.directLogTileText, { color: '#FFF' }]}>
              {isTamil ? 'சேமிப்பு' : 'Savings'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 10% STOREHOUSE TITHE CARD FOR SELECTED MONTH */}
        <TouchableOpacity
          style={[styles.titheCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}
          onPress={() => openModal('tithe')}
          activeOpacity={0.8}
        >
          <View style={styles.titheHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={18} color={theme.primary} />
              <Text style={[styles.titheHeading, { color: theme.text }]}>
                {isTamil ? `${monthNameFormatted} 10% தசமபாகம்` : `${monthNameFormatted} 10% Tithe`}
              </Text>
            </View>

            <View
              style={[
                styles.titheBadge,
                {
                  backgroundColor: isTitheFulfilled ? theme.success + '20' : theme.warning + '20',
                  borderColor: isTitheFulfilled ? theme.success : theme.warning,
                },
              ]}
            >
              <Text style={[styles.titheBadgeText, { color: isTitheFulfilled ? theme.success : theme.warning }]}>
                {isTitheFulfilled
                  ? isTamil
                    ? 'செலுத்தப்பட்டது ✓'
                    : '10% Fulfilled ✓'
                  : isTamil
                  ? 'செலுத்த வேண்டியது'
                  : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.titheMetrics}>
            <View style={styles.titheMetricItem}>
              <Text style={[styles.titheMetricLabel, { color: theme.textMuted }]}>
                {isTamil ? '10% இலக்கு' : '10% Goal'}
              </Text>
              <Text style={[styles.titheMetricVal, { color: theme.primary }]}>
                {currencySym}{monthlyMetrics.expectedTithe.toLocaleString()}
              </Text>
            </View>

            <View style={styles.titheMetricItem}>
              <Text style={[styles.titheMetricLabel, { color: theme.textMuted }]}>
                {isTamil ? 'செலுத்தியது' : 'Paid'}
              </Text>
              <Text style={[styles.titheMetricVal, { color: theme.titheColor }]}>
                {currencySym}{monthlyMetrics.tithes.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.titheTrack, { backgroundColor: theme.cardAlt }]}>
            <View
              style={[
                styles.titheFill,
                {
                  width: `${Math.min(100, monthlyMetrics.expectedTithe > 0 ? (monthlyMetrics.tithes / monthlyMetrics.expectedTithe) * 100 : 0)}%`,
                  backgroundColor: isTitheFulfilled ? theme.success : theme.primary,
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* DIGITAL EXPENSE VISUAL CHART FOR SELECTED MONTH */}
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
          <View style={styles.chartHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <PieChart size={17} color={theme.primary} />
              <Text style={[styles.chartTitle, { color: theme.text }]}>
                {isTamil ? `${monthNameFormatted} செலவுப் பகுப்பாய்வு` : `${monthNameFormatted} Expense Chart`}
              </Text>
            </View>
            <Text style={[styles.chartTotalAmt, { color: theme.expenseColor }]}>
              {currencySym}{monthlyMetrics.expense.toLocaleString()}
            </Text>
          </View>

          {/* Digital Multi-Segment Bar */}
          {expenseByCategory.length > 0 ? (
            <>
              <View style={styles.multiSegmentBar}>
                {expenseByCategory.map((item, idx) => (
                  <View
                    key={item.category}
                    style={{
                      flex: Math.max(1, item.percentage),
                      backgroundColor: chartColors[idx % chartColors.length],
                      height: 10,
                      borderRadius: 3,
                    }}
                  />
                ))}
              </View>

              {/* Category Breakdown list */}
              <View style={styles.chartLegendGrid}>
                {expenseByCategory.map((item, idx) => (
                  <View key={item.category} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: chartColors[idx % chartColors.length] },
                      ]}
                    />
                    <Text style={[styles.legendName, { color: theme.text }]} numberOfLines={1}>
                      {item.category}
                    </Text>
                    <Text style={[styles.legendPercent, { color: chartColors[idx % chartColors.length] }]}>
                      {item.percentage}%
                    </Text>
                    <Text style={[styles.legendAmount, { color: theme.textMuted }]}>
                      {currencySym}{item.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={[styles.emptyChartText, { color: theme.textMuted }]}>
              {isTamil ? `${monthNameFormatted}-ல் செலவுப் பதிவுகள் எதுவும் இல்லை` : `No expenses recorded in ${monthNameFormatted}.`}
            </Text>
          )}
        </View>

        {/* TRANSACTION HISTORY & TABS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isTamil ? `${monthNameFormatted} பரிவர்த்தனைகள்` : `${monthNameFormatted} Transactions`}
          </Text>
        </View>

        <View style={[styles.filterBar, { backgroundColor: theme.cardAlt }]}>
          {(['all', 'income', 'expense', 'giving', 'savings'] as const).map((filterKey) => {
            const isSel = activeFilter === filterKey;
            return (
              <TouchableOpacity
                key={filterKey}
                style={[styles.filterBtn, isSel && { backgroundColor: theme.primary }]}
                onPress={() => setActiveFilter(filterKey)}
              >
                <Text style={[styles.filterBtnText, { color: isSel ? '#000' : theme.textMuted }]}>
                  {filterKey === 'all'
                    ? isTamil
                      ? 'அனைத்தும்'
                      : 'All'
                    : filterKey === 'income'
                    ? isTamil
                      ? 'வரவு'
                      : 'Income'
                    : filterKey === 'expense'
                    ? isTamil
                      ? 'செலவு'
                      : 'Expense'
                    : filterKey === 'giving'
                    ? isTamil
                      ? 'தசமபாகம்'
                      : 'Tithe'
                    : isTamil
                    ? 'சேமிப்பு'
                    : 'Savings'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TRANSACTIONS LIST FOR SELECTED MONTH */}
        <View style={styles.txList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const isInc = tx.type === 'income';
              const isSav = tx.type === 'savings';
              const isGiv = tx.type === 'tithe' || tx.type === 'offering' || tx.type === 'benevolence';
              const tagColor = isInc ? theme.incomeColor : isSav ? theme.balanceColor : isGiv ? theme.primary : theme.expenseColor;

              return (
                <View
                  key={tx.id}
                  style={[styles.txCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}
                >
                  <View style={[styles.txIconBox, { backgroundColor: tagColor + '20' }]}>
                    {isInc ? (
                      <ArrowDown size={16} color={theme.incomeColor} />
                    ) : isSav ? (
                      <Coins size={16} color={theme.balanceColor} />
                    ) : isGiv ? (
                      <Heart size={16} color={theme.primary} />
                    ) : (
                      <ArrowUp size={16} color={theme.expenseColor} />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txCategory, { color: theme.text }]}>{tx.category}</Text>
                    <Text style={[styles.txNote, { color: theme.textMuted }]} numberOfLines={1}>
                      {tx.note}
                    </Text>
                    <Text style={[styles.txDate, { color: theme.textMuted }]}>{tx.date}</Text>
                  </View>

                  <View style={styles.txRightCol}>
                    <Text style={[styles.txAmount, { color: isInc ? theme.incomeColor : isSav ? theme.balanceColor : theme.text }]}>
                      {isInc ? '+' : '-'}{currencySym}{tx.amount.toLocaleString()}
                    </Text>
                    <TouchableOpacity onPress={() => deleteTransaction(tx.id)} style={styles.deleteTxBtn}>
                      <Trash2 size={13} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <HandCoins size={32} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {isTamil ? `${monthNameFormatted}-ல் பதிவுகள் எதுவும் இல்லை` : `No records for ${monthNameFormatted}.`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Transaction Modal with Selected Month Seed */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultType={modalDefaultType}
        defaultDate={`${selectedYearMonthStr}-01`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.hero + 40,
  },
  monthNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenterCol: {
    alignItems: 'center',
  },
  monthNavTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  jumpToCurrentText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  balanceCard: {
    padding: spacing.md + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  newLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  newLogBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  carryForwardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginVertical: 6,
  },
  carryForwardLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  carryForwardVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  balanceBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 8,
  },
  balanceSubCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceSubLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  balanceSubVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  vertDivider: {
    width: 1,
    height: 24,
  },
  actionTilesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  directLogTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  directLogTileText: {
    fontSize: 11,
    fontWeight: '800',
  },
  titheCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  titheHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titheHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  titheBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  titheBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  titheMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titheMetricItem: {
    alignItems: 'flex-start',
  },
  titheMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  titheMetricVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  titheTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  titheFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  chartTotalAmt: {
    fontSize: 13,
    fontWeight: '800',
  },
  multiSegmentBar: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 12,
  },
  chartLegendGrid: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: '800',
    minWidth: 32,
    textAlign: 'right',
  },
  legendAmount: {
    fontSize: 11,
    minWidth: 55,
    textAlign: 'right',
  },
  emptyChartText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  filterBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  txList: {
    gap: 8,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 10,
  },
  txIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txCategory: {
    fontSize: 13,
    fontWeight: '700',
  },
  txNote: {
    fontSize: 11,
    marginTop: 1,
  },
  txDate: {
    fontSize: 9,
    marginTop: 1,
  },
  txRightCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  deleteTxBtn: {
    marginTop: 3,
    padding: 2,
  },
  emptyBox: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
  },
});
