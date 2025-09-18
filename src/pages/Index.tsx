import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import { AccountsOverview } from '@/components/AccountsOverview';
import { OwnerSelector } from '@/components/OwnerSelector';
import HeaderFilters from '@/components/HeaderFilters';
import { AIInsights } from '@/components/AIInsights';
import { DataStatus } from '@/components/DataStatus';
// Diagnósticos movidos para página separada
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { formatCurrency } from '@/lib/mockData';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Upload, BarChart3 } from 'lucide-react';

const Index = () => {
  const {
    selectedOwner,
    setSelectedOwner,
    isLoading,
    apiKeyValid,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetrics,
    getSelectedOwnerMetricsFor,
    getSelectedOwnerTransactionsFor,
    owners
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getUTCMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getUTCFullYear());
  const ownerMetrics = getSelectedOwnerMetricsFor(selectedMonth, selectedYear);
  
  // Verificar se está usando dados mockados
  const isUsingMockData = apiKeyValid === false;
  
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
            Sua assistente inteligente para organização financeira pessoal
          </p>
          <p className="text-sm text-muted-foreground">
            Help & Organize Personal Economics
          </p>
        </div>

        {/* Diagnósticos removidos do dashboard (veja /diagnostico) */}

        {/* Header premium com chips/pílulas */}
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
        />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Upload className="w-4 h-4 mr-2" />
            Importar Extrato
          </Button>
          <Button variant="outline" className="hover:shadow-card transition-all duration-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver Relatórios
          </Button>
        </div>

        {/* Financial Summary Cards */}
        {ownerMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialCard
              title="Patrimônio Líquido"
              value={formatCurrency(ownerMetrics.totalBalance)}
              subtitle={`${ownerMetrics.monthlyExpenses === 0 ? 'Sem gastos registrados' : `+${formatCurrency(ownerMetrics.monthlyIncome - ownerMetrics.monthlyExpenses)} este mês`}`}
              icon={<DollarSign className="w-5 h-5 text-primary" />}
              variant="success"
              trend="up"
            />
            
            <FinancialCard
              title="Receita Mensal"
              value={formatCurrency(ownerMetrics.monthlyIncome)}
              subtitle="Entradas do período"
              icon={<TrendingUp className="w-5 h-5 text-success" />}
              variant="success"
              trend="up"
            />
            
            <FinancialCard
              title="Gastos Mensais"
              value={formatCurrency(ownerMetrics.monthlyExpenses)}
              subtitle={ownerMetrics.monthlyExpenses === 0 ? 'Sem gastos no período' : '% do orçamento'}
              icon={<TrendingDown className="w-5 h-5 text-destructive" />}
              variant={ownerMetrics.monthlyExpenses === 0 ? "success" : "destructive"}
              trend={ownerMetrics.monthlyExpenses === 0 ? "up" : "down"}
            />
            
            <FinancialCard
              title="Taxa de Poupança"
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
              totalBalance={ownerMetrics?.totalBalance || 0}
              belowTotals={
                <div className="mt-2">
                  <AIInsights insights={ownerData.insights} isLoading={isLoading} />
                </div>
              }
            />
          </div>
        )}

        {/* Top Categories and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories */}
          {ownerMetrics && (
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
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary" style={{ opacity: Math.max(0.3, 1 - index * 0.15) }} />
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(category.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {ownerMetrics.monthlyExpenses > 0 ? `${((category.amount / ownerMetrics.monthlyExpenses) * 100).toFixed(1)}%` : '—'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Sem gastos categorizados no período.</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          {ownerData && ownerMetrics && (
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span>Transações Recentes</span>
                  </div>
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getSelectedOwnerTransactionsFor(selectedMonth, selectedYear).slice(0, 5).map((transaction) => (
                  <div key={transaction.transaction_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.category} • {new Date(transaction.value_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${transaction.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
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
