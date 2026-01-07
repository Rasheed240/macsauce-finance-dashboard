import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Sparkles } from 'lucide-react';
import { Insights } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/analytics';
import { SpendingTrendChart } from '../charts/SpendingTrendChart';
import { CategoryBreakdownChart } from '../charts/CategoryBreakdownChart';
import { TopMerchantsChart } from '../charts/TopMerchantsChart';
import { MonthlyComparisonChart } from '../charts/MonthlyComparisonChart';

interface Props {
  insights: Insights;
  onGenerateAIInsights?: () => void;
  isGeneratingAI?: boolean;
}

export function Dashboard({ insights, onGenerateAIInsights, isGeneratingAI }: Props) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Income"
          value={formatCurrency(insights.totalIncome)}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(insights.totalExpenses)}
          icon={<TrendingDown className="h-6 w-6" />}
          color="red"
        />
        <MetricCard
          title="Net Savings"
          value={formatCurrency(insights.netSavings)}
          icon={<DollarSign className="h-6 w-6" />}
          color={insights.netSavings >= 0 ? 'green' : 'red'}
          subtitle={`${insights.savingsRate.toFixed(1)}% savings rate`}
        />
        <MetricCard
          title="Daily Average"
          value={formatCurrency(insights.dailyAverage)}
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
          subtitle={`${insights.burnRate.toFixed(0)} days runway`}
        />
      </div>

      {/* AI Insights Button */}
      {onGenerateAIInsights && (
        <button
          onClick={onGenerateAIInsights}
          disabled={isGeneratingAI}
          className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className={`h-5 w-5 text-purple-400 ${isGeneratingAI ? 'animate-pulse' : ''}`} />
            <span className="text-purple-300 font-medium">
              {isGeneratingAI ? 'Generating AI Insights...' : 'Generate AI-Powered Insights'}
            </span>
          </div>
        </button>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <ChartCard title="Spending Trend" description="Daily spending over time">
          <SpendingTrendChart data={insights.spendingTrend} />
        </ChartCard>

        {/* Category Breakdown */}
        <ChartCard title="Category Breakdown" description="Where your money goes">
          <CategoryBreakdownChart data={insights.categoryBreakdown} />
        </ChartCard>

        {/* Top Merchants */}
        <ChartCard title="Top Merchants" description="Your most frequent purchases">
          <TopMerchantsChart data={insights.topMerchants} />
        </ChartCard>

        {/* Monthly Comparison */}
        <ChartCard title="Monthly Comparison" description="Income vs Expenses by month">
          <MonthlyComparisonChart data={insights.monthlyComparison} />
        </ChartCard>
      </div>

      {/* Category Details */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Category Details</h3>
        <div className="space-y-3">
          {insights.categoryBreakdown.map((category) => (
            <div key={category.category} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-200 font-medium">{category.category}</span>
                  <span className="text-gray-400 text-sm">{category.count} transactions</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-gray-200 font-semibold">{formatCurrency(category.amount)}</div>
                <div className="text-gray-400 text-sm">{category.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unusual Transactions */}
      {insights.unusualTransactions.length > 0 && (
        <div className="glass-card p-6 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <h3 className="text-xl font-semibold text-yellow-400">Unusual Transactions</h3>
          </div>
          <div className="space-y-2">
            {insights.unusualTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                <div>
                  <div className="text-gray-200">{transaction.merchant || transaction.description}</div>
                  <div className="text-sm text-gray-400">{transaction.date.toLocaleDateString()}</div>
                </div>
                <div className="text-red-400 font-semibold">{formatCurrency(transaction.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'purple';
  subtitle?: string;
}

function MetricCard({ title, value, icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-start justify-between mb-2">
        <div className={colorClasses[color]}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
