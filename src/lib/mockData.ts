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

export const mockSummary: FinancialSummary = {
  totalBalance: 12453.67,
  monthlyIncome: 5000.00,
  monthlyExpenses: 2709.08,
  savingsRate: 45.8,
  topCategories: [
    { category: 'Moradia', amount: 1200.00, percentage: 44.3 },
    { category: 'Investimentos', amount: 1000.00, percentage: 36.9 },
    { category: 'Alimentação', amount: 344.08, percentage: 12.7 },
    { category: 'Transporte', amount: 89.50, percentage: 3.3 },
    { category: 'Saúde', amount: 45.60, percentage: 1.7 }
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
    'Renda': 'text-success',
    'Moradia': 'text-primary',
    'Alimentação': 'text-warning',
    'Transporte': 'text-destructive',
    'Saúde': 'text-rose-500',
    'Entretenimento': 'text-purple-500',
    'Investimentos': 'text-success',
    'Outros': 'text-muted-foreground'
  };
  return colors[category] || colors['Outros'];
};