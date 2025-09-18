import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OwnerSelector } from '@/components/OwnerSelector';
import { GoogleSheetsIntegration } from '@/components/GoogleSheetsIntegration';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';

const Profile = () => {
  const {
    selectedOwner,
    setSelectedOwner,
    isLoading,
    fetchAllData,
    getSelectedOwnerData,
    owners
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">Gerencie seus dados e conexões.</p>
        </div>

        <OwnerSelector
          owners={owners}
          selectedOwner={selectedOwner}
          onOwnerChange={setSelectedOwner}
          onRefresh={fetchAllData}
          isLoading={isLoading}
        />

        <Card className="shadow-card">
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

        <Card className="shadow-card">
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


