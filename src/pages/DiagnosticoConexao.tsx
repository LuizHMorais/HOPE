import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfigStatus } from '@/components/ConfigStatus';
import { ConnectionTester } from '@/components/ConnectionTester';

const DiagnosticoConexao = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Diagnóstico de Conexão</h1>
          <p className="text-muted-foreground">Verifique a configuração das APIs e teste a conexão com o Google Sheets.</p>
        </div>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle>Status das Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfigStatus />
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle>Teste de Conexão Google Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionTester />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DiagnosticoConexao;


