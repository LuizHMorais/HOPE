import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { GOOGLE_SHEETS_CONFIG, buildSheetUrl, buildBatchGetUrl, handleApiError } from '@/config/googleSheets';
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
  account_type?: string;
  is_liability?: boolean;
  is_liability_account?: boolean;
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
  // Cache em memória para persistir entre páginas/rotas
  // (compartilhado por módulo enquanto o app estiver carregado)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memoryCacheRef = (globalThis as any).__HOPE_SHEETS_CACHE__ as { data: FinancialData; timestamp: number } | undefined;
  const setMemoryCache = (payload: { data: FinancialData; timestamp: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__HOPE_SHEETS_CACHE__ = payload;
  };
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
    // Se a API Key já foi testada e é inválida, respeitar flag de mock
    if (apiKeyValid === false) {
      // Apenas usa mock se explicitamente habilitado
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return await getMockSheetData(sheetName);
      }
      throw new Error('API Key inválida e uso de mock desabilitado');
    }
    
    // Se ainda não foi testada, testar primeiro
    if (apiKeyValid === null) {
      const isValid = await testApiKey();
      if (!isValid) {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
          return await getMockSheetData(sheetName);
        }
        throw new Error('API Key inválida e uso de mock desabilitado');
      }
    }
    
    // Se chegou até aqui, a API Key é válida, tentar buscar dados reais
    try {
      const url = buildSheetUrl(sheetName);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`API falhou para ${sheetName} (${response.status})`);
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
          return await getMockSheetData(sheetName);
        }
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }
      
      const result = await response.json();
      return result.values || [];
    } catch (error) {
      console.warn(`Erro ao buscar ${sheetName} da API:`, error);
      if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return await getMockSheetData(sheetName);
      }
      throw error;
    }
  }, [apiKeyValid, testApiKey]);

  // Utilitários de parsing
  const normalize = (s: any): string => String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();

  const parseNumber = (v: any): number => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    let s = String(v).trim();
    const negative = /^\(.*\)$/.test(s) || /^-/.test(s);
    s = s.replace(/[()\s]/g, '');
    // remove currency and non-digit, keep , . and -
    s = s.replace(/[^0-9,.-]/g, '');
    // if both comma and dot, assume dot thousand sep, comma decimal
    if (s.includes(',') && s.includes('.')) {
      s = s.replace(/\./g, '');
      s = s.replace(/,/g, '.');
    } else if (s.includes(',')) {
      // only comma present, treat as decimal
      s = s.replace(/,/g, '.');
    }
    const n = parseFloat(s);
    if (isNaN(n)) return 0;
    return negative ? -Math.abs(n) : n;
  };

  const excelDateToISO = (d: number): string => {
    // Google Sheets/Excel epoch 1899-12-30
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = d * 24 * 60 * 60 * 1000;
    const date = new Date(epoch.getTime() + ms);
    return date.toISOString();
  };

  const parseDate = (v: any): string => {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number') {
      // probably serial date
      return excelDateToISO(v);
    }
    const s = String(v).trim();
    // ISO
    const iso = Date.parse(s);
    if (!isNaN(iso)) return new Date(iso).toISOString();
    // dd/mm/yyyy or d/m/yyyy
    const m = s.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/);
    if (m) {
      const dd = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10) - 1;
      const yy = parseInt(m[3], 10);
      const d = new Date(Date.UTC(yy, mm, dd));
      return d.toISOString();
    }
    return '';
  };

  // Parse genérico baseado no cabeçalho da primeira linha + aliases
  const parseSheetDataFlexible = useCallback((values: any[][], aliases: Record<string, string[]>) => {
    if (!values || values.length === 0) return [];
    const headers = (values[0] || []).map(normalize);
    const indexByCanonical: Record<string, number> = {};
    Object.entries(aliases).forEach(([canonical, aliasList]) => {
      const candidates = [canonical, ...aliasList];
      let idx = -1;
      for (const cand of candidates) {
        const n = normalize(cand);
        idx = headers.indexOf(n);
        if (idx !== -1) break;
      }
      if (idx !== -1) indexByCanonical[canonical] = idx;
    });
    return values.slice(1).map((row) => {
      const obj: any = {};
      Object.entries(indexByCanonical).forEach(([canonical, idx]) => {
        obj[canonical] = row[idx];
      });
      return obj;
    });
  }, []);

  const toBool = (v: any): boolean => {
    if (typeof v === 'boolean') return v;
    const s = normalize(v);
    return ['1','true','yes','sim','y','s'].includes(s);
  };

  // Função para buscar todos os dados
  const fetchAllData = useCallback(async (opts?: { force?: boolean; silent?: boolean }) => {
    setIsLoading(true);
    setError(null);
    // Servir do cache se dentro do período
    const now = Date.now();
    if (!opts?.force && memoryCacheRef && now - memoryCacheRef.timestamp < GOOGLE_SHEETS_CONFIG.CACHE_DURATION) {
      setData(memoryCacheRef.data);
      setIsLoading(false);
      return;
    }
    
    try {
      // Tentar usar batchGet para reduzir requisições
      let peopleData: any[][] = [];
      let accountsData: any[][] = [];
      let transactionsData: any[][] = [];
      let dashboardData: any[][] = [];
      let insightsData: any[][] = [];

      try {
        const batchUrl = buildBatchGetUrl([
          GOOGLE_SHEETS_CONFIG.SHEETS.PEOPLE,
          GOOGLE_SHEETS_CONFIG.SHEETS.ACCOUNTS,
          GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS,
          GOOGLE_SHEETS_CONFIG.SHEETS.DASHBOARD,
          GOOGLE_SHEETS_CONFIG.SHEETS.AI_INSIGHTS,
        ]);
        const batchRes = await fetch(batchUrl);
        if (batchRes.ok) {
          const batchJson = await batchRes.json();
          const valueRanges = batchJson.valueRanges || [];
          const map: Record<string, any[][]> = {};
          valueRanges.forEach((vr: any) => {
            const range = vr.range || '';
            // range vem como 'SheetName'!A1:Z - extraímos o nome entre aspas simples
            const match = range.match(/^'?(.*?)'?!/);
            const name = match ? match[1] : range;
            map[name] = vr.values || [];
          });
          peopleData = map[GOOGLE_SHEETS_CONFIG.SHEETS.PEOPLE] || [];
          accountsData = map[GOOGLE_SHEETS_CONFIG.SHEETS.ACCOUNTS] || [];
          transactionsData = map[GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS] || [];
          dashboardData = map[GOOGLE_SHEETS_CONFIG.SHEETS.DASHBOARD] || [];
          insightsData = map[GOOGLE_SHEETS_CONFIG.SHEETS.AI_INSIGHTS] || [];
        } else {
          throw new Error(`batchGet HTTP ${batchRes.status}`);
        }
      } catch (e) {
        // Fallback: buscar individualmente
        [peopleData, accountsData, transactionsData, dashboardData, insightsData] = await Promise.all([
          fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.PEOPLE),
          fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.ACCOUNTS),
          fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.TRANSACTIONS),
          fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.DASHBOARD),
          fetchSheetData(GOOGLE_SHEETS_CONFIG.SHEETS.AI_INSIGHTS),
        ]);
      }

      // Aliases por aba para tolerar variações de cabeçalho
      const peopleAliases = {
        link_id: ['link_id', 'link', 'owner_id'],
        person_alias: ['person_alias', 'alias', 'apelido'],
        first_name: ['first_name', 'nome'],
        last_name: ['last_name', 'sobrenome'],
        email: ['email'],
        phone: ['phone', 'telefone']
      };

      const accountsAliases = {
        account_id: ['account_id', 'id', 'id_conta'],
        link_id: ['link_id', 'link', 'owner_id'],
        account_name: ['account_name', 'nome_conta'],
        institution_name: ['institution_name', 'banco'],
        balance_current: ['balance_current', 'saldo', 'saldo_atual'],
        currency: ['currency', 'moeda'],
        liability_outstanding: ['liability_outstanding', 'passivo', 'dividas'],
        funds_total: ['funds_total', 'ativos', 'investimentos'],
        account_type: ['account_type','type','tipo','classificacao','classification','role'],
        is_liability: ['is_liability','liability']
      };

      const transactionsAliases = {
        transaction_id: ['transaction_id', 'id', 'id_transacao'],
        link_id: ['link_id', 'link', 'owner_id'],
        account_id: ['account_id','conta','id_conta','account'],
        amount: ['amount', 'valor'],
        description: ['description', 'descricao'],
        category: ['category', 'categoria'],
        value_date: ['value_date', 'data', 'date'],
        posted_date: ['posted_date', 'data_postagem'],
        flow: ['flow','direction','transaction_type','tipo','nature'],
        merchant: ['merchant','estabelecimento']
      };

      const dashboardAliases = {
        link_id: ['link_id', 'link', 'owner_id'],
        total_balance: ['total_balance', 'saldo_total'],
        gasto_mes_atual: ['gasto_mes_atual', 'gastos_mes_atual'],
        gasto_mes_anterior: ['gasto_mes_anterior', 'gastos_mes_anterior'],
        variacao_percentual: ['variacao_percentual', 'variacao_%'],
        total_transactions: ['total_transactions', 'qtd_transacoes'],
        inflow_sum: ['inflow_sum', 'entradas'],
        outflow_sum: ['outflow_sum', 'saidas'],
        net_flow: ['net_flow', 'fluxo_liquido']
      };

      const insightsAliases = {
        insight_id: ['insight_id', 'id'],
        link_id: ['link_id', 'link', 'owner_id'],
        source_from: ['source_from'],
        source_to: ['source_to'],
        generated_at: ['generated_at', 'data_geracao'],
        title: ['title', 'titulo'],
        insight: ['insight', 'texto'],
        category: ['category', 'categoria'],
        priority: ['priority', 'prioridade'],
        action: ['action', 'acao'],
        confidence: ['confidence', 'confianca'],
        metrics_json: ['metrics_json', 'metricas_json'],
        model: ['model', 'modelo'],
        temperature: ['temperature']
      };

      // Parse dos dados com aliases e normalização
      const people = parseSheetDataFlexible(peopleData, peopleAliases).map(p => ({
        link_id: String(p.link_id || ''),
        person_alias: String(p.person_alias || p.first_name || ''),
        first_name: String(p.first_name || ''),
        last_name: String(p.last_name || ''),
        email: String(p.email || ''),
        phone: String(p.phone || ''),
      }));

      const accounts = parseSheetDataFlexible(accountsData, accountsAliases).map(a => {
        const account_type = String(a.account_type || '').trim();
        const is_liability_flag = toBool(a.is_liability);
        const nameN = normalize(a.account_name);
        const instN = normalize(a.institution_name);
        const typeN = normalize(account_type);
        const balance_current = parseNumber(a.balance_current);
        const liability_outstanding = parseNumber(a.liability_outstanding);
        const heuristicLiability = typeN.includes('liab') || typeN.includes('passiv') || typeN.includes('cartao')
          || nameN.includes('visa') || nameN.includes('master') || nameN.includes('cartao')
          || instN.includes('visa') || instN.includes('master') || instN.includes('cartao')
          || balance_current < 0;
        const is_liability_account = is_liability_flag || heuristicLiability || liability_outstanding > 0;

        return {
          account_id: String(a.account_id || ''),
          link_id: String(a.link_id || ''),
          account_name: String(a.account_name || ''),
          institution_name: String(a.institution_name || ''),
          balance_current,
          currency: String(a.currency || 'BRL'),
          liability_outstanding,
          funds_total: parseNumber(a.funds_total),
          account_type,
          is_liability: is_liability_flag,
          is_liability_account,
        } as Account;
      });

      const transactions = parseSheetDataFlexible(transactionsData, transactionsAliases).map(t => {
        const rawFlow = normalize(t.flow);
        let flow: 'inflow' | 'outflow' | undefined = undefined;
        if (rawFlow.includes('in') || rawFlow.includes('entrada') || rawFlow.includes('receit') || rawFlow.includes('credit')) flow = 'inflow';
        if (rawFlow.includes('out') || rawFlow.includes('saida') || rawFlow.includes('despes') || rawFlow.includes('debit')) flow = 'outflow';
        const amt = parseNumber(t.amount);
        const signedAmount = flow === 'outflow' ? -Math.abs(amt) : Math.abs(amt);
        return {
          transaction_id: String(t.transaction_id || ''),
          link_id: String(t.link_id || ''),
          account_id: t.account_id ? String(t.account_id) : undefined,
          amount: signedAmount,
          description: String(t.description || ''),
          category: String(t.category || ''),
          value_date: parseDate(t.value_date),
          posted_date: parseDate(t.posted_date),
          flow,
          merchant: String(t.merchant || ''),
        } as Transaction;
      });

      const dashboard = parseSheetDataFlexible(dashboardData, dashboardAliases).map(d => ({
        link_id: String(d.link_id || ''),
        total_balance: parseNumber(d.total_balance),
        gasto_mes_atual: parseNumber(d.gasto_mes_atual),
        gasto_mes_anterior: parseNumber(d.gasto_mes_anterior),
        variacao_percentual: parseNumber(d.variacao_percentual),
        total_transactions: parseNumber(d.total_transactions),
        inflow_sum: parseNumber(d.inflow_sum),
        outflow_sum: parseNumber(d.outflow_sum),
        net_flow: parseNumber(d.net_flow),
      }));

      const insights = parseSheetDataFlexible(insightsData, insightsAliases).map(i => ({
        insight_id: String(i.insight_id || ''),
        link_id: String(i.link_id || ''),
        source_from: String(i.source_from || ''),
        source_to: String(i.source_to || ''),
        generated_at: parseDate(i.generated_at),
        title: String(i.title || ''),
        insight: String(i.insight || ''),
        category: String(i.category || ''),
        priority: (String(i.priority || 'medium') as 'low' | 'medium' | 'high'),
        action: String(i.action || ''),
        confidence: parseNumber(i.confidence),
        metrics_json: String(i.metrics_json || ''),
        model: String(i.model || ''),
        temperature: parseNumber(i.temperature),
        prompt_tokens: parseNumber(i.prompt_tokens),
        completion_tokens: parseNumber(i.completion_tokens),
      }));

      const newData = {
        people,
        accounts,
        transactions,
        dashboard,
        insights
      };

      setData(newData);
      setMemoryCache({ data: newData, timestamp: Date.now() });

      // Selecionar o primeiro owner se não houver seleção
      if (!selectedOwner && people.length > 0) {
        setSelectedOwner(people[0].link_id);
      }

      if (!opts?.silent) {
        toast({
          title: "Dados atualizados",
          description: `(${people.length} pessoas, ${accounts.length} contas, ${transactions.length} transações)`,
        });
      }

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
  }, [selectedOwner, toast]);

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

    const { accounts, transactions } = ownerData;
    
    // Calcular totais das contas (ativos x passivos)
    const totalAssets = accounts
      .filter(acc => !acc.is_liability_account)
      .reduce((sum, acc) => sum + acc.balance_current, 0);
    const totalLiabilities = accounts
      .filter(acc => acc.is_liability_account)
      .reduce((sum, acc) => sum + (acc.liability_outstanding && acc.liability_outstanding > 0 ? acc.liability_outstanding : Math.abs(Math.min(acc.balance_current, 0))), 0);
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

    // Calcular entradas/saídas do mês atual a partir das transações
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();
    const txThisMonth = transactions.filter(t => {
      if (!t.value_date) return false;
      const d = new Date(t.value_date);
      return d.getUTCFullYear() === currentYear && d.getUTCMonth() === currentMonth;
    });
    const monthlyIncome = txThisMonth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = Math.abs(txThisMonth.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      totalAssets,
      totalLiabilities,
      topCategories,
      totalTransactions: txThisMonth.length,
      netFlow: monthlyIncome - monthlyExpenses,
      variation: 0
    };
  }, [getSelectedOwnerData]);

  // Versão parametrizada por mês/ano
  const getSelectedOwnerMetricsFor = useCallback((month: number, year: number) => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) return null;

    const { accounts, transactions } = ownerData;

    const totalAssets = accounts
      .filter(acc => !acc.is_liability_account)
      .reduce((sum, acc) => sum + acc.balance_current, 0);
    const totalLiabilities = accounts
      .filter(acc => acc.is_liability_account)
      .reduce((sum, acc) => sum + (acc.liability_outstanding && acc.liability_outstanding > 0 ? acc.liability_outstanding : Math.abs(Math.min(acc.balance_current, 0))), 0);
    const totalBalance = totalAssets - totalLiabilities;

    const txThisPeriod = transactions.filter(t => {
      if (!t.value_date) return false;
      const d = new Date(t.value_date);
      return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    });
    const monthlyIncome = txThisPeriod.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = Math.abs(txThisPeriod.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const categoryMap = new Map<string, number>();
    txThisPeriod.forEach(t => {
      if (t.amount < 0) {
        const category = t.category || 'uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(t.amount));
      }
    });
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      totalAssets,
      totalLiabilities,
      topCategories,
      totalTransactions: txThisPeriod.length,
      netFlow: monthlyIncome - monthlyExpenses,
      variation: 0,
    };
  }, [getSelectedOwnerData]);

  const getSelectedOwnerTransactionsFor = useCallback((month: number, year: number) => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) return [] as Transaction[];
    return ownerData.transactions.filter(t => {
      if (!t.value_date) return false;
      const d = new Date(t.value_date);
      return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    });
  }, [getSelectedOwnerData]);

  const getSelectedOwnerAccountsSnapshot = useCallback(() => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) return [] as Account[];
    return ownerData.accounts;
  }, [getSelectedOwnerData]);

  // Carregar dados na inicialização
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Utilitário para limpar nomes que vierem poluídos com GUIDs/IDs
  const cleanOwnerText = (text: string | undefined): string => {
    if (!text) return '';
    return String(text)
      // remove GUIDs
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '')
      // remove múltiplas vírgulas
      .replace(/,+/g, ' ')
      // colapsa espaços
      .replace(/\s+/g, ' ')
      .trim();
  };

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
    getSelectedOwnerMetricsFor,
    getSelectedOwnerTransactionsFor,
    getSelectedOwnerAccountsSnapshot,
    owners: data.people.map(p => {
      const fullName = cleanOwnerText(`${p.first_name || ''} ${p.last_name || ''}`);
      const alias = cleanOwnerText(p.person_alias);
      const name = fullName || alias || 'Usuário';
      return { id: String(p.link_id), name };
    })
  };
};
