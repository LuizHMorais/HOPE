import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockSummary, mockTransactions, formatCurrency, getCategoryColor } from '@/lib/mockData';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Upload, BarChart3 } from 'lucide-react';

const Index = () => {
  const recentTransactions = mockTransactions.slice(0, 5);
  
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            title="Saldo Total"
            value={formatCurrency(mockSummary.totalBalance)}
            subtitle={`+${formatCurrency(mockSummary.monthlyIncome - mockSummary.monthlyExpenses)} este mês`}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            variant="success"
            trend="up"
          />
          
          <FinancialCard
            title="Receita Mensal"
            value={formatCurrency(mockSummary.monthlyIncome)}
            subtitle="Salário + extras"
            icon={<TrendingUp className="w-5 h-5 text-success" />}
            variant="success"
            trend="up"
          />
          
          <FinancialCard
            title="Gastos Mensais"
            value={formatCurrency(mockSummary.monthlyExpenses)}
            subtitle="54% do orçamento"
            icon={<TrendingDown className="w-5 h-5 text-destructive" />}
            variant="destructive"
            trend="down"
          />
          
          <FinancialCard
            title="Taxa de Poupança"
            value={`${mockSummary.savingsRate.toFixed(1)}%`}
            subtitle="Meta: 20%"
            icon={<PiggyBank className="w-5 h-5 text-success" />}
            variant="success"
            trend="up"
          />
        </div>

        {/* Top Categories and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories */}
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Categorias Principais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSummary.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-primary opacity-${100 - index * 20}`} />
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCurrency(category.amount)}</div>
                    <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
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
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${transaction.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
