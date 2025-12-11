export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  type: 'Checking' | 'Savings' | 'Credit';
  balance: number;
  currency: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // ISO string
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: 'TW' | 'US';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface AppState {
  accounts: BankAccount[];
  transactions: Transaction[];
  stocks: Stock[];
  user: {
    name: string;
    email: string;
  } | null;
}

export type ViewState = 'DASHBOARD' | 'ACCOUNTS' | 'TRANSACTIONS' | 'STOCKS' | 'ADVISOR';
