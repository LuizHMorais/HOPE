import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { GOOGLE_SHEETS_CONFIG, buildSheetUrl, handleApiError } from '@/config/googleSheets';
import { getMockSheetData } from '@/data/mockGoogleSheetsData';

// Tipos baseados na estrutura da planilha
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
}

export interface Transaction {
  transaction_id: string;
  link_id: string;
  amount: number;
  description: string;
  category: string;
  value_date: string;
  posted_date?: string;
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
  priority: 'low' | 'medium' | 'high';
  action: string;
  confidence: number;
  metrics_json: string;
  model: string;
  temperature: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

export interface FinancialData {
  people: Person[];
  accounts: Account[];
  transactions: Transaction[];
  dashboard: DashboardMetrics[];
  insights: AIInsight[];
}

// Configurações movidas para o arquivo de config

export const useGoogleSheetsData = () => {
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
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null); // null = não testado, true = válida, false = inválida
  const { toast } = useToast();

  // Função para testar se a API Key é válida (executa apenas uma vez)
  const testApiKey = useCallback(async () => {
    if (apiKeyValid !== null) return apiKeyValid; // Já foi testado
    
    try {
      const url = buildSheetUrl('People');
      const response = await fetch(url);
      
      if (response.ok) {
        setApiKeyValid(true);
        return true;
      } else {
        setApiKeyValid(false);
        return false;
      }
    } catch (error) {
      setApiKeyValid(false);
      return false;
    }
  }, [apiKeyValid]);

