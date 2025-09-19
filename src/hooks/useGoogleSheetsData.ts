import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import {
  mockPeopleData,
  mockAccountsData,
  mockTransactionsData,
  mockDashboardData,
  mockAIInsightsData,
} from '@/data/mockGoogleSheetsData';
import { ENV_CONFIG } from '@/config/env';
import { buildBatchGetUrl } from '@/config/googleSheets';

type RawSheetCell = string | number | boolean | null | undefined;
type RawSheetRow = RawSheetCell[];
type RawSheetValues = RawSheetRow[];
type RawRecord = Record<string, RawSheetCell>;

type RawDataset = {
  people: RawRecord[];
  accounts: RawRecord[];
  transactions: RawRecord[];
  dashboard: RawRecord[];
  insights: RawRecord[];
};

type GVizColumn = { id?: string | null; label?: string | null };
type GVizCell = { v?: RawSheetCell | Record<string, unknown> | null; f?: string | null };
type GVizRow = { c?: (GVizCell | null)[] | null };
type GVizResponse = { table?: { cols?: (GVizColumn | null)[] | null; rows?: (GVizRow | null)[] | null } };

const parseSheetData = (values: RawSheetValues): RawRecord[] => {
  if (!values || values.length === 0) {
    return [];
  }

  const headers = (values[0] ?? []).map((header, index) => {
    const headerText = header ?? '';
    return headerText === '' ? `col_${index}` : String(headerText).trim();
  });

  return values.slice(1).map((row) => {
    const record: RawRecord = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = row[index];
    });
    return record;
  });
};

const cloneRecords = <T extends Record<string, unknown>>(items: T[]): RawRecord[] =>
  items.map((item) => {
    const clone: RawRecord = {};
    Object.entries(item).forEach(([key, value]) => {
      clone[key] = value as RawSheetCell;
    });
    return clone;
  });

const pickValue = (record: RawRecord, keys: readonly string[]): RawSheetCell => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
};

const toStringValue = (value: RawSheetCell, fallback = ''): string => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

const toNumberValue = (value: RawSheetCell): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    let normalized = value.trim();
    if (!normalized) return 0;
    const isNegative = /^-/.test(normalized) || /\(.*\)/.test(normalized);

    normalized = normalized.replace(/[()\s]/g, '');
    normalized = normalized.replace(/[^0-9,.-]/g, '');

    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');

    if (lastComma > -1 && lastDot > -1) {
      if (lastComma > lastDot) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = normalized.replace(/,/g, '');
      }
    } else if (lastComma > -1) {
      normalized = normalized.replace(/,/g, '.');
    }

    const parsed = Number.parseFloat(normalized);
    if (Number.isNaN(parsed)) return 0;
    return isNegative ? -Math.abs(parsed) : parsed;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return 0;
};

const toBooleanValue = (value: RawSheetCell): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'sim', 'y', 'ok'].includes(normalized);
  }
  return false;
};

const excelSerialToISO = (serial: number): string => {
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const ms = serial * 24 * 60 * 60 * 1000;
  return new Date(epoch.getTime() + ms).toISOString();
};

const toISODateValue = (value: RawSheetCell): string => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return excelSerialToISO(value);
  }

  const stringValue = toStringValue(value);
  if (!stringValue) return '';

  const trimmed = stringValue.trim();
  const gvizPattern = /^Date\((\d+),(\d+),(\d+)\)$/;
  const gvizMatch = trimmed.match(gvizPattern);
  if (gvizMatch) {
    const year = Number.parseInt(gvizMatch[1], 10);
    const month = Number.parseInt(gvizMatch[2], 10);
    const day = Number.parseInt(gvizMatch[3], 10);
    return new Date(Date.UTC(year, month, day)).toISOString();
  }

  const parsed = Date.parse(trimmed.replace(' ', 'T'));
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  const brPattern = /^(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})$/;
  const brMatch = trimmed.match(brPattern);
  if (brMatch) {
    const day = Number.parseInt(brMatch[1], 10);
    const month = Number.parseInt(brMatch[2], 10) - 1;
    let year = Number.parseInt(brMatch[3], 10);
    if (year < 100) {
      year += year >= 70 ? 1900 : 2000;
    }
    return new Date(Date.UTC(year, month, day)).toISOString();
  }

  return '';
};

