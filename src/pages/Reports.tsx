import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import HeaderFilters from '@/components/HeaderFilters';
import { AIInsights } from '@/components/AIInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { formatCurrency } from '@/lib/mockData';
import { FileText, Download, Calendar, TrendingUp, Target, Volume2, Share, Brain, Sparkles, Play } from 'lucide-react';

const Reports = () => {
  const {
    selectedOwner,
    setSelectedOwner,
    isLoading,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetricsFor,
    owners
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getUTCMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getUTCFullYear());
  const ownerMetrics = getSelectedOwnerMetricsFor(selectedMonth, selectedYear);

  const monthlyGoals = ownerMetrics ? ownerMetrics.topCategories.map(cat => ({
    category: cat.category,
    budgeted: cat.amount * 1.2, // Simular orçamento 20% maior
    spent: cat.amount,
    percentage: Math.min((cat.amount / (cat.amount * 1.2)) * 100, 100)
  })) : [];

  const insights = ownerData?.insights.slice(0, 3).map(insight => ({
    type: insight.priority === 'high' ? 'warning' : insight.priority === 'medium' ? 'info' : 'success',
    title: insight.title,
    description: insight.insight,
  })) || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header premium com filtros */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FinancialCard
            title="Taxa de Poupança"
            value={`${ownerMetrics?.savingsRate?.toFixed(1) || 0}%`}
            subtitle="Meta: 20%"
            variant={ownerMetrics?.savingsRate && ownerMetrics.savingsRate >= 20 ? "success" : "warning"}
            trend={ownerMetrics?.savingsRate && ownerMetrics.savingsRate >= 20 ? "up" : "down"}
          />
          <FinancialCard
            title="Eficiência Orçamentária"
            value={`${ownerMetrics ? Math.min(100, Math.max(0, ((ownerMetrics.monthlyIncome - ownerMetrics.monthlyExpenses) / ownerMetrics.monthlyIncome) * 100)) : 0}%`}
            subtitle="Dentro do planejado"
            variant="success"
            trend="up"
          />
          <FinancialCard
            title="Score Financeiro"
            value={`${ownerMetrics ? Math.min(10, Math.max(0, (ownerMetrics.savingsRate / 20) * 10)) : 0}`}
            subtitle="Baseado em poupança"
            variant="success"
            trend="up"
          />
          <FinancialCard
            title="Projeção Mensal"
            value={formatCurrency(ownerMetrics?.monthlyExpenses || 0)}
            subtitle="Gastos estimados"
            variant="warning"
            trend="neutral"
          />
        </div>

        {/* AI Insights Section */}
        {ownerData && (
          <AIInsights 
            insights={ownerData.insights}
            isLoading={isLoading}
          />
        )}

        {/* Budget Goals */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span>Metas Orçamentárias</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyGoals.length > 0 ? monthlyGoals.map((goal, index) => (
              <div key={`goal-${goal.category}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{goal.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(goal.spent)} / {formatCurrency(goal.budgeted)}
                  </span>
                </div>
                <Progress 
                  value={goal.percentage} 
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className={goal.percentage > 80 ? 'text-warning' : 'text-success'}>
                    {goal.percentage.toFixed(1)}% utilizado
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.budgeted - goal.spent)} restante
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta orçamentária configurada</p>
                <p className="text-sm">Configure suas metas para acompanhar seu progresso</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Reports */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-primary" />
              <span>Relatórios em Áudio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Ouça os resumos semanais gerados pela IA em formato de áudio com base nos insights.
            </p>
            
            <div className="space-y-3">
              {ownerData?.insights && ownerData.insights.length > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <div className="font-medium">Resumo Semanal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
                      <div className="text-sm text-muted-foreground">
                        Baseado em {ownerData.insights.length} insights • Gerado em {new Date().toLocaleDateString('pt-BR')} • 3:45 min
                      </div>
                    </div>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Reproduzir
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <div className="font-medium">Resumo Mensal - {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
                      <div className="text-sm text-muted-foreground">Baseado em {Math.max(1, ownerData.insights.length - 2)} insights • Gerado em {new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('pt-BR')} • 4:12 min</div>
                    </div>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Reproduzir
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum relatório em áudio disponível</p>
                  <p className="text-sm">Os relatórios são gerados automaticamente com base nos insights da IA</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Exportar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Google Sheets
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Relatório PDF
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Dados CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;