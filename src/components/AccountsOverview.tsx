import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { AccountData, formatCurrency } from '@/lib/mockData';
import { Building2, TrendingUp, Wallet, PieChart } from 'lucide-react';

interface AccountsOverviewProps {
  accounts: AccountData[];
  totalAssets: number;
  totalLiabilities: number;
  totalBalance: number;
  belowTotals?: ReactNode;
}

export const AccountsOverview = ({ 
  accounts, 
  totalAssets, 
  totalLiabilities, 
  totalBalance,
  belowTotals,
}: AccountsOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="min-w-0">
                <div className="text-xl md:text-2xl font-bold text-success break-words leading-tight">
                  {formatCurrency(totalAssets)}
                </div>
                <div className="text-sm text-muted-foreground">Total de Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <div className="text-xl md:text-2xl font-bold text-destructive break-words leading-tight">
                  {formatCurrency(totalLiabilities)}
                </div>
                <div className="text-sm text-muted-foreground">Total de Passivos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xl md:text-2xl font-bold text-primary break-words leading-tight">
                  {formatCurrency(totalBalance)}
                </div>
                <div className="text-sm text-muted-foreground">Saldo Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {belowTotals}

      {/* Accounts List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Principais Contas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.slice(0, 5).map((account) => (
              <div
                key={account.account_id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{account.account_name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {account.institution_name.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg text-success">
                    {formatCurrency(account.balance_current)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {account.currency}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};