const detectFlowDirection = (rawFlow: RawSheetCell, amount: number): 'inflow' | 'outflow' => {
  const flowText = toStringValue(rawFlow).toLowerCase();

  if (flowText) {
    if (/(in|entrada|receit|credit)/.test(flowText)) {
      return 'inflow';
    }

    if (/(out|saida|saída|despes|debit|pagamento|withdraw|saque)/.test(flowText)) {
      return 'outflow';
    }
  }

  if (amount < 0) return 'outflow';
  if (amount > 0) return 'inflow';
  return 'inflow';
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

type NormalizedData = {
  people: Person[];
  accounts: Account[];
  transactions: Transaction[];
  dashboard: Dashboard[];
  insights: Insight[];
};

const normalizeDataset = (raw: RawDataset): NormalizedData => {
  const people: Person[] = raw.people
    .map((record) => {
      const linkId = toStringValue(pickValue(record, ['link_id', 'owner_id', 'id']));
      if (!linkId) return null;

      const firstName = toStringValue(pickValue(record, ['first_name', 'nome', 'name']));
      const lastName = toStringValue(pickValue(record, ['last_name', 'sobrenome']));
      const alias = toStringValue(pickValue(record, ['person_alias', 'alias', 'apelido'])) || `${firstName} ${lastName}`.trim();

      return {
        link_id: linkId,
        person_alias: alias || linkId,
        first_name: firstName,
        last_name: lastName,
        email: toStringValue(pickValue(record, ['email'])),
        phone: toStringValue(pickValue(record, ['phone', 'telefone'])) || undefined,
      };
    })
    .filter((item): item is Person => item !== null);

  const accounts: Account[] = raw.accounts
    .map((record) => {
      const linkId = toStringValue(pickValue(record, ['link_id', 'owner_id', 'person_id']));
      const accountId = toStringValue(pickValue(record, ['account_id', 'id']));
      if (!linkId || !accountId) return null;

      const balance = toNumberValue(pickValue(record, ['balance_current', 'balance', 'current_balance']));
      const liabilityOutstanding = toNumberValue(pickValue(record, ['liability_outstanding', 'passivo', 'outstanding']));
      const accountType = toStringValue(pickValue(record, ['account_type', 'type', 'categoria', 'category']));
      const isLiability = toBooleanValue(pickValue(record, ['is_liability', 'liability', 'is_liability_account']))
        || balance < 0
        || liabilityOutstanding > 0;

      return {
        account_id: accountId,
        link_id: linkId,
        account_name: toStringValue(pickValue(record, ['account_name', 'nome_conta', 'name']), 'Conta'),
        institution_name: toStringValue(pickValue(record, ['institution_name', 'institution', 'bank']), 'Instituição'),
        balance_current: balance,
        currency: toStringValue(pickValue(record, ['currency', 'moeda']), 'BRL'),
        liability_outstanding: liabilityOutstanding || undefined,
        funds_total: toNumberValue(pickValue(record, ['funds_total', 'saldo_aplicado', 'investments'])) || undefined,
        account_type: accountType || undefined,
        is_liability: isLiability,
      };
    })
    .filter((item): item is Account => item !== null);

  const transactions: Transaction[] = raw.transactions
    .map((record) => {
      const transactionId = toStringValue(pickValue(record, ['transaction_id', 'id']));
      const linkId = toStringValue(pickValue(record, ['link_id', 'owner_id', 'person_id']));
      if (!transactionId || !linkId) return null;

      const rawAmount = toNumberValue(pickValue(record, ['amount', 'valor', 'value']));
      const flow = detectFlowDirection(pickValue(record, ['flow', 'direction', 'tipo', 'type', 'transaction_type', 'status', 'nature']), rawAmount);
      const signedAmount = flow === 'outflow' ? -Math.abs(rawAmount) : Math.abs(rawAmount);
      const valueDate = toISODateValue(pickValue(record, ['value_date', 'date', 'data', 'transaction_date', 'posted_date']));
      const postedDate = toISODateValue(pickValue(record, ['posted_date', 'data_postagem']));

      return {
        transaction_id: transactionId,
        link_id: linkId,
        account_id: toStringValue(pickValue(record, ['account_id', 'conta', 'account'])) || undefined,
        amount: Number.isFinite(signedAmount) ? signedAmount : 0,
        description: toStringValue(pickValue(record, ['description', 'descricao', 'merchant_name']), 'Transação'),
        category: toStringValue(pickValue(record, ['category', 'categoria'])),
        value_date: valueDate || postedDate || '',
        posted_date: postedDate || valueDate || undefined,
        flow,
        merchant: toStringValue(pickValue(record, ['merchant', 'merchant_name', 'estabelecimento'])) || undefined,
      };
    })
    .filter((item): item is Transaction => item !== null)
    .sort((a, b) => {
      const timeA = a.value_date ? new Date(a.value_date).getTime() : 0;
      const timeB = b.value_date ? new Date(b.value_date).getTime() : 0;
      if (timeA === timeB) {
        return b.transaction_id.localeCompare(a.transaction_id);
      }
      return timeB - timeA;
    });

  const dashboard: Dashboard[] = raw.dashboard
    .map((record) => {
      const linkId = toStringValue(pickValue(record, ['link_id', 'owner_id', 'id']));
      if (!linkId) return null;

      return {
        link_id: linkId,
        total_balance: toNumberValue(pickValue(record, ['total_balance', 'saldo_total'])),
        gasto_mes_atual: toNumberValue(pickValue(record, ['gasto_mes_atual', 'gastos_mes_atual'])),
        gasto_mes_anterior: toNumberValue(pickValue(record, ['gasto_mes_anterior', 'gastos_mes_anterior'])),
        variacao_percentual: toNumberValue(pickValue(record, ['variacao_percentual', 'variacao_%', 'variation_percent'])),
        total_transactions: toNumberValue(pickValue(record, ['total_transactions', 'qtd_transacoes', 'transactions_count'])),
        inflow_sum: toNumberValue(pickValue(record, ['inflow_sum', 'entradas'])),
        outflow_sum: toNumberValue(pickValue(record, ['outflow_sum', 'saidas'])),
        net_flow: toNumberValue(pickValue(record, ['net_flow', 'fluxo_liquido'])),
      };
    })
    .filter((item): item is Dashboard => item !== null);

  const insights: Insight[] = raw.insights
    .map((record) => {
      const insightId = toStringValue(pickValue(record, ['insight_id', 'id']));
      const linkId = toStringValue(pickValue(record, ['link_id', 'owner_id', 'person_id']));
      if (!insightId || !linkId) return null;

      const priorityRaw = toStringValue(pickValue(record, ['priority', 'prioridade']), 'medium').toLowerCase();
      const priority: Insight['priority'] = priorityRaw.includes('alta') || priorityRaw.includes('high')
        ? 'high'
        : priorityRaw.includes('baixa') || priorityRaw.includes('low')
          ? 'low'
          : 'medium';

      return {
        insight_id: insightId,
        link_id: linkId,
        source_from: toISODateValue(pickValue(record, ['source_from', 'period_start'])),
        source_to: toISODateValue(pickValue(record, ['source_to', 'period_end'])),
        generated_at: toISODateValue(pickValue(record, ['generated_at', 'created_at'])) || new Date().toISOString(),
        title: toStringValue(pickValue(record, ['title', 'titulo']), 'Insight'),
        insight: toStringValue(pickValue(record, ['insight', 'texto', 'description'])),
        category: toStringValue(pickValue(record, ['category', 'categoria']), 'general'),
        priority,
        action: toStringValue(pickValue(record, ['action', 'acao'])),
        confidence: toNumberValue(pickValue(record, ['confidence', 'confianca'])) || 0,
        metrics_json: toStringValue(pickValue(record, ['metrics_json', 'metricas_json'])),
      };
    })
    .filter((item): item is Insight => item !== null);

  return {
    people,
    accounts,
    transactions,
    dashboard,
    insights,
  };
};

const fetchDatasetFromSheetsApi = async (): Promise<RawDataset> => {
  const url = buildBatchGetUrl([
    'People',
    'Accounts',
    'Transactions',
    'Dashboard',
    'AI_Insights',
  ]);

  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`SHEETS_API_ERROR:${response.status}:${message}`);
  }

  const payload = await response.json() as { valueRanges?: Array<{ values?: RawSheetValues }> };
  const ranges = payload.valueRanges ?? [];

  const toRecords = (index: number): RawRecord[] => {
    const values = ranges[index]?.values ?? [];
    return parseSheetData(values as RawSheetValues);
  };

  return {
    people: toRecords(0),
    accounts: toRecords(1),
    transactions: toRecords(2),
    dashboard: toRecords(3),
    insights: toRecords(4),
  };
};

