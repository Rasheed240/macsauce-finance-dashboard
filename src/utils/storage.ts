import { Transaction, UserPreferences, AIProvider } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finance_dashboard_transactions',
  PREFERENCES: 'finance_dashboard_preferences',
  AI_PROVIDER: 'finance_dashboard_ai_provider',
};

export function saveTransactions(transactions: Transaction[]): void {
  try {
    const serialized = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, serialized);
  } catch (error) {
    console.error('Failed to save transactions:', error);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!serialized) return [];

    const parsed = JSON.parse(serialized);
    // Convert date strings back to Date objects
    return parsed.map((t: any) => ({
      ...t,
      date: new Date(t.date),
    }));
  } catch (error) {
    console.error('Failed to load transactions:', error);
    return [];
  }
}

export function saveUserPreferences(preferences: UserPreferences): void {
  try {
    const serialized = JSON.stringify(preferences);
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, serialized);
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function loadUserPreferences(): UserPreferences {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!serialized) return { categoryMappings: {}, merchantMappings: {} };

    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return { categoryMappings: {}, merchantMappings: {} };
  }
}

export function saveAIProvider(provider: AIProvider | null): void {
  try {
    if (provider) {
      const serialized = JSON.stringify(provider);
      localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, serialized);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AI_PROVIDER);
    }
  } catch (error) {
    console.error('Failed to save AI provider:', error);
  }
}

export function loadAIProvider(): AIProvider | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.AI_PROVIDER);
    if (!serialized) return null;

    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load AI provider:', error);
    return null;
  }
}

export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

export function exportData(): string {
  const transactions = loadTransactions();
  const preferences = loadUserPreferences();
  const aiProvider = loadAIProvider();

  return JSON.stringify({
    transactions,
    preferences,
    aiProvider,
    exportDate: new Date().toISOString(),
  }, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.transactions) {
      saveTransactions(data.transactions);
    }

    if (data.preferences) {
      saveUserPreferences(data.preferences);
    }

    if (data.aiProvider) {
      saveAIProvider(data.aiProvider);
    }

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
