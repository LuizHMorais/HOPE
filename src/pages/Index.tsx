import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import { AccountsOverview } from '@/components/AccountsOverview';
import HeaderFilters from '@/components/HeaderFilters';
import { AIInsights } from '@/components/AIInsights';
import { DataStatus } from '@/components/DataStatus';
// DiagnÃ³sticos movidos para pÃ¡gina separada
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { formatCurrency } from '@/lib/mockData';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Upload, BarChart3 } from 'lucide-react';
import { GOOGLE_SHEETS_CONFIG } from '@/config/googleSheets';

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
    getSelectedOwnerMetricsYTD,
    owners,
    dataSource,
    isUsingMockData,
    error
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getUTCMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getUTCFullYear());
  const [ytdMode, setYtdMode] = useState<boolean>(false);
  const ownerMetrics = ytdMode 
    ? getSelectedOwnerMetricsYTD(selectedYear)
    : getSelectedOwnerMetricsFor(selectedMonth, selectedYear);
  const recentTransactions = getSelectedOwnerTransactionsFor(selectedMonth, selectedYear).slice(0, 5);
  const mockModeEnabled = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
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
            Sua assistente inteligente para organizaÃ§Ã£o financeira pessoal
          </p>
          <p className="text-sm text-muted-foreground">
            Help & Organize Personal Economics
          </p>
        </div>

        {/* DiagnÃ³sticos removidos do dashboard (veja /diagnostico) */}

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

        {/* Header premium com chips/pÃ­lulas */}
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
        />

        {/* SeÃ§Ãµes */}
        <div className="text-left container mx-auto px-0">
          <h2 className="text-lg font-semibold text-foreground mb-2">Resumo do MÃªs</h2>
        </div>

        {/* Financial Summary Cards */}
        {ownerMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard
              title="PatrimÃ´nio LÃ­quido"
              value={formatCurrency(ownerMetrics.netWorth)}
              subtitle={`${ownerMetrics.monthlyExpenses === 0 ? 'Sem gastos registrados' : `+${formatCurrency(ownerMetrics.monthlyIncome - ownerMetrics.monthlyExpenses)} este mÃªs`}`}
              icon={<DollarSign className="w-5 h-5 text-primary" />}
              variant="success"
              trend="up"
            />
            
            <FinancialCard
              title="Receita Mensal"
              value={formatCurrency(ownerMetrics.monthlyIncome)}
              subtitle="Entradas do perÃ­odo"
              icon={<TrendingUp className="w-5 h-5 text-success" />}
              variant="success"
              trend="up"
            />
            
            <FinancialCard
              title="Gastos Mensais"
              value={formatCurrency(ownerMetrics.monthlyExpenses)}
              subtitle={ownerMetrics.monthlyExpenses === 0 ? 'Sem gastos no perÃ­odo' : '% do orÃ§amento'}
              icon={<TrendingDown className="w-5 h-5 text-destructive" />}
              variant={ownerMetrics.monthlyExpenses === 0 ? "success" : "destructive"}
              trend={ownerMetrics.monthlyExpenses === 0 ? "up" : "down"}
            />
            
            <FinancialCard
              title="Taxa de PoupanÃ§a"
              value={`${ownerMetrics.savingsRate.toFixed(1)}%`}
              subtitle="Meta: 20%"
              icon={<PiggyBank className="w-5 h-5 text-success" />}
              variant="success"
              trend="up"
            />
          </div>
        )}

        {/* Accounts Overview */}
        {ownerData && (
          <div>
            <AccountsOverview 
              accounts={ownerData.accounts.filter(a => !(a.liability_outstanding && a.liability_outstanding > 0))}
              totalAssets={ownerMetrics?.totalAssets || 0}
              totalLiabilities={ownerMetrics?.totalLiabilities || 0}
              totalBalance={ownerMetrics?.netWorth || 0}
              belowTotals={
                <div className="mt-2">
                  <AIInsights insights={ownerData.insights} isLoading={isLoading} />
                </div>
              }
            />
          </div>
        )}
        {!ownerData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton key="skeleton-1" className="h-24" />
            <Skeleton key="skeleton-2" className="h-24" />
            <Skeleton key="skeleton-3" className="h-24" />
          </div>
        )}

        {/* Top Categories and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories */}
          {ownerMetrics ? (
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Categorias Principais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ownerMetrics.topCategories.length > 0 ? (
                  ownerMetrics.topCategories.map((category, index) => (
                    <div key={`category-${category.category}-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary" style={{ opacity: Math.max(0.3, 1 - index * 0.15) }} />
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(category.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {ownerMetrics.monthlyExpenses > 0 ? `${((category.amount / ownerMetrics.monthlyExpenses) * 100).toFixed(1)}%` : 'â€”'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Sem gastos categorizados no perÃ­odo.</div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Skeleton className="h-64" />
          )}

          {/* Recent Transactions */}
          {ownerData && ownerMetrics && (
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span>TransaÃ§Ãµes Recentes</span>
                  </div>
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => {
                    const isIncome = transaction.flow === 'inflow' || transaction.amount >= 0;
                    const displayDate = transaction.value_date || transaction.posted_date;
                    const categoryLabel = transaction.category?.trim() || 'Sem categoria';
                    return (
                      <div
                        key={transaction.transaction_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-sm text-foreground truncate">{transaction.description}</div>
                            <Badge variant={isIncome ? 'default' : 'destructive'} className="text-xs whitespace-nowrap">
                              {isIncome ? 'Entrada' : 'Saída'}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{categoryLabel}</span>
                            {displayDate && <span>- {new Date(displayDate).toLocaleDateString('pt-BR')}</span>}
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${isIncome ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">Sem transações no período selecionado.</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Insights movido para acima das contas */}
      </div>
    </Layout>
  );
};

export default Index;