  // Função para buscar dados de uma aba específica
  const fetchSheetData = useCallback(async (sheetName: string) => {
    // Se a API Key já foi testada e é inválida, usar dados mockados diretamente
    if (apiKeyValid === false) {
      return await getMockSheetData(sheetName);
    }
    
    // Se ainda não foi testada, testar primeiro
    if (apiKeyValid === null) {
      const isValid = await testApiKey();
      if (!isValid) {
        return await getMockSheetData(sheetName);
      }
    }
    
    // Se chegou até aqui, a API Key é válida, tentar buscar dados reais
    try {
      const url = buildSheetUrl(sheetName);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`API falhou para ${sheetName} (${response.status}), usando dados mockados`);
        return await getMockSheetData(sheetName);
      }
      
      const result = await response.json();
      return result.values || [];
    } catch (error) {
      console.warn(`Erro ao buscar ${sheetName} da API, usando dados mockados:`, error);
      return await getMockSheetData(sheetName);
    }
  }, [apiKeyValid, testApiKey]);

  // Função para converter dados da planilha em objetos tipados
  const parseSheetData = useCallback((values: any[][], headers: string[]) => {
    if (!values || values.length <= 1) return [];
    
    return values.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }, []);

  // Função para buscar todos os dados
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar dados de todas as abas em paralelo
      const [peopleData, accountsData, transactionsData, dashboardData, insightsData] = await Promise.all([
        fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.PEOPLE),
        fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.ACCOUNTS),
        fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS),
        fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.DASHBOARD),
        fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.AI_INSIGHTS)
      ]);

      // Definir headers para cada aba
      const peopleHeaders = ['link_id', 'person_alias', 'first_name', 'last_name', 'email', 'phone'];
      const accountsHeaders = ['account_id', 'link_id', 'account_name', 'institution_name', 'balance_current', 'currency', 'liability_outstanding', 'funds_total'];
      const transactionsHeaders = ['transaction_id', 'link_id', 'amount', 'description', 'category', 'value_date', 'posted_date'];
      const dashboardHeaders = ['link_id', 'total_balance', 'gasto_mes_atual', 'gasto_mes_anterior', 'variacao_percentual', 'total_transactions', 'inflow_sum', 'outflow_sum', 'net_flow'];
      const insightsHeaders = ['insight_id', 'link_id', 'source_from', 'source_to', 'generated_at', 'title', 'insight', 'category', 'priority', 'action', 'confidence', 'metrics_json', 'model', 'temperature', 'prompt_tokens', 'completion_tokens'];

      // Parse dos dados
      const people = parseSheetData(peopleData, peopleHeaders).map(p => ({
        ...p,
        link_id: String(p.link_id),
        person_alias: String(p.person_alias || p.first_name || 'Usuário')
      }));

      const accounts = parseSheetData(accountsData, accountsHeaders).map(a => ({
        ...a,
        account_id: String(a.account_id),
        link_id: String(a.link_id),
        balance_current: Number(a.balance_current) || 0,
        liability_outstanding: Number(a.liability_outstanding) || 0,
        funds_total: Number(a.funds_total) || 0
      }));

      const transactions = parseSheetData(transactionsData, transactionsHeaders).map(t => ({
        ...t,
        transaction_id: String(t.transaction_id),
        link_id: String(t.link_id),
        amount: Number(t.amount) || 0
      }));

      const dashboard = parseSheetData(dashboardData, dashboardHeaders).map(d => ({
        ...d,
        link_id: String(d.link_id),
        total_balance: Number(d.total_balance) || 0,
        gasto_mes_atual: Number(d.gasto_mes_atual) || 0,
        gasto_mes_anterior: Number(d.gasto_mes_anterior) || 0,
        variacao_percentual: Number(d.variacao_percentual) || 0,
        total_transactions: Number(d.total_transactions) || 0,
        inflow_sum: Number(d.inflow_sum) || 0,
        outflow_sum: Number(d.outflow_sum) || 0,
        net_flow: Number(d.net_flow) || 0
      }));

      const insights = parseSheetData(insightsData, insightsHeaders).map(i => ({
        ...i,
        insight_id: String(i.insight_id),
        link_id: String(i.link_id),
        confidence: Number(i.confidence) || 0,
        temperature: Number(i.temperature) || 0,
        prompt_tokens: Number(i.prompt_tokens) || 0,
        completion_tokens: Number(i.completion_tokens) || 0
      }));

      const newData = {
        people,
        accounts,
        transactions,
        dashboard,
        insights
      };

      setData(newData);

      // Selecionar o primeiro owner se não houver seleção
      if (!selectedOwner && people.length > 0) {
        setSelectedOwner(people[0].link_id);
      }

      // Verificar se usou dados mockados
      const usedMockData = people.length > 0 && people[0]?.person_alias === "Alícia Cunha Mendonça";
      
      toast({
        title: "Dados carregados!",
        description: usedMockData 
          ? `Dados de demonstração carregados (${people.length} pessoas, ${accounts.length} contas, ${transactions.length} transações)`
          : `Dados reais carregados (${people.length} pessoas, ${accounts.length} contas, ${transactions.length} transações)`,
      });

    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      toast({
        title: "Erro ao carregar dados",
        description: "Usando dados de demonstração. Verifique a configuração da API Key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedOwner, parseSheetData, toast]);

  // Função para obter dados do owner selecionado
  const getSelectedOwnerData = useCallback(() => {
    if (!selectedOwner) return null;

    const person = data.people.find(p => p.link_id === selectedOwner);
    const ownerAccounts = data.accounts.filter(a => a.link_id === selectedOwner);
    const ownerTransactions = data.transactions.filter(t => t.link_id === selectedOwner);
    const ownerDashboard = data.dashboard.find(d => d.link_id === selectedOwner);
    const ownerInsights = data.insights.filter(i => i.link_id === selectedOwner);

    return {
      person,
      accounts: ownerAccounts,
      transactions: ownerTransactions,
      dashboard: ownerDashboard,
      insights: ownerInsights
    };
  }, [selectedOwner, data]);

  // Função para calcular métricas do owner selecionado
  const getSelectedOwnerMetrics = useCallback(() => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData || !ownerData.dashboard) return null;

    const { dashboard, accounts, transactions } = ownerData;
    
    // Calcular totais das contas
    const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance_current, 0);
    const totalLiabilities = accounts.reduce((sum, acc) => sum + (acc.liability_outstanding || 0), 0);
    const totalBalance = totalAssets - totalLiabilities;

    // Calcular categorias de gastos
    const categoryMap = new Map<string, number>();
    transactions.forEach(t => {
      if (t.amount < 0) {
        const category = t.category || 'uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(t.amount));
      }
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calcular taxa de poupança
    const monthlyIncome = dashboard.inflow_sum;
    const monthlyExpenses = dashboard.outflow_sum;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      totalAssets,
      totalLiabilities,
      topCategories,
      totalTransactions: dashboard.total_transactions,
      netFlow: dashboard.net_flow,
      variation: dashboard.variacao_percentual
    };
  }, [getSelectedOwnerData]);

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
    apiKeyValid,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetrics,
    owners: data.people.map(p => ({ id: p.link_id, name: p.person_alias }))
  };
};
