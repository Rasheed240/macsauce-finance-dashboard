import { TransactionCategory } from '../types';

// Comprehensive merchant patterns for auto-categorization
const MERCHANT_PATTERNS: Record<string, TransactionCategory> = {
  // Food & Dining
  'MCDONALD': 'Food & Dining',
  'BURGER KING': 'Food & Dining',
  'SUBWAY': 'Food & Dining',
  'STARBUCKS': 'Food & Dining',
  'DUNKIN': 'Food & Dining',
  'KFC': 'Food & Dining',
  'PIZZA': 'Food & Dining',
  'RESTAURANT': 'Food & Dining',
  'CAFE': 'Food & Dining',
  'COFFEE': 'Food & Dining',
  'CHIPOTLE': 'Food & Dining',
  'PANERA': 'Food & Dining',
  'DOMINO': 'Food & Dining',
  'TACO BELL': 'Food & Dining',
  'WENDYS': 'Food & Dining',
  'CHICK-FIL-A': 'Food & Dining',
  'GRUBHUB': 'Food & Dining',
  'DOORDASH': 'Food & Dining',
  'UBEREATS': 'Food & Dining',
  'UBER EATS': 'Food & Dining',
  'SEAMLESS': 'Food & Dining',
  'POSTMATES': 'Food & Dining',
  'INSTACART': 'Food & Dining',
  'WHOLE FOODS': 'Food & Dining',
  'TRADER JOE': 'Food & Dining',
  'SAFEWAY': 'Food & Dining',
  'KROGER': 'Food & Dining',
  'WALMART GROCERY': 'Food & Dining',
  'PUBLIX': 'Food & Dining',

  // Transport
  'UBER': 'Transport',
  'LYFT': 'Transport',
  'GAS': 'Transport',
  'SHELL': 'Transport',
  'EXXON': 'Transport',
  'CHEVRON': 'Transport',
  'BP ': 'Transport',
  'MOBIL': 'Transport',
  'PARKING': 'Transport',
  'TOLL': 'Transport',
  'TRANSIT': 'Transport',
  'METRO': 'Transport',
  'BUS': 'Transport',
  'TRAIN': 'Transport',
  'AIRLINE': 'Transport',
  'FLIGHT': 'Transport',
  'DELTA': 'Transport',
  'UNITED': 'Transport',
  'AMERICAN AIRLINES': 'Transport',
  'SOUTHWEST': 'Transport',
  'HERTZ': 'Transport',
  'ENTERPRISE': 'Transport',
  'CAR RENTAL': 'Transport',

  // Shopping
  'AMAZON': 'Shopping',
  'AMZN': 'Shopping',
  'TARGET': 'Shopping',
  'WALMART': 'Shopping',
  'COSTCO': 'Shopping',
  'BEST BUY': 'Shopping',
  'APPLE STORE': 'Shopping',
  'MACYS': 'Shopping',
  'NORDSTROM': 'Shopping',
  'HOME DEPOT': 'Shopping',
  'LOWES': 'Shopping',
  'IKEA': 'Shopping',
  'ETSY': 'Shopping',
  'EBAY': 'Shopping',
  'KOHLS': 'Shopping',
  'CVS': 'Shopping',
  'WALGREENS': 'Shopping',
  'RITE AID': 'Shopping',

  // Entertainment
  'NETFLIX': 'Entertainment',
  'HULU': 'Entertainment',
  'DISNEY+': 'Entertainment',
  'HBO': 'Entertainment',
  'SPOTIFY': 'Entertainment',
  'APPLE MUSIC': 'Entertainment',
  'YOUTUBE': 'Entertainment',
  'PRIME VIDEO': 'Entertainment',
  'STEAM': 'Entertainment',
  'PLAYSTATION': 'Entertainment',
  'XBOX': 'Entertainment',
  'NINTENDO': 'Entertainment',
  'TWITCH': 'Entertainment',
  'MOVIE': 'Entertainment',
  'CINEMA': 'Entertainment',
  'THEATER': 'Entertainment',
  'CONCERT': 'Entertainment',
  'GYM': 'Entertainment',
  'FITNESS': 'Entertainment',
  'PELOTON': 'Entertainment',

  // Bills & Utilities
  'ELECTRIC': 'Bills & Utilities',
  'POWER': 'Bills & Utilities',
  'WATER': 'Bills & Utilities',
  'GAS UTILITY': 'Bills & Utilities',
  'INTERNET': 'Bills & Utilities',
  'COMCAST': 'Bills & Utilities',
  'VERIZON': 'Bills & Utilities',
  'AT&T': 'Bills & Utilities',
  'T-MOBILE': 'Bills & Utilities',
  'SPRINT': 'Bills & Utilities',
  'PHONE': 'Bills & Utilities',
  'INSURANCE': 'Bills & Utilities',
  'RENT': 'Bills & Utilities',
  'MORTGAGE': 'Bills & Utilities',
  'LOAN': 'Bills & Utilities',

  // Healthcare
  'PHARMACY': 'Healthcare',
  'DOCTOR': 'Healthcare',
  'HOSPITAL': 'Healthcare',
  'MEDICAL': 'Healthcare',
  'DENTAL': 'Healthcare',
  'VISION': 'Healthcare',
  'HEALTH': 'Healthcare',
  'CLINIC': 'Healthcare',

  // Income
  'SALARY': 'Income',
  'PAYROLL': 'Income',
  'DEPOSIT': 'Income',
  'DIRECT DEP': 'Income',
  'PAYMENT RECEIVED': 'Income',
  'REFUND': 'Income',
  'INTEREST': 'Income',
  'DIVIDEND': 'Income',

  // Transfer
  'TRANSFER': 'Transfer',
  'VENMO': 'Transfer',
  'PAYPAL': 'Transfer',
  'ZELLE': 'Transfer',
  'CASH APP': 'Transfer',
  'WITHDRAWAL': 'Transfer',
  'ATM': 'Transfer',

  // Investment
  'ROBINHOOD': 'Investment',
  'FIDELITY': 'Investment',
  'VANGUARD': 'Investment',
  'SCHWAB': 'Investment',
  'E*TRADE': 'Investment',
  'COINBASE': 'Investment',
  'CRYPTO': 'Investment',
};

