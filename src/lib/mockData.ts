export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string;
  type: 'income' | 'expense';
  merchant?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topCategories: { category: string; amount: number; percentage: number }[];
}

export interface PersonData {
  alias: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AccountData {
  account_id: string;
  account_name: string;
  institution_name: string;
  balance_current: number;
  currency: string;
}

export interface TransactionsSummary {
  count: number;
  inflow_sum: number;
  outflow_sum: number;
  net_flow: number;
  top_categories: { category: string; total: number }[];
}

export interface AccountsSummary {
  count: number;
  assets_total: number;
  liabilities_total: number;
  balance_total: number;
  top_accounts: AccountData[];
}

export interface MetricsData {
  link_id: string;
  owner_id: string;
  person: PersonData;
  window: {
    from: string;
    to: string;
  };
  accounts_summary: AccountsSummary;
  transactions_summary: TransactionsSummary;
  currency: string;
}

export interface AIInsight {
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
  metrics_json: MetricsData;
  model: string;
  temperature: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Salário',
    amount: 5000.00,
    category: 'Renda',
    subcategory: 'Salário',
    type: 'income',
    merchant: 'Empresa XYZ'
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Supermercado Pão de Açúcar',
    amount: -256.78,
    category: 'Alimentação',
    subcategory: 'Supermercado',
    type: 'expense',
    merchant: 'Pão de Açúcar'
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Posto Ipiranga',
    amount: -89.50,
    category: 'Transporte',
    subcategory: 'Combustível',
    type: 'expense',
    merchant: 'Ipiranga'
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'Netflix',
    amount: -29.90,
    category: 'Entretenimento',
    subcategory: 'Streaming',
    type: 'expense',
    merchant: 'Netflix'
  },
  {
    id: '5',
    date: '2024-01-11',
    description: 'Farmácia Droga Raia',
    amount: -45.60,
    category: 'Saúde',
    subcategory: 'Medicamentos',
    type: 'expense',
    merchant: 'Droga Raia'
  },
  {
    id: '6',
    date: '2024-01-10',
    description: 'Investimento CDB',
    amount: -1000.00,
    category: 'Investimentos',
    subcategory: 'Renda Fixa',
    type: 'expense',
    merchant: 'Banco XYZ'
  },
  {
    id: '7',
    date: '2024-01-09',
    description: 'Aluguel',
    amount: -1200.00,
    category: 'Moradia',
    subcategory: 'Aluguel',
    type: 'expense',
    merchant: 'Imobiliária ABC'
  },
  {
    id: '8',
    date: '2024-01-08',
    description: 'Restaurante',
    amount: -87.30,
    category: 'Alimentação',
    subcategory: 'Restaurante',
    type: 'expense',
    merchant: 'Restaurante Italiano'
  }
];

