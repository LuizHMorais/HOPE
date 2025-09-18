import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import { InsightCard } from '@/components/InsightCard';
import { OwnerSelector } from '@/components/OwnerSelector';
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
    getSelectedOwnerMetrics,
    owners
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();
  const ownerMetrics = getSelectedOwnerMetrics();

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Insights inteligentes sobre suas finanças</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Período
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button className="bg-gradient-primary">
              <Share className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FinancialCard
            title="Taxa de Poupança"
            value={`${mockSummary.savingsRate}%`}
            subtitle="Meta: 20% ✓"
            variant="success"
            trend="up"
          />
          <FinancialCard
            title="Eficiência Orçamentária"
            value="87%"
            subtitle="Dentro do planejado"
            variant="success"
            trend="up"
          />
          <FinancialCard
            title="Score Financeiro"
            value="8.5"
            subtitle="Muito bom"
            variant="success"
            trend="up"
          />
          <FinancialCard
            title="Projeção Mensal"
            value={formatCurrency(2850)}
            subtitle="Gastos estimados"
            variant="warning"
            trend="neutral"
          />
        </div>

        {/* Owner Selector */}
        <OwnerSelector
          owners={owners}
          selectedOwner={selectedOwner}
          onOwnerChange={setSelectedOwner}
          onRefresh={fetchAllData}
          isLoading={isLoading}
        />

        {/* AI Insights Section */}
        {ownerData && (
          <AIInsights 
            insights={ownerData.insights}
            isLoading={isLoading}
          />
        )}

        {/* Budget Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Metas Orçamentárias</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
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
              ))}
            </CardContent>
          </Card>

          {/* Budget Goals */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Metas Orçamentárias</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
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
              ))}
            </CardContent>
          </Card>
        </div>

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
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="font-medium">Resumo Semanal - Setembro 2024</div>
                  <div className="text-sm text-muted-foreground">
                    Baseado em {mockInsights.length} insights • Gerado em 18 Set 2024 • 3:45 min
                  </div>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Reproduzir
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="font-medium">Resumo Semanal - Agosto 2024</div>
                  <div className="text-sm text-muted-foreground">Baseado em 5 insights • Gerado em 8 Set 2024 • 4:12 min</div>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Reproduzir
                </Button>
              </div>
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