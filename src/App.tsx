import { useState, useEffect } from 'react';
import { BarChart3, Upload, Table as TableIcon, Trash2, Download, Settings, Sparkles } from 'lucide-react';
import { Transaction, TransactionCategory, AIProvider, AIInsight } from './types';
import { calculateInsights } from './utils/analytics';
import { saveTransactions, loadTransactions, clearAllData, exportData, saveUserPreferences, loadUserPreferences, saveAIProvider, loadAIProvider } from './utils/storage';
import { generateSampleTransactions } from './data/sampleData';
import { CSVUpload } from './components/upload/CSVUpload';
import { Dashboard } from './components/dashboard/Dashboard';
import { TransactionTable } from './components/transactions/TransactionTable';
import { generateAIInsights, validateAPIKey } from './utils/aiInsights';

type View = 'upload' | 'dashboard' | 'transactions';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentView, setCurrentView] = useState<View>('upload');
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedTransactions = loadTransactions();
    const savedAIProvider = loadAIProvider();

    if (savedTransactions.length > 0) {
      setTransactions(savedTransactions);
      setCurrentView('dashboard');
    }

    if (savedAIProvider) {
      setAiProvider(savedAIProvider);
    }
  }, []);

  // Save transactions whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions(transactions);
    }
  }, [transactions]);

  const handleTransactionsLoaded = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    setCurrentView('dashboard');
  };

  const handleCategoryChange = (transactionId: string, newCategory: TransactionCategory) => {
    setTransactions(prev => {
      const updated = prev.map(t =>
        t.id === transactionId
          ? { ...t, category: newCategory, userModified: true }
          : t
      );

      // Save user preference for this merchant
      const transaction = prev.find(t => t.id === transactionId);
      if (transaction?.merchant) {
        const prefs = loadUserPreferences();
        prefs.merchantMappings[transaction.merchant.toLowerCase()] = newCategory;
        saveUserPreferences(prefs);
      }

      return updated;
    });
  };

  const handleLoadDemo = () => {
    const demoData = generateSampleTransactions();
    setTransactions(demoData);
    setCurrentView('dashboard');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      setTransactions([]);
      setCurrentView('upload');
      setAiInsight(null);
    }
  };

  const handleExportData = () => {
    const jsonData = exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateAIInsights = async () => {
    if (!aiProvider || !validateAPIKey(aiProvider)) {
      setShowAIConfig(true);
      return;
    }

    setIsGeneratingAI(true);
    try {
      const insights = calculateInsights(transactions);
      const aiInsight = await generateAIInsights(insights, aiProvider);
      setAiInsight(aiInsight);
    } catch (error) {
      alert(`Failed to generate AI insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveAIProvider = (name: 'claude' | 'gemini', apiKey: string, model: string) => {
    const provider: AIProvider = { name, apiKey, model };
    setAiProvider(provider);
    saveAIProvider(provider);
    setShowAIConfig(false);
  };

  const insights = calculateInsights(transactions);
  const hasData = transactions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  Finance Dashboard
                </h1>
                <p className="text-xs text-gray-400">Privacy-first personal finance tracker</p>
              </div>
            </div>

            {hasData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    currentView === 'dashboard'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('transactions')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    currentView === 'transactions'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <TableIcon className="h-4 w-4" />
                  Transactions
                </button>
                <button
                  onClick={() => setCurrentView('upload')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    currentView === 'upload'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-all"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Settings Dropdown */}
          {showSettings && hasData && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 animate-slide-up">
              <div className="flex gap-2">
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </button>
                <button
                  onClick={() => setShowAIConfig(true)}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Configure AI
                </button>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'upload' && (
          <div className="animate-fade-in">
            <CSVUpload onTransactionsLoaded={handleTransactionsLoaded} />

            {!hasData && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadDemo}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-lg hover:from-primary-600 hover:to-purple-700 transition-all font-medium"
                >
                  Load Demo Data
                </button>
                <p className="text-sm text-gray-400 mt-2">Try the dashboard with sample transactions</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'dashboard' && hasData && (
          <div className="animate-fade-in">
            {aiInsight && (
              <div className="mb-6 p-6 glass-card border-purple-500/30 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-purple-400">AI Insights</h3>
                </div>
                <p className="text-gray-300 mb-4">{aiInsight.summary}</p>

                {aiInsight.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {aiInsight.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsight.warnings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2">Warnings</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {aiInsight.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsight.opportunities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">Opportunities</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {aiInsight.opportunities.map((opp, i) => (
                        <li key={i}>{opp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Dashboard
              insights={insights}
              onGenerateAIInsights={aiProvider ? handleGenerateAIInsights : undefined}
              isGeneratingAI={isGeneratingAI}
            />
          </div>
        )}

        {currentView === 'transactions' && hasData && (
          <div className="glass-card p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-200 mb-6">All Transactions</h2>
            <TransactionTable
              transactions={transactions}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        )}
      </main>

      {/* AI Configuration Modal */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 animate-slide-up">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Configure AI Provider</h3>

            <AIConfigForm
              onSave={handleSaveAIProvider}
              onCancel={() => setShowAIConfig(false)}
              currentProvider={aiProvider}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-gray-400 text-sm">
        <p>Your data never leaves your device • All processing happens in your browser</p>
      </footer>
    </div>
  );
}

interface AIConfigFormProps {
  onSave: (name: 'claude' | 'gemini', apiKey: string, model: string) => void;
  onCancel: () => void;
  currentProvider: AIProvider | null;
}

function AIConfigForm({ onSave, onCancel, currentProvider }: AIConfigFormProps) {
  const [provider, setProvider] = useState<'claude' | 'gemini'>(currentProvider?.name || 'claude');
  const [apiKey, setApiKey] = useState(currentProvider?.apiKey || '');
  const [model, setModel] = useState(currentProvider?.model || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      alert('Please enter an API key');
      return;
    }
    onSave(provider, apiKey, model);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as 'claude' | 'gemini')}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="claude">Claude (Anthropic)</option>
          <option value="gemini">Gemini (Google)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={provider === 'claude' ? 'sk-ant-...' : 'AIza...'}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Model (Optional)</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={provider === 'claude' ? 'claude-3-5-sonnet-20241022' : 'gemini-pro'}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-medium"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default App;
