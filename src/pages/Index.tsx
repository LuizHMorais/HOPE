import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import { AccountsOverview } from '@/components/AccountsOverview';
import HeaderFilters from '@/components/HeaderFilters';
import { AIInsights } from '@/components/AIInsights';
import { DataStatus } from '@/components/DataStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { formatCurrency } from '@/lib/mockData';
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  BarChart3,
  Wallet,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  Target,
  Volume2,
  Play
} from 'lucide-react';
import { GOOGLE_SHEETS_CONFIG } from '@/config/googleSheets';

type Txn = {
  transaction_id?: string;
  description?: string;
  posted_date?: string;
  value_date?: string;
  amount: number;
  account_id?: string;
  category?: string;
  flow?: 'inflow' | 'outflow';
};

type BudgetGoal = {
  category: string;
  planned: number;
  spent: number;
  percentage: number;
};

const categoryKey = (cat: { category?: string }, index: number) =>
  `${(cat.category || 'sem-categoria').toLowerCase()}-${index}`;

const transactionKey = (transaction: Txn, index: number) => (
  transaction.transaction_id
    || [
      transaction.account_id || 'acc',
      transaction.posted_date || transaction.value_date || 'date',
      (transaction.description || 'desc').slice(0, 30),
      Math.round((transaction.amount || 0) * 100)
    ].join('-')
) + `-${index}`;

const formatCategoryLabel = (value?: string) => {
  const label = value?.trim();
  return label && label.length > 0 ? label : 'Sem categoria';
};

const formatDateLabel = (value?: string) => {
  if (!value) return 'Sem data';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sem data' : date.toLocaleDateString('pt-BR');
};