export const mockInsights: AIInsight[] = [
  {
    insight_id: "791405df-8b19-49d3-bdde-ad252157d91a-s5hrbg0u",
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    source_from: "2025-06-18",
    source_to: "2025-09-18",
    generated_at: "2025-09-18T02:19:09.473Z",
    title: "Fluxo de caixa positivo",
    insight: "O fluxo de caixa é positivo, com um valor de inflow de R$ 4.536,37.",
    category: "income",
    priority: "low",
    action: "Aumentar o fluxo de caixa",
    confidence: 0.9,
    metrics_json: {
      link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
      owner_id: "4ac84d10-be75-4863-9d69-549bba6e000e",
      person: {
        alias: "Alícia Cunha Mendonça",
        first_name: "Alícia",
        last_name: "Cunha",
        email: "opereira@example.com"
      },
      window: {
        from: "2025-06-18",
        to: "2025-09-18"
      },
      accounts_summary: {
        count: 9,
        assets_total: 2065747.82,
        liabilities_total: 211354.19,
        balance_total: 2277102.01,
        top_accounts: [
          {
            account_id: "49329389-a6d2-4be3-983c-e850c970fc4f",
            account_name: "PGBL - REGRESSIVA DEFINITIVA",
            institution_name: "erebor_br_retail",
            balance_current: 666667,
            currency: "BRL"
          }
        ]
      },
      transactions_summary: {
        count: 0,
        inflow_sum: 4536.37,
        outflow_sum: 0,
        net_flow: 4536.37,
        top_categories: [
          { category: "uncategorized", total: 1286.91 },
          { category: "withdrawal & atm", total: 1224.56 },
          { category: "home & life", total: 1169.07 },
          { category: "transfers", total: 691.11 }
        ]
      },
      currency: "BRL"
    },
    model: "llama3.2:3b",
    temperature: 0.1,
    prompt_tokens: 594,
    completion_tokens: 195
  },
  {
    insight_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40-kfc98ucn",
    link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
    source_from: "2025-06-18",
    source_to: "2025-09-18",
    generated_at: "2025-09-18T02:19:11.223Z",
    title: "Concentração por conta",
    insight: "As contas têm uma concentração desigual de fundos, com 2 contas tendo mais de 50% do total.",
    category: "concentração por conta",
    priority: "high",
    action: "Reorganizar contas para melhor distribuição de fundos.",
    confidence: 0.8,
    metrics_json: {
      link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
      owner_id: "4ce147ab-8222-4868-b762-932d4b4c798c",
      person: {
        alias: "Marcos Vinicius Viana Nascimento",
        first_name: "Marcos Vinicius",
        last_name: "Viana",
        email: "eloahcarvalho@example.com"
      },
      window: {
        from: "2025-06-18",
        to: "2025-09-18"
      },
      accounts_summary: {
        count: 9,
        assets_total: 2098803.35,
        liabilities_total: 235753.83,
        balance_total: 2334557.18,
        top_accounts: [
          {
            account_id: "6b9858db-111e-4116-b1cb-6596677aae72",
            account_name: "Person Juro Real Target2026 Pgbl",
            institution_name: "erebor_br_retail",
            balance_current: 635660,
            currency: "BRL"
          }
        ]
      },
      transactions_summary: {
        count: 0,
        inflow_sum: 19349.18,
        outflow_sum: 0,
        net_flow: 19349.18,
        top_categories: [
          { category: "online platforms & leisure", total: 13500 },
          { category: "investments & savings", total: 2534.06 },
          { category: "withdrawal & atm", total: 1622.68 },
          { category: "taxes", total: 1414.04 }
        ]
      },
      currency: "BRL"
    },
    model: "llama3.2:3b",
    temperature: 0.1,
    prompt_tokens: 604,
    completion_tokens: 231
  }
];

export const mockSummary: FinancialSummary = {
  totalBalance: 2277102.01,
  monthlyIncome: 19349.18,
  monthlyExpenses: 0,
  savingsRate: 100,
  topCategories: [
    { category: 'online platforms & leisure', amount: 13500, percentage: 69.8 },
    { category: 'investments & savings', amount: 2534.06, percentage: 13.1 },
    { category: 'withdrawal & atm', amount: 1622.68, percentage: 8.4 },
    { category: 'taxes', amount: 1414.04, percentage: 7.3 },
    { category: 'uncategorized', amount: 1286.91, percentage: 6.6 }
  ]
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'income': 'text-success',
    'concentração por conta': 'text-primary',
    'categorias de gastos': 'text-warning',
    'despesas': 'text-destructive',
    'fluxo de caixa': 'text-blue-500',
    'investments': 'text-purple-500',
    'spending': 'text-orange-500',
    'qualidade de dados': 'text-muted-foreground',
    'online platforms & leisure': 'text-purple-500',
    'investments & savings': 'text-success',
    'withdrawal & atm': 'text-warning',
    'taxes': 'text-destructive',
    'uncategorized': 'text-muted-foreground'
  };
  return colors[category] || colors['uncategorized'];
};

export const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    'low': 'text-success',
    'medium': 'text-warning',
    'high': 'text-destructive'
  };
  return colors[priority] || colors['low'];
};

export const getPriorityBadgeVariant = (priority: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    'low': 'secondary',
    'medium': 'default',
    'high': 'destructive'
  };
  return variants[priority] || variants['low'];
};