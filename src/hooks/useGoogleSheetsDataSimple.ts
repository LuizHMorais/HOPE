import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getMockSheetData } from '@/data/mockGoogleSheetsData';

// Tipos baseados na estrutura da planilha
type SheetCell = string | number | boolean | null | undefined;
type SheetRow = SheetCell[];
type SheetValues = SheetRow[];

export interface Person {
  link_id: string;
  person_alias: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface Account {
  account_id: string;
  link_id: string;
  account_name: string;
  institution_name: string;
  balance_current: number;
  currency: string;
  liability_outstanding: number;
  funds_total: number;
}

export interface Transaction {
  transaction_id: string;
  link_id: string;
  amount: number;
  description: string;
  category: string;
  value_date: string;
  posted_date: string;
}

export interface DashboardMetrics {
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

export interface AIInsight {
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
  metrics_json: string;
  model: string;
  temperature: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export interface FinancialData {
  people: Person[];
  accounts: Account[];
  transactions: Transaction[];
  dashboard: DashboardMetrics[];
  insights: AIInsight[];
}

export const useGoogleSheetsDataSimple = () => {
  const [data, setData] = useState<FinancialData>({
    people: [],
    accounts: [],
    transactions: [],
    dashboard: [],
    insights: []
  });
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Função para converter dados da planilha em objetos tipados
  const parseSheetData = useCallback(<T extends Record<string, SheetCell>>(values: SheetValues, headers: readonly (keyof T & string)[]) => {
    if (!values || values.length <= 1) return [] as T[];

    return values.slice(1).map((row) => {
      const acc: Partial<Record<keyof T, SheetCell>> = {};
      headers.forEach((header, index) => {
        acc[header] = row[index];
      });
      return acc as T;
    });
  }, []);

  // Função para carregar todos os dados (apenas mockados por enquanto)
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const [peopleData, accountsData, transactionsData, dashboardData, insightsData] = await Promise.all([
        getMockSheetData('People'),
        getMockSheetData('Accounts'),
        getMockSheetData('Transactions'),
        getMockSheetData('Dashboard'),
        getMockSheetData('AI_Insights')
      ]);

      const peopleHeaders = ['link_id', 'person_alias', 'first_name', 'last_name', 'email', 'phone'];
      const accountsHeaders = ['account_id', 'link_id', 'account_name', 'institution_name', 'balance_current', 'currency', 'liability_outstanding', 'funds_total'];
      const transactionsHeaders = ['transaction_id', 'link_id', 'amount', 'description', 'category', 'value_date', 'posted_date'];
      const dashboardHeaders = ['link_id', 'total_balance', 'gasto_mes_atual', 'gasto_mes_anterior', 'variacao_percentual', 'total_transactions', 'inflow_sum', 'outflow_sum', 'net_flow'];
      const insightsHeaders = ['insight_id', 'link_id', 'source_from', 'source_to', 'generated_at', 'title', 'insight', 'category', 'priority', 'action', 'confidence', 'metrics_json', 'model', 'temperature', 'prompt_tokens', 'completion_tokens'];

      const people = parseSheetData<Record<string, SheetCell>>(peopleData, peopleHeaders) as Person[];
      const accounts = parseSheetData<Record<string, SheetCell>>(accountsData, accountsHeaders) as Account[];
      const transactions = parseSheetData<Record<string, SheetCell>>(transactionsData, transactionsHeaders) as Transaction[];
      const dashboard = parseSheetData<Record<string, SheetCell>>(dashboardData, dashboardHeaders) as DashboardMetrics[];
      const insights = parseSheetData<Record<string, SheetCell>>(insightsData, insightsHeaders) as AIInsight[];

      setData({ people, accounts, transactions, dashboard, insights });

      // Selecionar o primeiro owner se não houver seleção
      if (!selectedOwner && people.length > 0) {
        setSelectedOwner(people[0].link_id);
      }

      toast({
        title: "Dados carregados!",
        description: `Dados de demonstração carregados (${people.length} pessoas, ${accounts.length} contas, ${transactions.length} transações)`,
      });

    } catch (error) {
      const errorMessage = 'Erro ao carregar dados de demonstração';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedOwner, parseSheetData, toast]);

  // Função para obter dados do owner selecionado
  const getSelectedOwnerData = useCallback(() => {
    if (!selectedOwner) return null;

    const owner = data.people.find(p => p.link_id === selectedOwner);
    if (!owner) return null;

    const ownerAccounts = data.accounts.filter(a => a.link_id === selectedOwner);
    const ownerTransactions = data.transactions.filter(t => t.link_id === selectedOwner);
    const ownerInsights = data.insights.filter(i => i.link_id === selectedOwner);

    return {
      person: owner,
      accounts: ownerAccounts,
      transactions: ownerTransactions,
      insights: ownerInsights
    };
  }, [selectedOwner, data]);

  // Função para obter métricas do owner selecionado
  const getSelectedOwnerMetrics = useCallback(() => {
    if (!selectedOwner) return null;

    const metrics = data.dashboard.find(m => m.link_id === selectedOwner);
    return metrics || null;
  }, [selectedOwner, data]);

  // Carregar dados na inicialização
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    selectedOwner,
    setSelectedOwner,
    isLoading,
    error,
    apiKeyValid: false, // Sempre false para dados mockados
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetrics,
    owners: data.people.map(p => ({ id: p.link_id, name: p.person_alias }))
  };
};
