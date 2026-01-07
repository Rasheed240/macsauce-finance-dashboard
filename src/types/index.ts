export type TransactionCategory =
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills & Utilities'
  | 'Healthcare'
  | 'Income'
  | 'Transfer'
  | 'Investment'
  | 'Other';

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: TransactionCategory;
  merchant?: string;
  balance?: number;
  originalCategory?: TransactionCategory;
  userModified?: boolean;
};

export type ParsedCSV = {
  transactions: Transaction[];
  headers: string[];
  errors: string[];
  rowCount: number;
};

export type CategoryTotal = {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  count: number;
  trend?: number;
};

export type MerchantSpending = {
  merchant: string;
  amount: number;
  count: number;
  category: TransactionCategory;
};

export type MonthlyData = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export type DailySpending = {
  date: string;
  amount: number;
};

export type Insights = {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  topMerchants: MerchantSpending[];
  categoryBreakdown: CategoryTotal[];
  dailyAverage: number;
  burnRate: number;
  unusualTransactions: Transaction[];
  monthlyComparison: MonthlyData[];
  spendingTrend: DailySpending[];
};

export type UserPreferences = {
  categoryMappings: Record<string, TransactionCategory>;
  merchantMappings: Record<string, TransactionCategory>;
};

export type AIProvider = {
  name: 'claude' | 'gemini';
  apiKey: string;
  model: string;
};

export type AIInsight = {
  summary: string;
  recommendations: string[];
  warnings: string[];
  opportunities: string[];
};
