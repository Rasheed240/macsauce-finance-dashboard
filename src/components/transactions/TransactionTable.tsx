import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import { Transaction, TransactionCategory } from '../../types';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/analytics';

interface Props {
  transactions: Transaction[];
  onCategoryChange: (transactionId: string, category: TransactionCategory) => void;
}

type SortField = 'date' | 'amount' | 'description' | 'category';
type SortDirection = 'asc' | 'desc';

const CATEGORIES: TransactionCategory[] = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Income',
  'Transfer',
  'Investment',
  'Other',
];

export function TransactionTable({ transactions, onCategoryChange }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, searchTerm, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getCategoryColor = (category: TransactionCategory) => {
    const colors: Record<TransactionCategory, string> = {
      'Food & Dining': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Transport': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Shopping': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Entertainment': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Bills & Utilities': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Healthcare': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Income': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Transfer': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Investment': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Other': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[category];
  };

  return (
    <div className="w-full">
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
              ${showFilters
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }
            `}
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg animate-slide-up">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TransactionCategory | 'All')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  {sortField === 'date' && <ArrowUpDown className="h-4 w-4" />}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-2">
                  Description
                  {sortField === 'description' && <ArrowUpDown className="h-4 w-4" />}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-2">
                  Category
                  {sortField === 'category' && <ArrowUpDown className="h-4 w-4" />}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-sm font-medium text-gray-300 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-2">
                  Amount
                  {sortField === 'amount' && <ArrowUpDown className="h-4 w-4" />}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-300">
                  {format(transaction.date, 'MMM dd, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm text-gray-200">{transaction.merchant || transaction.description}</div>
                    {transaction.merchant && (
                      <div className="text-xs text-gray-500">{transaction.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={transaction.category}
                    onChange={(e) => onCategoryChange(transaction.id, e.target.value as TransactionCategory)}
                    className={`
                      px-2 py-1 rounded text-xs font-medium border cursor-pointer
                      bg-transparent transition-colors
                      ${getCategoryColor(transaction.category)}
                    `}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-gray-800 text-gray-200">{cat}</option>
                    ))}
                  </select>
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}