const fetchDatasetFromGViz = async (): Promise<RawDataset> => {
  const spreadsheetId = ENV_CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID_NOT_CONFIGURED');
  }

  const fetchSheet = async (sheetName: string): Promise<RawRecord[]> => {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GVIZ_ERROR:${sheetName}:${response.status}`);
    }

    const rawText = await response.text();
    const jsonText = rawText.replace(/^[^({]+/, '').replace(/;$/, '');
    const json = JSON.parse(jsonText) as GVizResponse;

    const cols = json.table?.cols ?? [];
    const rows = json.table?.rows ?? [];

    const header: string[] = cols.map((column, index) => {
      const label = column?.label ? String(column.label).trim() : '';
      const id = column?.id ? String(column.id).trim() : `col_${index}`;
      const fallback = `col_${index}`;
      return label || id || fallback;
    });

    const values: RawSheetValues = rows.map((row) => {
      const cells = row?.c ?? [];
      return header.map((_column, idx) => {
        const cell = cells[idx] ?? null;
        const rawValue = cell?.v ?? cell?.f ?? '';

        if (rawValue === null || rawValue === undefined) {
          return '';
        }

        if (typeof rawValue === 'object') {
          return JSON.stringify(rawValue);
        }

        return rawValue as RawSheetCell;
      });
    });

    return parseSheetData([header, ...values]);
  };

  const [people, accounts, transactions, dashboard, insights] = await Promise.all([
    fetchSheet('People'),
    fetchSheet('Accounts'),
    fetchSheet('Transactions'),
    fetchSheet('Dashboard'),
    fetchSheet('AI_Insights'),
  ]);

  return {
    people,
    accounts,
    transactions,
    dashboard,
    insights,
  };
};

const buildMockDataset = (): RawDataset => ({
  people: cloneRecords(mockPeopleData),
  accounts: cloneRecords(mockAccountsData),
  transactions: cloneRecords(mockTransactionsData),
  dashboard: cloneRecords(mockDashboardData),
  insights: cloneRecords(mockAIInsightsData),
});

export const useGoogleSheetsData = () => {
  const [data, setData] = useState<NormalizedData>({
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

  const fetchAllData = useCallback(async (opts?: { force?: boolean; silent?: boolean }) => {
    if (isLoading && !opts?.force) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let normalized: NormalizedData;
      let usedMock = false;
      let warning: string | null = null;
      let apiValid: boolean | null = apiKeyValid;
      let source: 'google_sheets' | 'mock' = 'google_sheets';

      if (ENV_CONFIG.APP.USE_MOCK_DATA) {
        normalized = normalizeDataset(buildMockDataset());
        usedMock = true;
        apiValid = true;
        source = 'mock';
      } else {
        try {
          const raw = await fetchDatasetFromSheetsApi();
          normalized = normalizeDataset(raw);
          apiValid = true;
        } catch (apiError) {
          console.warn('[HOPE] Sheets API falhou, tentando fallback GViz', apiError);
          try {
            const raw = await fetchDatasetFromGViz();
            normalized = normalizeDataset(raw);
            apiValid = true;
            warning = 'API Key restrita para este domínio. Dados carregados via fallback público (GViz).';
          } catch (gvizError) {
            console.error('[HOPE] Fallback GViz falhou, usando dados de demonstração', gvizError);
            normalized = normalizeDataset(buildMockDataset());
            usedMock = true;
            apiValid = false;
            source = 'mock';
            warning = 'Não foi possível acessar o Google Sheets. Exibindo dados de demonstração.';
          }
        }
      }

      setData(normalized);
      setIsUsingMockData(usedMock);
      setDataSource(source);
      setApiKeyValid(apiValid);

      if (!selectedOwner && normalized.people.length > 0) {
        setSelectedOwner(normalized.people[0].link_id);
      }

      if (!opts?.silent) {
        if (usedMock) {
          toast({
            title: 'Modo demonstração',
            description: 'Dados mock carregados.',
          });
        } else {
          toast({
            title: 'Dados atualizados',
            description: `${normalized.people.length} pessoas, ${normalized.accounts.length} contas, ${normalized.transactions.length} transações.`,
          });
        }
      }

      setError(warning);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados.';
      setError(message);
      setApiKeyValid(false);
      setDataSource('mock');
      setIsUsingMockData(true);

      setData(normalizeDataset(buildMockDataset()));

      toast({
        title: 'Erro ao carregar dados',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyValid, isLoading, selectedOwner, toast]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchAllData({ silent: true });
    }
  }, [fetchAllData]);

  const getSelectedOwnerData = useCallback((): OwnerData | null => {
    if (!selectedOwner) return null;

    const person = data.people.find((p) => p.link_id === selectedOwner) ?? null;
    const accounts = data.accounts.filter((a) => a.link_id === selectedOwner);
    const transactions = data.transactions.filter((t) => t.link_id === selectedOwner);
    const dashboard = data.dashboard.find((d) => d.link_id === selectedOwner) ?? null;
    const insights = data.insights.filter((i) => i.link_id === selectedOwner);

    return {
      person,
      accounts,
      transactions,
      dashboard,
      insights,
    };
  }, [selectedOwner, data]);

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

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = ownerData.transactions.filter((t) => {
      if (!t.value_date) return false;
      const transactionDate = new Date(t.value_date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.flow === 'inflow' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.flow === 'outflow' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const categoryTotals: Record<string, number> = {};
    monthlyTransactions.forEach((t) => {
      const isOutflow = t.flow === 'outflow' || t.amount < 0;
      if (!isOutflow) {
        return;
      }
      const category = t.category || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalAssets = ownerData.accounts
      .filter((a) => !a.is_liability)
      .reduce((sum, a) => sum + (a.balance_current || 0), 0);

    const totalLiabilities = ownerData.accounts
      .filter((a) => a.is_liability)
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

    const monthlyTransactions = ownerData.transactions.filter((t) => {
      if (!t.value_date) return false;
      const transactionDate = new Date(t.value_date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.flow === 'inflow' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.flow === 'outflow' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const categoryTotals: Record<string, number> = {};
    monthlyTransactions.forEach((t) => {
      const isOutflow = t.flow === 'outflow' || t.amount < 0;
      if (!isOutflow) {
        return;
      }
      const category = t.category || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalAssets = ownerData.accounts
      .filter((a) => !a.is_liability)
      .reduce((sum, a) => sum + (a.balance_current || 0), 0);

    const totalLiabilities = ownerData.accounts
      .filter((a) => a.is_liability)
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

  const getSelectedOwnerTransactionsFor = useCallback((month: number, year: number): Transaction[] => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) return [];

    return ownerData.transactions.filter((t) => {
      if (!t.value_date) return false;
      const transactionDate = new Date(t.value_date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
  }, [getSelectedOwnerData]);

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

    const ytdTransactions = ownerData.transactions.filter((t) => {
      if (!t.value_date) return false;
      const transactionDate = new Date(t.value_date);
      return transactionDate.getFullYear() === year;
    });

    const monthlyIncome = ytdTransactions
      .filter((t) => t.flow === 'inflow' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = ytdTransactions
      .filter((t) => t.flow === 'outflow' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const categoryTotals: Record<string, number> = {};
    ytdTransactions.forEach((t) => {
      const isOutflow = t.flow === 'outflow' || t.amount < 0;
      if (!isOutflow) {
        return;
      }
      const category = t.category || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalAssets = ownerData.accounts
      .filter((a) => !a.is_liability)
      .reduce((sum, a) => sum + (a.balance_current || 0), 0);

    const totalLiabilities = ownerData.accounts
      .filter((a) => a.is_liability)
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

  const getSelectedOwnerTransactionsYTD = useCallback((year: number): Transaction[] => {
    const ownerData = getSelectedOwnerData();
    if (!ownerData) return [];

    return ownerData.transactions.filter((t) => {
      if (!t.value_date) return false;
      const transactionDate = new Date(t.value_date);
      return transactionDate.getFullYear() === year;
    });
  }, [getSelectedOwnerData]);

  const owners = data.people.map((p) => ({
    id: p.link_id,
    name: p.person_alias || `${p.first_name} ${p.last_name}`.trim() || 'Usuário',
    alias: p.person_alias,
    fullName: `${p.first_name} ${p.last_name}`.trim(),
  }));

  return {
    data,
    selectedOwner,
    setSelectedOwner,
    isLoading,
    error,
    apiKeyValid,
    dataSource,
    isUsingMockData,
    owners,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetrics,
    getSelectedOwnerMetricsFor,
    getSelectedOwnerTransactionsFor,
    getSelectedOwnerMetricsYTD,
    getSelectedOwnerTransactionsYTD,
  };
};

