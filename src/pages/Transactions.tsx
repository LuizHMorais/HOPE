import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FinancialCard } from '@/components/FinancialCard';
import HeaderFilters from '@/components/HeaderFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { formatCurrency, getCategoryColor } from '@/lib/mockData';
import { Search, Filter, Upload, Download, Calendar } from 'lucide-react';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const {
    selectedOwner,
    setSelectedOwner,
    isLoading,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetricsFor,
    getSelectedOwnerTransactionsFor,
    owners
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getUTCMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getUTCFullYear());
  const ownerMetrics = getSelectedOwnerMetricsFor(selectedMonth, selectedYear);

  const transactions = getSelectedOwnerTransactionsFor(selectedMonth, selectedYear);
  const categoryFor = (transaction: (typeof transactions)[number]) => transaction.category?.trim() || 'Sem categoria';
  const categories = ['all', ...Array.from(new Set(transactions.map(categoryFor).filter(Boolean)))] as string[];
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || categoryFor(transaction) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transações</h1>
            <p className="text-muted-foreground">Gerencie e categorize suas movimentações financeiras</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-gradient-primary">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FinancialCard
            title="Total de Receitas"
            value={formatCurrency(totalIncome)}
            subtitle={`${transactions.filter(t => t.amount > 0).length} transações`}
            variant="success"
            trend="up"
          />
          <FinancialCard
            title="Total de Gastos"
            value={formatCurrency(totalExpenses)}
            subtitle={`${transactions.filter(t => t.amount < 0).length} transações`}
            variant="destructive"
            trend="down"
          />
          <FinancialCard
            title="Saldo Líquido"
            value={formatCurrency(totalIncome - totalExpenses)}
            subtitle="Este período"
            variant={totalIncome - totalExpenses > 0 ? "success" : "destructive"}
            trend={totalIncome - totalExpenses > 0 ? "up" : "down"}
          />
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição ou estabelecimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Transações ({filteredTransactions.length})</span>
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Filtrar período
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.amount >= 0;
                const displayDate = transaction.value_date || transaction.posted_date;
                const categoryLabel = categoryFor(transaction);
                return (
                  <div
                    key={transaction.transaction_id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isIncome ? 'bg-success' : 'bg-destructive'}`} />
                        <div>
                          <div className="font-medium text-foreground">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {categoryLabel}
                            {displayDate ? ` • ${new Date(displayDate).toLocaleDateString('pt-BR')}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={isIncome ? 'default' : 'destructive'} className="text-xs">
                          {isIncome ? 'Entrada' : 'Saída'}
                        </Badge>
                        {categoryLabel && (
                          <Badge variant="outline" className="text-xs">
                            {categoryLabel}
                          </Badge>
                        )}
                      </div>
                      <div className={`font-bold text-lg ${isIncome ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma transação encontrada com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;
