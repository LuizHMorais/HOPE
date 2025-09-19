// ========================================
// TIPOS CENTRALIZADOS DA APLICAÇÃO HOPE
// ========================================
// Este arquivo centraliza todas as interfaces e tipos da aplicação
// para evitar duplicação e facilitar a manutenção

export interface Person {
  link_id: string;
  person_alias: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface Account {
  account_id: string;
  link_id: string;
  account_name: string;
  institution_name: string;
  balance_current: number;
  currency: string;
  liability_outstanding?: number;
  funds_total?: number;
  account_type?: string;
  is_liability?: boolean;
}

export interface Transaction {
  transaction_id: string;
  link_id: string;
  account_id?: string;
  amount: number;
  description: string;
  category: string;
  value_date: string;
  posted_date?: string;
  flow?: 'inflow' | 'outflow';
  merchant?: string;
}

export interface Dashboard {
  link_id: string;
  total_balance: number;
  gasto_mes_atual: number;
  gasto_mes_anterior: number;
  variacao_percentual: number;
  total_transactions: number;
  inflow_sum: number;
  outflow_sum: number;
  net_flow: number;
}

export interface Insight {
  insight_id: string;
  link_id: string;
  source_from: string;
  source_to: string;
  generated_at: string;
  title: string;
  insight: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
  confidence: number;
  metrics_json?: string;
}

export interface OwnerData {
  person: Person | null;
  accounts: Account[];
  transactions: Transaction[];
  dashboard: Dashboard | null;
  insights: Insight[];
}

export interface OwnerMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topCategories: Array<{ category: string; amount: number }>;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

// ========================================
// TIPOS AUXILIARES
// ========================================

export type RawSheetCell = string | number | boolean | null | undefined;
export type RawSheetRow = RawSheetCell[];
export type RawSheetValues = RawSheetRow[];
export type RawRecord = Record<string, RawSheetCell>;

export type RawDataset = {
  people: RawRecord[];
  accounts: RawRecord[];
  transactions: RawRecord[];
  dashboard: RawRecord[];
  insights: RawRecord[];
};

export type GVizColumn = { id?: string | null; label?: string | null };
export type GVizCell = { v?: RawSheetCell | Record<string, unknown> | null; f?: string | null };
export type GVizRow = { c?: (GVizCell | null)[] | null };
export type GVizResponse = { table?: { cols?: (GVizColumn | null)[] | null; rows?: (GVizRow | null)[] | null } };
