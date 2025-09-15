import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockSummary, mockTransactions, formatCurrency } from '@/lib/mockData';
import { FileText, Download, Calendar, TrendingUp, Target, Volume2, Share } from 'lucide-react';

const Reports = () => {
  const monthlyGoals = [
    { category: 'Alimentação', budgeted: 500, spent: 344.08, percentage: 68.8 },
    { category: 'Transporte', budgeted: 200, spent: 89.50, percentage: 44.8 },
    { category: 'Entretenimento', budgeted: 150, spent: 29.90, percentage: 19.9 },
    { category: 'Saúde', budgeted: 100, spent: 45.60, percentage: 45.6 },
  ];

  const insights = [
    {
      type: 'success',
      title: 'Meta de poupança atingida!',
      description: 'Você conseguiu poupar 45.8% da renda este mês, superando a meta de 20%.',
    },
    {
      type: 'warning',
      title: 'Gastos com alimentação acima da média',
      description: 'Seus gastos com alimentação estão 15% acima do mês anterior.',
    },
    {
      type: 'info',
      title: 'Oportunidade de investimento',
      description: 'Com o saldo atual, considere diversificar seus investimentos.',
    },
  ];

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

        {/* Insights and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Insights */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Insights da IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-start space-x-3">
                    <Badge 
                      variant={
                        insight.type === 'success' ? 'default' : 
                        insight.type === 'warning' ? 'secondary' : 
                        'outline'
                      }
                      className="mt-1"
                    >
                      {insight.type === 'success' ? '✓' : insight.type === 'warning' ? '⚠' : 'ℹ'}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
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

        {/* Audio Report */}
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-primary" />
              <span>Relatório em Áudio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-primary/10 rounded-lg p-6 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-foreground">Resumo Semanal - Janeiro 2024</h3>
                  <p className="text-sm text-muted-foreground">Gerado pela IA • 2min 30s</p>
                </div>
                <Button className="bg-gradient-primary">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Reproduzir
                </Button>
              </div>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Resumo:</strong> Este mês você demonstrou excelente controle financeiro, 
                  poupando 45.8% da sua renda e mantendo gastos dentro do orçamento planejado.
                </p>
                <p>
                  <strong>Destaque:</strong> Investimento de R$ 1.000 em CDB mostra comprometimento 
                  com objetivos de longo prazo.
                </p>
                <p>
                  <strong>Atenção:</strong> Gastos com alimentação ligeiramente acima da média. 
                  Considere planejar refeições semanais.
                </p>
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