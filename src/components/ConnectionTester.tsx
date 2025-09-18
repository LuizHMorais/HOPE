import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { buildSheetUrl } from '@/config/googleSheets';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy, RefreshCw } from 'lucide-react';

export const ConnectionTester = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | 'warning' | null;
    message: string;
    details?: string;
  }>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Testar conexão com a aba People
      const url = buildSheetUrl('People');
      console.log('Testando URL:', url);
      
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await response.json().catch(() => ({}));
      
      if (response.ok) {
        setTestResult({
          status: 'success',
          message: 'Conexão com Google Sheets funcionando!',
          details: `Encontrados ${data.values?.length || 0} registros na aba People`
        });
        
        toast({
          title: "Conexão bem-sucedida!",
          description: "Conectado ao Google Sheets com sucesso",
        });
      } else {
        setTestResult({
          status: 'error',
          message: `Erro ${response.status}: ${data.error?.message || 'Erro desconhecido'}`,
          details: `${getErrorDetails(response.status, data)}\nURL: ${url}`
        });
        
        toast({
          title: "Erro de conexão",
          description: `Erro ${response.status}: ${data.error?.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Erro de rede ou configuração',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com a API",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getErrorDetails = (status: number, data: unknown): string => {
    switch (status) {
      case 400:
        return '400 Bad Request: Verifique ID da planilha, nome da aba e parâmetros.';
      case 401:
        return 'API Key inválida ou sem permissões. Verifique as configurações.';
      case 403:
        return 'Acesso negado. A planilha pode não estar compartilhada publicamente.';
      case 404:
        return 'Planilha não encontrada. Verifique o ID da planilha.';
      case 429:
        return 'Muitas requisições. Tente novamente em alguns minutos.';
      default: {
        const message = typeof data === 'object' && data !== null && 'error' in data
          ? (data as { error?: { message?: string } }).error?.message
          : undefined;
        return message || 'Erro desconhecido';
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Teste de Conexão Google Sheets</span>
          <Badge variant="outline">Diagnóstico</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={testConnection}
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {isTesting ? 'Testando...' : 'Testar Conexão'}
          </Button>
        </div>

        {testResult && (
          <Alert className={testResult.status === 'success' ? 'border-green-200 bg-green-50' : 
                           testResult.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                           'border-red-200 bg-red-50'}>
            <div className="flex items-start space-x-2">
              {testResult.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
              {testResult.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
              {testResult.status === 'error' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              <div className="flex-1">
                <AlertDescription>
                  <div className="font-medium">{testResult.message}</div>
                  {testResult.details && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {testResult.details}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Configurações Atuais:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID da Planilha:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API Key:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ? 'Configurada' : 'Não configurada'}
              </code>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Soluções para Erro 401:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>1. Tornar planilha pública:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps/edit?usp=sharing', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>2. Configurar API Key:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Console
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>3. Copiar URL da planilha:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('https://docs.google.com/spreadsheets/d/1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps/edit?usp=sharing')}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
