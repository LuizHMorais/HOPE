import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataStatus } from '@/components/DataStatus';
import { useToast } from '@/hooks/use-toast';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { FileSpreadsheet, Download, Upload, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export const GoogleSheetsIntegration = () => {
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps/edit?usp=sharing');
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();
  const { 
    data, 
    isLoading, 
    error, 
    apiKeyValid,
    fetchAllData,
    owners 
  } = useGoogleSheetsData();

  // Verificar se está usando dados mockados
  const isUsingMockData = apiKeyValid === false;

  const handleConnect = async () => {
    if (!sheetUrl) {
      toast({
        title: "URL necessária",
        description: "Por favor, insira a URL da planilha do Google Sheets",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetchAllData();
      setIsConnected(true);
      toast({
        title: "Conectado com sucesso!",
        description: "Seus dados financeiros estão sendo sincronizados com o Google Sheets",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com o Google Sheets. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    try {
      await fetchAllData();
      toast({
        title: "Dados sincronizados",
        description: "Seus dados financeiros foram atualizados da planilha",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      // Criar CSV com dados reais
      const csvContent = [
        'Data,Descrição,Valor,Categoria,Usuário',
        ...data.transactions.map(t => {
          const person = data.people.find(p => p.link_id === t.link_id);
          return `${t.value_date},${t.description},${t.amount},${t.category},${person?.person_alias || 'N/A'}`;
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'dados_financeiros.csv';
      link.click();
      
      toast({
        title: "Dados exportados",
        description: "Arquivo CSV baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <span>Integração Google Sheets</span>
          {isConnected && (
            <Badge variant="default" className="ml-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                URL da Planilha Google Sheets
              </label>
              <Input
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole a URL da sua planilha do Google Sheets para conectar
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full bg-gradient-primary"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Conectar com Google Sheets
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <div className="font-medium text-success">Conectado com sucesso!</div>
                  <div className="text-sm text-muted-foreground">
                    Dados sendo sincronizados automaticamente
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleSync}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sincronizar
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Última sincronização: {new Date().toLocaleString('pt-BR')}</div>
              <div>• {owners.length} usuários • {data.transactions.length} transações • {data.insights.length} insights</div>
              <div>• Status: <span className={isUsingMockData ? "text-orange-600" : "text-success"}>
                {isUsingMockData ? 'Demonstração' : 'Ativo'}
              </span></div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(sheetUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Planilha no Google Sheets
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};