const Index = () => {
  const {
    selectedOwner,
    setSelectedOwner,
    isLoading,
    apiKeyValid,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetricsFor,
    getSelectedOwnerTransactionsFor,
    getSelectedOwnerTransactionsYTD,
    getSelectedOwnerMetricsYTD,
    owners,
    dataSource,
    isUsingMockData,
    error
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [ytdMode, setYtdMode] = useState<boolean>(false);

  const ownerMetrics = useMemo(
    () => (ytdMode
      ? getSelectedOwnerMetricsYTD(selectedYear)
      : getSelectedOwnerMetricsFor(selectedMonth, selectedYear)),
    [
      getSelectedOwnerMetricsFor,
      getSelectedOwnerMetricsYTD,
      selectedMonth,
      selectedYear,
      ytdMode
    ]
  );

  const transactionsForDisplay = useMemo(
    () => (ytdMode
      ? getSelectedOwnerTransactionsYTD(selectedYear)
      : getSelectedOwnerTransactionsFor(selectedMonth, selectedYear)),
    [
      getSelectedOwnerTransactionsFor,
      getSelectedOwnerTransactionsYTD,
      selectedMonth,
      selectedYear,
      ytdMode
    ]
  );

  const availableMonthsByYear = useMemo(() => {
    if (!ownerData) {
      return {};
    }

    const monthsByYear = new Map<number, Set<number>>();
    ownerData.transactions.forEach((transaction) => {
      const baseDate = transaction.value_date || transaction.posted_date;
      if (!baseDate) {
        return;
      }

      const parsedDate = new Date(baseDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return;
      }

      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth();
      if (!monthsByYear.has(year)) {
        monthsByYear.set(year, new Set<number>());
      }
      monthsByYear.get(year)?.add(month);
    });

    const result: Record<number, number[]> = {};
    monthsByYear.forEach((months, year) => {
      result[year] = Array.from(months).sort((a, b) => a - b);
    });

    return result;
  }, [ownerData]);

  const topSpendingCategory = ownerMetrics?.topCategories?.[0];
  const hasSpendingCategory = Boolean(topSpendingCategory && topSpendingCategory.amount > 0);

  const [transactionsAccount, setTransactionsAccount] = useState('all');
  const [transactionsSearchTerm, setTransactionsSearchTerm] = useState('');
  const [transactionsCategory, setTransactionsCategory] = useState('all');
  const [transactionsLimit, setTransactionsLimit] = useState(10);

  const accountLabels = useMemo(() => {
    const labels = new Map<string, string>();
    ownerData?.accounts.forEach((account) => {
      labels.set(account.account_id, account.account_name || account.account_id);
    });
    return labels;
  }, [ownerData]);

  const transactionAccounts = useMemo(() => {
    const unique = new Set<string>();
    transactionsForDisplay.forEach((transaction) => {
      if (transaction.account_id) {
        unique.add(transaction.account_id);
      }
    });

    const list = Array.from(unique).sort((a, b) => {
      const labelA = accountLabels.get(a) ?? a;
      const labelB = accountLabels.get(b) ?? b;
      return labelA.localeCompare(labelB, 'pt-BR');
    });
    return ['all', ...list];
  }, [transactionsForDisplay, accountLabels]);

  const transactionCategories = useMemo(() => {
    const unique = new Set<string>();
    transactionsForDisplay.forEach((transaction) => {
      unique.add(formatCategoryLabel(transaction.category));
    });

    const list = Array.from(unique).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return ['all', ...list];
  }, [transactionsForDisplay]);

  useEffect(() => {
    setTransactionsLimit(10);
  }, [transactionsAccount, transactionsCategory, transactionsSearchTerm, transactionsForDisplay]);

  const sortedTransactions = useMemo(() => {
    const toTimestamp = (transaction: Txn) => {
      const base = transaction.value_date || transaction.posted_date;
      if (!base) return 0;
      const parsed = Date.parse(base);
      if (Number.isNaN(parsed)) return 0;
      return parsed;
    };

    return [...transactionsForDisplay].sort((a, b) => toTimestamp(b) - toTimestamp(a));
  }, [transactionsForDisplay]);

  const filteredTransactions = useMemo(() => {
    const search = transactionsSearchTerm.trim().toLowerCase();

    return sortedTransactions.filter((transaction) => {
      const categoryLabel = formatCategoryLabel(transaction.category);
      const accountId = transaction.account_id ?? '';
      const fallbackAccountLabel = accountId || 'Conta não identificada';
      const accountLabel = accountLabels.get(accountId) ?? fallbackAccountLabel;
      const matchesCategory = transactionsCategory === 'all' || categoryLabel === transactionsCategory;
      const matchesAccount = transactionsAccount === 'all' || accountId === transactionsAccount;
      const matchesSearch = !search
        || (transaction.description ?? '').toLowerCase().includes(search)
        || categoryLabel.toLowerCase().includes(search)
        || accountLabel.toLowerCase().includes(search);

      return matchesCategory && matchesAccount && matchesSearch;
    });
  }, [sortedTransactions, transactionsCategory, transactionsAccount, transactionsSearchTerm, accountLabels]);

  const displayedTransactions = useMemo(
    () => filteredTransactions.slice(0, transactionsLimit),
    [filteredTransactions, transactionsLimit]
  );

  const canLoadMoreTransactions = transactionsLimit < filteredTransactions.length;
  const filtersActive =
    transactionsCategory !== 'all'
    || transactionsAccount !== 'all'
    || transactionsSearchTerm.trim().length > 0;

  const totalIncome = useMemo(
    () => transactionsForDisplay
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactionsForDisplay]
  );

  const totalExpenses = useMemo(
    () => Math.abs(transactionsForDisplay
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)),
    [transactionsForDisplay]
  );

  const filteredIncome = useMemo(
    () => filteredTransactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [filteredTransactions]
  );

  const filteredExpenses = useMemo(
    () => Math.abs(filteredTransactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)),
    [filteredTransactions]
  );

  const netFlow = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  const filteredNetFlow = useMemo(() => filteredIncome - filteredExpenses, [filteredIncome, filteredExpenses]);

  const monthlyGoals: BudgetGoal[] = useMemo(() => {
    if (!ownerMetrics?.topCategories?.length) return [];

    return ownerMetrics.topCategories.map((category) => {
      const spent = category.amount;
      const planned = category.amount * 1.2;
      const percentage = planned > 0 ? Math.min((spent / planned) * 100, 100) : 0;

      return {
        category: category.category,
        planned,
        spent,
        percentage
      };
    });
  }, [ownerMetrics]);

  const insightsHighlights = useMemo(() => (ownerData?.insights ?? []).slice(0, 3), [ownerData]);

  const audioReportsCard = (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="w-5 h-5 text-primary" />
          <span>Relatórios em áudio (preview)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ouça resumos gerados pela IA com base nos principais insights financeiros do período.
        </p>

        {insightsHighlights.length > 0 ? (
          insightsHighlights.map((insight, index) => (
            <div
              key={`${insight.insight_id}-${index}`}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-sm text-foreground">{insight.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateLabel(insight.generated_at)} â€¢ {insight.category || 'sem categoria'}
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Reproduzir
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum áudio disponível ainda.</p>
            <p className="text-sm">Os relatórios serão liberados a partir da geração dos primeiros insights.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const periodLabel = useMemo(() => {
    if (ytdMode) {
      return `YTD ${selectedYear}`;
    }

    const baseDate = new Date(selectedYear, selectedMonth, 1);
    return baseDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [selectedMonth, selectedYear, ytdMode]);

  const handleResetTransactionFilters = () => {
    setTransactionsSearchTerm('');
    setTransactionsCategory('all');
    setTransactionsAccount('all');
  };

  const handleLoadMoreTransactions = () => {
    setTransactionsLimit((previous) => Math.min(previous + 10, filteredTransactions.length));
  };

  const mockModeEnabled = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center animate-float">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              H.O.P.E.
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sua assistente inteligente para organização financeira pessoal
          </p>
          <p className="text-sm text-muted-foreground">Help &amp; Organize Personal Economics</p>
        </div>

        <DataStatus
          isUsingMockData={isUsingMockData}
          apiKeyValid={apiKeyValid}
          onRefresh={() => fetchAllData({ force: true })}
          isLoading={isLoading}
          dataSource={dataSource === 'google_sheets' ? 'api' : dataSource}
          errorMessage={error}
          spreadsheetUrl={GOOGLE_SHEETS_CONFIG.SPREADSHEET_URL}
          mockModeEnabled={mockModeEnabled}
        />

        <HeaderFilters
          owners={owners}
          selectedOwner={selectedOwner}
          onOwnerChange={setSelectedOwner}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onRefresh={() => fetchAllData({ force: true })}
          isLoading={isLoading}
          monthlyIncome={ownerMetrics?.monthlyIncome || 0}
          monthlyExpenses={ownerMetrics?.monthlyExpenses || 0}
          netFlow={(ownerMetrics?.monthlyIncome || 0) - (ownerMetrics?.monthlyExpenses || 0)}
          savingsRate={ownerMetrics?.savingsRate || 0}
          ytdMode={ytdMode}
          onToggleYTD={setYtdMode}
          availableMonthsByYear={availableMonthsByYear}
        />

        <div className="text-left container mx-auto px-0">
          <h2 className="text-lg font-semibold text-foreground mb-2">Resumo do período</h2>
        </div>

        {ownerMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard
              title="Patrimônio Líquido"
              value={formatCurrency(ownerMetrics.netWorth)}
              subtitle={ownerMetrics.totalLiabilities === 0
                ? 'Todos os ativos livres de dívidas'
                : `Passivos em aberto: ${formatCurrency(ownerMetrics.totalLiabilities)}`}
              icon={<DollarSign className="w-5 h-5 text-primary" />}
              variant={ownerMetrics.netWorth >= 0 ? 'success' : 'destructive'}
              trend={ownerMetrics.netWorth >= 0 ? 'up' : 'down'}
            />
            <FinancialCard
              title="Reservas disponíveis"
              value={formatCurrency(ownerMetrics.totalAssets)}
              subtitle={ownerMetrics.totalAssets === 0 ? 'Sem saldo registrado' : 'Saldo em contas e investimentos'}
              icon={<Wallet className="w-5 h-5 text-primary" />}
              variant={ownerMetrics.totalAssets >= 0 ? 'default' : 'destructive'}
              trend={ownerMetrics.totalAssets >= 0 ? 'up' : 'down'}
            />
            <FinancialCard
              title="Taxa de Poupança"
              value={`${ownerMetrics.savingsRate.toFixed(1)}%`}
              subtitle="Meta sugerida: 20%"
              icon={<PiggyBank className="w-5 h-5 text-success" />}
              variant={ownerMetrics.savingsRate >= 20 ? 'success' : 'warning'}
              trend={ownerMetrics.savingsRate >= 0 ? 'up' : 'down'}
            />
            <FinancialCard
              title="Maior categoria de gasto"
              value={hasSpendingCategory ? formatCurrency(topSpendingCategory.amount) : '--'}
              subtitle={hasSpendingCategory ? topSpendingCategory.category : 'Aguardando lançamentos'}
              icon={<BarChart3 className="w-5 h-5 text-primary" />}
              variant={hasSpendingCategory ? 'warning' : 'default'}
              trend={hasSpendingCategory ? 'down' : 'neutral'}
            />
          </div>
        )}


        {ownerData && (
          <AccountsOverview
            accounts={ownerData.accounts.filter((account) => !(account.liability_outstanding && account.liability_outstanding > 0))}
            totalAssets={ownerMetrics?.totalAssets || 0}
            totalLiabilities={ownerMetrics?.totalLiabilities || 0}
            totalBalance={ownerMetrics?.netWorth || 0}
            belowTotals={
              <div className="mt-2 space-y-4">
                <AIInsights insights={ownerData.insights} isLoading={isLoading} />
                {audioReportsCard}
              </div>
            }
          />
        )}
        {!ownerData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton key="skeleton-1" className="h-24" />
            <Skeleton key="skeleton-2" className="h-24" />
            <Skeleton key="skeleton-3" className="h-24" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Categorias principais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownerMetrics?.topCategories?.length ? (
                ownerMetrics.topCategories.map((category, index) => (
                  <div key={categoryKey(category, index)} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full bg-primary"
                        style={{ opacity: Math.max(0.3, 1 - index * 0.15) }}
                      />
                      <span className="text-sm font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {ownerMetrics.monthlyExpenses > 0
                          ? `${((category.amount / ownerMetrics.monthlyExpenses) * 100).toFixed(1)}%`
                          : 'â€”'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Sem gastos categorizados no período.</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>Transações detalhadas</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{periodLabel}</Badge>
                  <Badge variant={filtersActive ? 'default' : 'secondary'}>
                    {filteredTransactions.length} / {transactionsForDisplay.length}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore entradas e saídas do período selecionado, filtre por categoria ou busque por descrição.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Entradas</p>
                  <p className="text-sm font-semibold text-success">{formatCurrency(totalIncome)}</p>
                  {filtersActive && (
                    <p className="text-xs text-muted-foreground">Filtrado: {formatCurrency(filteredIncome)}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Saídas</p>
                  <p className="text-sm font-semibold text-destructive">{formatCurrency(totalExpenses)}</p>
                  {filtersActive && (
                    <p className="text-xs text-muted-foreground">Filtrado: {formatCurrency(filteredExpenses)}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Fluxo líquido</p>
                  <p className={`text-sm font-semibold ${netFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(netFlow)}
                  </p>
                  {filtersActive && (
                    <p className="text-xs text-muted-foreground">Filtrado: {formatCurrency(filteredNetFlow)}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px] md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição, conta ou categoria"
                    value={transactionsSearchTerm}
                    onChange={(event) => setTransactionsSearchTerm(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={transactionsAccount} onValueChange={setTransactionsAccount}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionAccounts.map((accountId) => {
                      const label = accountId === 'all'
                        ? 'Todas as contas'
                        : accountLabels.get(accountId) ?? accountId;
                      return (
                        <SelectItem key={accountId} value={accountId}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select value={transactionsCategory} onValueChange={setTransactionsCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'Todas as categorias' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {filtersActive && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleResetTransactionFilters}>
                    Limpar filtros
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {displayedTransactions.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    Nenhuma transação encontrada com os filtros aplicados.
                  </div>
                )}

                {displayedTransactions.map((transaction, index) => {
                  const isIncome = transaction.flow === 'inflow' || transaction.amount >= 0;
                  const displayDate = transaction.value_date || transaction.posted_date;
                  const categoryLabel = formatCategoryLabel(transaction.category);
                  const accountId = transaction.account_id ?? '';
                  const fallbackAccountLabel = accountId || 'Conta não identificada';
                  const accountLabel = accountLabels.get(accountId) ?? fallbackAccountLabel;
                  const description = (transaction.description ?? '').trim() || `${categoryLabel} - ${accountLabel}`;
                  const displayDateLabel = displayDate ? formatDateLabel(displayDate) : 'Sem data';

                  return (
                    <div
                      key={transactionKey(transaction, index)}
                      className="flex flex-col gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-foreground truncate">{description}</p>
                          <Badge variant={isIncome ? 'default' : 'destructive'} className="text-xs whitespace-nowrap">
                            {isIncome ? 'Entrada' : 'Saída'}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {accountLabel}
                          </Badge>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {categoryLabel}
                          </Badge>
                          {displayDateLabel !== 'Sem data' && (
                            <span className="text-xs text-muted-foreground">{displayDateLabel}</span>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${isIncome ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {canLoadMoreTransactions && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={handleLoadMoreTransactions}>
                    Mostrar mais transações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span>Metas orçamentárias</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Simulação baseada nas categorias com maior peso (orçamento 20% acima do gasto real).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyGoals.length > 0 ? (
              monthlyGoals.map((goal, index) => (
                <div key={`${goal.category}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(goal.spent)} / {formatCurrency(goal.planned)}
                    </span>
                  </div>
                  <Progress value={goal.percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className={goal.percentage > 80 ? 'text-warning' : 'text-success'}>
                      {goal.percentage.toFixed(1)}% utilizado
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.planned - goal.spent)} restante
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta configurada para este período.</p>
                <p className="text-sm">Defina categorias prioritárias para acompanhar seu progresso.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Exportar e compartilhar dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open(GOOGLE_SHEETS_CONFIG.SPREADSHEET_URL, '_blank')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver planilha Google
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <Download className="w-4 h-4 mr-2" />
                Relatório PDF (em breve)
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <Download className="w-4 h-4 mr-2" />
                Dados CSV (em breve)
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Importar lançamentos (em breve)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;


