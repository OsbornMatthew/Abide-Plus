export interface ColorPalette {
  background: string;
  card: string;
  cardBorder: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  textLight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentGold: string;
  accentSage: string;
  accentPurple: string;
  accentCyan: string;
  taskColor: string;
  titheColor: string;
  offeringColor: string;
  expenseColor: string;
  incomeColor: string;
  balanceColor: string;
  success: string;
  warning: string;
  danger: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  ringBg: string;
  cardShadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export const darkTheme: ColorPalette = {
  background: '#070B14',      // Ultra deep dark OLED slate
  card: '#0F172A',            // Rich obsidian navy
  cardBorder: 'rgba(245, 158, 11, 0.22)', // Radiant gold shimmer
  cardAlt: '#1E293B',         // Elevated dark surface
  text: '#F8FAFC',            // Crisp modern white
  textMuted: '#94A3B8',       // Sleek muted slate
  textLight: '#CBD5E1',
  primary: '#F59E0B',         // Vibrant Electric Gold / Amber
  primaryLight: '#FCD34D',
  primaryDark: '#D97706',
  accent: '#F59E0B',
  accentGold: '#FFB800',
  accentSage: '#10B981',      // Holy Peace Emerald
  accentPurple: '#8B5CF6',    // Electric Royal Violet
  accentCyan: '#06B6D4',      // Living Water Cyan
  taskColor: '#38BDF8',       // Radiant Crystal Sky Blue for Tasks
  titheColor: '#10B981',      // Vibrant Kingdom Green for Tithe
  offeringColor: '#F59E0B',   // Vibrant Amber
  expenseColor: '#FF3366',    // Vibrant Electric Coral / Rose
  incomeColor: '#00E676',     // Neon Emerald Green
  balanceColor: '#38BDF8',    // Crystal Sky Blue / Savings
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  tabBar: '#0B1120',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
  tabBarActive: '#F59E0B',
  tabBarInactive: '#64748B',
  ringBg: '#1E293B',
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
};

export const lightTheme: ColorPalette = {
  background: '#F8FAFC',      // Soft, clean porcelain slate (calm & modern)
  card: '#FFFFFF',            // Crisp pure white card surface
  cardBorder: '#E2E8F0',      // Soft slate-200 border for clean structure
  cardAlt: '#F1F5F9',         // Subtle cool slate-100 container
  text: '#0F172A',            // Deep slate-900 typography
  textMuted: '#64748B',       // Balanced slate-500 secondary text
  textLight: '#334155',       // Slate-700 readable body text
  primary: '#D97706',         // Warm Polished Amber Gold (non-glaring)
  primaryLight: '#F59E0B',
  primaryDark: '#B45309',
  accent: '#D97706',
  accentGold: '#D97706',
  accentSage: '#059669',
  accentPurple: '#7C3AED',
  accentCyan: '#0284C7',
  taskColor: '#0284C7',       // Crisp Sky Blue for Tasks
  titheColor: '#059669',      // Deep Royal Emerald for Tithes
  offeringColor: '#D97706',
  expenseColor: '#E11D48',    // Sophisticated Rose for Expenses
  incomeColor: '#16A34A',     // Harmonious Green for Income
  balanceColor: '#0284C7',    // Sky Blue for Net Balance & Savings
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#D97706',
  tabBarInactive: '#94A3B8',
  ringBg: '#E2E8F0',
  cardShadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};
