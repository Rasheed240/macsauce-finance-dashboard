import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MerchantSpending } from '../../types';
import { formatCurrency } from '../../utils/analytics';

interface Props {
  data: MerchantSpending[];
}

export function TopMerchantsChart({ data }: Props) {
  const chartData = data.map(item => ({
    merchant: item.merchant.length > 15 ? item.merchant.substring(0, 15) + '...' : item.merchant,
    amount: item.amount,
    count: item.count,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            type="number"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            type="category"
            dataKey="merchant"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${formatCurrency(value)} (${props.payload.count} transactions)`,
              'Spending',
            ]}
          />
          <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
