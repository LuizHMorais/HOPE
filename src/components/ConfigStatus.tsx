import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getConfigInfo, validateConfig } from '@/config/env';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export const ConfigStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Memoizar as configurações para evitar recálculos desnecessários
  const configInfo = useMemo(() => getConfigInfo(), []);
  const validation = useMemo(() => validateConfig(), []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Configurações atualizadas!",
        description: "Status das configurações foi atualizado",
      });
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  const getStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusBadge = (configured: boolean) => {
    return (
      <Badge variant={configured ? "default" : "destructive"}>
        {configured ? "Configurado" : "Não configurado"}
      </Badge>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status das Configurações</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {configInfo.app.name} v{configInfo.app.version}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Status Geral</h4>
          <Alert className={validation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start space-x-2">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <AlertDescription>
                <div className="font-medium">
                  {validation.isValid ? "Todas as configurações estão OK!" : "Configurações pendentes"}
                </div>
                {!validation.isValid && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Variáveis faltando: {validation.missing.join(', ')}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {/* Google Sheets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              {getStatusIcon(configInfo.apis.googleSheets.configured)}
              <span>Google Sheets</span>
            </h4>
            {getStatusBadge(configInfo.apis.googleSheets.configured)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID da Planilha:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {configInfo.apis.googleSheets.spreadsheetId}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">URL:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(configInfo.apis.googleSheets.spreadsheetId)}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar ID
              </Button>
            </div>
          </div>
        </div>

        {/* N8N */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              {getStatusIcon(configInfo.apis.n8n.configured)}
              <span>N8N Workflow</span>
            </h4>
            {getStatusBadge(configInfo.apis.n8n.configured)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {configInfo.apis.n8n.baseUrl}
              </code>
            </div>
          </div>
        </div>

        {/* Belvo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              {getStatusIcon(configInfo.apis.belvo.configured)}
              <span>Belvo API</span>
            </h4>
            {getStatusBadge(configInfo.apis.belvo.configured)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {configInfo.apis.belvo.apiUrl}
              </code>
            </div>
          </div>
        </div>

        {/* Ollama */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              {getStatusIcon(configInfo.apis.ollama.configured)}
              <span>Ollama AI</span>
            </h4>
            {getStatusBadge(configInfo.apis.ollama.configured)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {configInfo.apis.ollama.apiUrl}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Modelo:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {configInfo.apis.ollama.model}
              </code>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">Ações Rápidas</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Google Cloud
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://sandbox.belvo.com/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Belvo Sandbox
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
