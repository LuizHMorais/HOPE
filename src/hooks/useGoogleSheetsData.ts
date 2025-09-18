import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { 
  getMockSheetData,
  mockPeopleData,
  mockAccountsData,
  mockTransactionsData,
  mockDashboardData,
  mockAIInsightsData
} from '@/data/mockGoogleSheetsData';
import { ENV_CONFIG } from '@/config/env';
import { buildBatchGetUrl } from '@/config/googleSheets';

// Função simples para processar dados do Google Sheets
const parseSheetData = (values: string[][], sheetName: string): Record<string, unknown>[] => {
  if (!values || values.length === 0) return [];
  
  const headers = values[0];
  const rows = values.slice(1);
  
  return rows.map(row => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      if (header && row[index] !== undefined) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
};

// Tipos simplificados
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
  priority: string;
  action: string;
  confidence: number;
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

export const useGoogleSheetsData = () => {
  const [data, setData] = useState<{
    people: Person[];
    accounts: Account[];
    transactions: Transaction[];
    dashboard: Dashboard[];
    insights: Insight[];
  }>({
    people: [],
    accounts: [],
    transactions: [],
    dashboard: [],
    insights: [],
  });

  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [dataSource, setDataSource] = useState<'google_sheets' | 'mock' | 'unknown'>('unknown');
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const { toast } = useToast();
  const hasInitialized = useRef(false);

  // Função simples para carregar dados
  const fetchAllData = useCallback(async (opts?: { force?: boolean; silent?: boolean }) => {
    console.log('fetchAllData chamado', { force: opts?.force, silent: opts?.silent });
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se deve usar mock data
      if (ENV_CONFIG.APP.USE_MOCK_DATA) {
        // Usar dados mock diretamente (sem conversão)
        const convertedData = {
          people: mockPeopleData,
          accounts: mockAccountsData,
          transactions: mockTransactionsData,
          dashboard: mockDashboardData,
          insights: mockAIInsightsData,
        };
      
      setData(convertedData);
      setDataSource('mock');
      setApiKeyValid(true);
      
      if (!opts?.silent) {
        toast({
          title: "Dados carregados",
          description: "Dados mock carregados com sucesso",
        });
      }
    } else {
      // Usar dados reais do Google Sheets
      const { buildBatchGetUrl } = await import('@/config/googleSheets');
      
      const url = buildBatchGetUrl([
        'People!A:F',
        'Accounts!A:J', 
        'Transactions!A:J',
        'Dashboard!A:J',
        'AI_Insights!A:F'
      ]);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Processar dados reais
      const convertedData = {
        people: parseSheetData(result.valueRanges[0]?.values || [], 'People') as unknown as Person[],
        accounts: parseSheetData(result.valueRanges[1]?.values || [], 'Accounts') as unknown as Account[],
        transactions: parseSheetData(result.valueRanges[2]?.values || [], 'Transactions') as unknown as Transaction[],
        dashboard: parseSheetData(result.valueRanges[3]?.values || [], 'Dashboard') as unknown as Dashboard[],
        insights: parseSheetData(result.valueRanges[4]?.values || [], 'AI_Insights') as unknown as Insight[],
      };
      
      setData(convertedData);
      setDataSource('google_sheets');
      setApiKeyValid(true);
      
      // Selecionar o primeiro owner se não houver seleção
      if (!selectedOwner && convertedData.people.length > 0) {
        setSelectedOwner(convertedData.people[0].link_id);
      }
      
      if (!opts?.silent) {
        toast({
          title: "Dados carregados",
          description: "Dados do Google Sheets carregados com sucesso",
        });
      }
    }

    } catch (error) {
      setError('Erro ao carregar dados');
      toast({
        title: "Erro ao carregar dados",
        description: "Verifique a configuração",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedOwner, toast]);

  // Carregar dados apenas uma vez
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('Inicializando dados...');
      fetchAllData();
    }
  }, [fetchAllData]); // Adicionado fetchAllData para satisfazer o linter

  // Função para obter dados do owner selecionado
  const getSelectedOwnerData = useCallback((): OwnerData | null => {
    if (!selectedOwner) return null;

    const person = data.people.find(p => p.link_id === selectedOwner) || null;
    const accounts = data.accounts.filter(a => a.link_id === selectedOwner);
    const transactions = data.transactions.filter(t => t.link_id === selectedOwner);
    const dashboard = data.dashboard.find(d => d.link_id === selectedOwner) || null;
    const insights = data.insights.filter(i => i.link_id === selectedOwner);

    return {
      person,
      accounts,
      transactions,
      dashboard,
      insights
    };
  }, [selectedOwner, data]);

  // Função para calcular métricas do owner selecionado
  const getSelectedOwnerMetrics = useCallback((): OwnerMetrics => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) {
      return {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        topCategories: [],
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = ownerData.transactions.filter(t => {
      const transactionDate = new Date(t.value_date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.flow === 'inflow' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.flow === 'outflow' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Top categorias
    const categoryTotals: Record<string, number> = {};
    monthlyTransactions.forEach(t => {
      const category = t.category || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Assets e Liabilities
    const totalAssets = ownerData.accounts
      .filter(a => !a.is_liability)
      .reduce((sum, a) => sum + (a.balance_current || 0), 0);

    const totalLiabilities = ownerData.accounts
      .filter(a => a.is_liability)
      .reduce((sum, a) => sum + Math.abs(a.balance_current || 0), 0);

    const netWorth = totalAssets - totalLiabilities;

    return {
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      topCategories,
      totalAssets,
      totalLiabilities,
      netWorth,
    };
  }, [getSelectedOwnerData]);

  // Função para obter métricas para um período específico
  const getSelectedOwnerMetricsFor = useCallback((month: number, year: number): OwnerMetrics => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) {
      return {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        topCategories: [],
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
      };
    }

    const monthlyTransactions = ownerData.transactions.filter(t => {
      const transactionDate = new Date(t.value_date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.flow === 'inflow' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.flow === 'outflow' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Top categorias
    const categoryTotals: Record<string, number> = {};
    monthlyTransactions.forEach(t => {
      const category = t.category || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Assets e Liabilities
    const totalAssets = ownerData.accounts
      .filter(a => !a.is_liability)
      .reduce((sum, a) => sum + (a.balance_current || 0), 0);

    const totalLiabilities = ownerData.accounts
      .filter(a => a.is_liability)
      .reduce((sum, a) => sum + Math.abs(a.balance_current || 0), 0);

    const netWorth = totalAssets - totalLiabilities;

    return {
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      topCategories,
      totalAssets,
      totalLiabilities,
      netWorth,
    };
  }, [getSelectedOwnerData]);

  // Função para obter transações para um período específico
  const getSelectedOwnerTransactionsFor = useCallback((month: number, year: number): Transaction[] => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) return [];

    return ownerData.transactions.filter(t => {
      const transactionDate = new Date(t.value_date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
  }, [getSelectedOwnerData]);

  // Função para obter métricas YTD
  const getSelectedOwnerMetricsYTD = useCallback((year: number): OwnerMetrics => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) {
      return {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        topCategories: [],
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
      };
    }

    const ytdTransactions = ownerData.transactions.filter(t => {
      const transactionDate = new Date(t.value_date);
      return transactionDate.getFullYear() === year;
    });

    const monthlyIncome = ytdTransactions
      .filter(t => t.flow === 'inflow' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = ytdTransactions
      .filter(t => t.flow === 'outflow' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Top categorias
    const categoryTotals: Record<string, number> = {};
    ytdTransactions.forEach(t => {
      const category = t.category || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Assets e Liabilities
    const totalAssets = ownerData.accounts
      .filter(a => !a.is_liability)
      .reduce((sum, a) => sum + (a.balance_current || 0), 0);

    const totalLiabilities = ownerData.accounts
      .filter(a => a.is_liability)
      .reduce((sum, a) => sum + Math.abs(a.balance_current || 0), 0);

    const netWorth = totalAssets - totalLiabilities;

    return {
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      topCategories,
      totalAssets,
      totalLiabilities,
      netWorth,
    };
  }, [getSelectedOwnerData]);

  // Função para obter transações YTD
  const getSelectedOwnerTransactionsYTD = useCallback((year: number): Transaction[] => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) return [];

    return ownerData.transactions.filter(t => {
      const transactionDate = new Date(t.value_date);
      return transactionDate.getFullYear() === year;
    });
  }, [getSelectedOwnerData]);

  // Lista de owners
  const owners = data.people.map(p => ({
    id: p.link_id,
    name: p.person_alias || `${p.first_name} ${p.last_name}`.trim(),
    alias: p.person_alias,
    fullName: `${p.first_name} ${p.last_name}`.trim(),
  }));

  return {
    // Estados
    data,
    selectedOwner,
    setSelectedOwner,
    isLoading,
    error,
    apiKeyValid,
    dataSource,
    isUsingMockData,
    owners,

    // Funções
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetrics,
    getSelectedOwnerMetricsFor,
    getSelectedOwnerTransactionsFor,
    getSelectedOwnerMetricsYTD,
    getSelectedOwnerTransactionsYTD,
  };
};