export function categorizeTransaction(description: string): TransactionCategory {
  const upperDesc = description.toUpperCase();

  // Check for exact and partial matches
  for (const [pattern, category] of Object.entries(MERCHANT_PATTERNS)) {
    if (upperDesc.includes(pattern)) {
      return category;
    }
  }

  // Fallback patterns
  if (upperDesc.includes('PAYMENT') || upperDesc.includes('PURCHASE')) {
    return 'Other';
  }

  return 'Other';
}

export function extractMerchantName(description: string): string {
  // Remove common prefixes and suffixes
  let merchant = description
    .replace(/^(DEBIT CARD PURCHASE|CREDIT CARD PURCHASE|ACH|CHECK|POS|ONLINE)\s*/i, '')
    .replace(/\s*#\d+.*$/, '') // Remove transaction IDs
    .replace(/\s*\d{2}\/\d{2}.*$/, '') // Remove dates
    .replace(/\s*-\s*\$.*$/, '') // Remove amounts
    .trim();

  // Take first part before location info
  merchant = merchant.split(/\s+[A-Z]{2}\s+\d{5}/)[0]; // Remove "STATE ZIP"
  merchant = merchant.split(/\s+\d{3}-\d{3}-\d{4}/)[0]; // Remove phone numbers

  return merchant.trim() || description;
}

export function getMerchantCategory(
  merchant: string,
  userMappings: Record<string, TransactionCategory> = {}
): TransactionCategory {
  // Check user's custom mappings first
  const normalizedMerchant = merchant.toLowerCase().trim();
  if (userMappings[normalizedMerchant]) {
    return userMappings[normalizedMerchant];
  }

  // Use pattern matching
  return categorizeTransaction(merchant);
}

export function getDefaultCategoryMappings(): Record<string, TransactionCategory> {
  return { ...MERCHANT_PATTERNS };
}
