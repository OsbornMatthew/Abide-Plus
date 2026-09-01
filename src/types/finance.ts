export type TransactionType = 'income' | 'expense' | 'tithe' | 'offering' | 'benevolence' | 'savings';

export type IncomeCategory =
  | 'Salary'
  | 'Business'
  | 'Freelance'
  | 'Investments'
  | 'Gift'
  | 'Firstfruits'
  | 'Other Income';

export type ExpenseCategory =
  | 'Housing & Rent'
  | 'Groceries & Food'
  | 'Transport & Fuel'
  | 'Utilities & Bills'
  | 'Healthcare & Meds'
  | 'Family & Kids'
  | 'Debt & Loans'
  | 'Education'
  | 'Personal Care'
  | 'Leisure & Dining'
  | 'Miscellaneous';

export type GivingCategory =
  | 'Tithe (10%)'
  | 'Firstfruits'
  | 'Missions & Evang.'
  | 'Church Building'
  | 'Benevolence / Alms'
  | 'Sunday Offering'
  | 'Thanksgiving Offering';

export type SavingsCategory =
  | 'Emergency Fund'
  | 'Future Investments'
  | 'Family & Kids'
  | 'Children Education'
  | 'Home & Land'
  | 'Church Project'
  | 'General Savings';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory | GivingCategory | SavingsCategory | string;
  note?: string;
  date: string; // ISO format (YYYY-MM-DD)
  recipientOrSource?: string; // e.g. "Local Church", "Acme Corp"
  isTitheDeducted?: boolean; // for income items, whether 10% was already calculated
}

export interface BudgetGoal {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  spent: number;
}

export interface GivingPledge {
  id: string;
  type: 'tithe' | 'faith_promise' | 'building_fund' | 'missionary';
  targetAmount: number;
  fulfilledAmount: number;
  year: number;
  recipient: string;
}

export interface CurrencySetting {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencySetting[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
];
