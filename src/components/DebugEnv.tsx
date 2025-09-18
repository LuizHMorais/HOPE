import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GOOGLE_SHEETS } from '@/config/env';
import { GOOGLE_SHEETS_CONFIG } from '@/config/googleSheets';
import { CheckCircle, XCircle, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const DebugEnv = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Debug atualizado!",
        description: "Valores das variáveis foram atualizados",
      });
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Valor copiado para a área de transferência",
    });
  };

  // Verificar se as variáveis estão sendo carregadas
  const envApiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  const envSpreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;
  const envUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;

  // Valores do env.ts
  const envConfigApiKey = GOOGLE_SHEETS.API_KEY;
  const envConfigSpreadsheetId = GOOGLE_SHEETS.SPREADSHEET_ID;
  const envConfigUrl = GOOGLE_SHEETS.URL;

  // Valores do googleSheets.ts
  const googleSheetsApiKey = GOOGLE_SHEETS_CONFIG.API_KEY;
  const googleSheetsSpreadsheetId = GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID;
  const googleSheetsUrl = GOOGLE_SHEETS_CONFIG.SPREADSHEET_URL;

  const isApiKeyValid = envApiKey && envApiKey !== 'YOUR_API_KEY_HERE' && envApiKey.length > 10;
  const isSpreadsheetIdValid = envSpreadsheetId && envSpreadsheetId.length > 10;

  return (
    <Card className="shadow-card border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>🐛 Debug - Variáveis de Ambiente</span>
          </span>
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <Alert className={isApiKeyValid && isSpreadsheetIdValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-start space-x-2">
            {isApiKeyValid && isSpreadsheetIdValid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <AlertDescription>
              <div className="font-medium">
                {isApiKeyValid && isSpreadsheetIdValid ? "✅ Variáveis carregadas corretamente!" : "❌ Problema no carregamento das variáveis"}
              </div>
              {!isApiKeyValid && (
                <div className="text-sm text-muted-foreground mt-1">
                  API Key não está sendo carregada do .env.local
                </div>
              )}
              {!isSpreadsheetIdValid && (
                <div className="text-sm text-muted-foreground mt-1">
                  Spreadsheet ID não está sendo carregado do .env.local
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>

        {/* 1. Variáveis Diretas do import.meta.env */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">1️⃣ Variáveis Diretas (import.meta.env):</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">VITE_GOOGLE_SHEETS_API_KEY:</span>
              <div className="flex items-center space-x-2">
                <Badge variant={envApiKey ? "default" : "destructive"}>
                  {envApiKey ? "Carregada" : "Não carregada"}
                </Badge>
                {envApiKey && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(envApiKey)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">VITE_GOOGLE_SHEETS_SPREADSHEET_ID:</span>
              <div className="flex items-center space-x-2">
                <Badge variant={envSpreadsheetId ? "default" : "destructive"}>
                  {envSpreadsheetId ? "Carregada" : "Não carregada"}
                </Badge>
                {envSpreadsheetId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(envSpreadsheetId)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">VITE_GOOGLE_SHEETS_URL:</span>
              <div className="flex items-center space-x-2">
                <Badge variant={envUrl ? "default" : "destructive"}>
                  {envUrl ? "Carregada" : "Não carregada"}
                </Badge>
                {envUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(envUrl)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Valores do env.ts */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">2️⃣ Valores do env.ts (GOOGLE_SHEETS):</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API_KEY:</span>
              <div className="flex items-center space-x-2">
                <Badge variant={envConfigApiKey && envConfigApiKey !== 'YOUR_API_KEY_HERE' ? "default" : "destructive"}>
                  {envConfigApiKey && envConfigApiKey !== 'YOUR_API_KEY_HERE' ? "OK" : "Fallback"}
                </Badge>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {envConfigApiKey ? envConfigApiKey.substring(0, 20) + '...' : 'undefined'}
                </code>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SPREADSHEET_ID:</span>
              <div className="flex items-center space-x-2">
                <Badge variant={envConfigSpreadsheetId ? "default" : "destructive"}>
                  {envConfigSpreadsheetId ? "OK" : "Fallback"}
                </Badge>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {envConfigSpreadsheetId || 'undefined'}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Valores do googleSheets.ts */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">3️⃣ Valores do googleSheets.ts (GOOGLE_SHEETS_CONFIG):</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API_KEY:</span>
              <div className="flex items-center space-x-2">
                <Badge variant={googleSheetsApiKey && googleSheetsApiKey !== 'YOUR_API_KEY_HERE' ? "default" : "destructive"}>
                  {googleSheetsApiKey && googleSheetsApiKey !== 'YOUR_API_KEY_HERE' ? "OK" : "Fallback"}
                </Badge>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {googleSheetsApiKey ? googleSheetsApiKey.substring(0, 20) + '...' : 'undefined'}
                </code>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SPREADSHEET_ID:</span>
              <div className="flex items-center space-x-2">
                <Badge variant={googleSheetsSpreadsheetId ? "default" : "destructive"}>
                  {googleSheetsSpreadsheetId ? "OK" : "Fallback"}
                </Badge>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {googleSheetsSpreadsheetId || 'undefined'}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">🔍 Diagnóstico:</h4>
          <div className="space-y-2 text-sm">
            {!envApiKey && (
              <div className="text-red-600">❌ import.meta.env.VITE_GOOGLE_SHEETS_API_KEY não está definida</div>
            )}
            {!envSpreadsheetId && (
              <div className="text-red-600">❌ import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID não está definida</div>
            )}
            {envApiKey && envSpreadsheetId && (
              <div className="text-green-600">✅ Todas as variáveis estão sendo carregadas corretamente!</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
