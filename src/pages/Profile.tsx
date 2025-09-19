import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import HeaderFilters from '@/components/HeaderFilters';
import { GoogleSheetsIntegration } from '@/components/GoogleSheetsIntegration';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { formatCurrency } from '@/data/mockGoogleSheetsData';
import { useState } from 'react';
import { User, Mail, Phone, CreditCard, TrendingUp, Calendar, Settings, Shield, Activity, DollarSign } from 'lucide-react';

const Profile = () => {
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

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">Gerencie seus dados e conexões.</p>
        </div>

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

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            {ownerData?.person ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Nome</div>
                  <div className="font-medium">{ownerData.person.first_name} {ownerData.person.last_name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">E-mail</div>
                  <div className="font-medium">{ownerData.person.email || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Apelido</div>
                  <div className="font-medium">{ownerData.person.person_alias || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Telefone</div>
                  <div className="font-medium">{ownerData.person.phone || '—'}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Selecione um usuário para ver os dados.</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleSheetsIntegration />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;


