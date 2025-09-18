import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const GoogleSheetsIntegration = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!sheetUrl) {
      toast({
        title: "URL necessária",
        description: "Por favor, insira a URL da planilha do Google Sheets",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simula conexão com Google Sheets
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    
    try {
      // Simula sincronização
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Dados sincronizados",
        description: "Seus dados financeiros foram atualizados na planilha",
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // Simula exportação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cria um blob com dados simulados
      const csvContent = `Data,Descrição,Valor,Categoria
2024-09-18,Salário,5000.00,Renda
2024-09-17,Supermercado,-256.78,Alimentação
2024-09-16,Combustível,-89.50,Transporte`;
      
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
    } finally {
      setIsLoading(false);
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
              <div>• Última sincronização: 18 Set 2024, 10:30</div>
              <div>• Próxima sincronização: Automática a cada hora</div>
              <div>• Status: <span className="text-success">Ativo</span></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};