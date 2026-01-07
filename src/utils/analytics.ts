import { format, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';
import {
  Transaction,
  Insights,
  CategoryTotal,
  MerchantSpending,
  MonthlyData,
  DailySpending,
  TransactionCategory,
} from '../types';

export function calculateInsights(transactions: Transaction[]): Insights {
  if (transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      savingsRate: 0,
      topMerchants: [],
      categoryBreakdown: [],
      dailyAverage: 0,
      burnRate: 0,
      unusualTransactions: [],
      monthlyComparison: [],
      spendingTrend: [],
    };
  }

  const income = transactions
    .filter(t => t.amount > 0 && (t.category === 'Income' || t.category === 'Transfer'))
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netSavings = income - expenses;
  const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

  // Category breakdown
  const categoryMap = new Map<TransactionCategory, { amount: number; count: number }>();
  transactions.forEach(t => {
    if (t.amount < 0) {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + Math.abs(t.amount),
        count: existing.count + 1,
      });
    }
  });

  const categoryBreakdown: CategoryTotal[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: expenses > 0 ? (data.amount / expenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top merchants
  const merchantMap = new Map<string, { amount: number; count: number; category: TransactionCategory }>();
  transactions.forEach(t => {
    if (t.amount < 0 && t.merchant) {
      const existing = merchantMap.get(t.merchant) || { amount: 0, count: 0, category: t.category };
      merchantMap.set(t.merchant, {
        amount: existing.amount + Math.abs(t.amount),
        count: existing.count + 1,
        category: t.category,
      });
    }
  });

  const topMerchants: MerchantSpending[] = Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      count: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Daily average
  const dates = transactions.map(t => t.date);
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const dayCount = differenceInDays(newestDate, oldestDate) || 1;
  const dailyAverage = expenses / dayCount;

  // Burn rate (days until money runs out)
  const currentBalance = transactions[0]?.balance || netSavings;
  const burnRate = dailyAverage > 0 ? currentBalance / dailyAverage : 0;

  // Unusual transactions (>2 standard deviations from mean)
  const expenseAmounts = transactions
    .filter(t => t.amount < 0)
    .map(t => Math.abs(t.amount));

  if (expenseAmounts.length > 0) {
    const mean = expenseAmounts.reduce((sum, a) => sum + a, 0) / expenseAmounts.length;
    const variance = expenseAmounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / expenseAmounts.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + (2 * stdDev);

    var unusualTransactions = transactions
      .filter(t => t.amount < 0 && Math.abs(t.amount) > threshold)
      .slice(0, 5);
  } else {
    var unusualTransactions: Transaction[] = [];
  }

  // Monthly comparison
  const monthlyMap = new Map<string, { income: number; expenses: number }>();
  transactions.forEach(t => {
    const month = format(t.date, 'MMM yyyy');
    const existing = monthlyMap.get(month) || { income: 0, expenses: 0 };

    if (t.amount > 0 && (t.category === 'Income' || t.category === 'Transfer')) {
      existing.income += t.amount;
    } else if (t.amount < 0) {
      existing.expenses += Math.abs(t.amount);
    }

    monthlyMap.set(month, existing);
  });

  const monthlyComparison: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  // Spending trend (daily)
  const dailyMap = new Map<string, number>();
  transactions.forEach(t => {
    if (t.amount < 0) {
      const day = format(t.date, 'yyyy-MM-dd');
      const existing = dailyMap.get(day) || 0;
      dailyMap.set(day, existing + Math.abs(t.amount));
    }
  });

  const spendingTrend: DailySpending[] = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netSavings,
    savingsRate,
    topMerchants,
    categoryBreakdown,
    dailyAverage,
    burnRate,
    unusualTransactions,
    monthlyComparison,
    spendingTrend,
  };
}

export function getCategoryTrend(
  transactions: Transaction[],
  category: TransactionCategory,
  months: number = 2
): number {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthTotal = transactions
    .filter(t =>
      t.category === category &&
      t.amount < 0 &&
      t.date >= currentMonthStart &&
      t.date <= currentMonthEnd
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const previousMonthTotal = transactions
    .filter(t =>
      t.category === category &&
      t.amount < 0 &&
      t.date >= previousMonthStart &&
      t.date <= previousMonthEnd
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (previousMonthTotal === 0) return 0;

  return ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
