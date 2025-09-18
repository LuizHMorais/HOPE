import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Wifi, WifiOff, RefreshCw, ExternalLink } from 'lucide-react';

interface DataStatusProps {
  isUsingMockData: boolean;
  apiKeyValid: boolean | null;
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
  dataSource?: 'api' | 'mock' | 'mixed' | 'unknown';
  errorMessage?: string | null;
  spreadsheetUrl?: string;
  mockModeEnabled?: boolean;
}

export const DataStatus = ({ 
  isUsingMockData, 
  apiKeyValid,
  onRefresh, 
  isLoading = false,
  className = '',
  dataSource = 'unknown',
  errorMessage,
  spreadsheetUrl,
  mockModeEnabled = false,
}: DataStatusProps) => {
  const statusLabel = apiKeyValid === false
    ? 'Dados de Demonstração'
    : apiKeyValid === true
      ? 'Dados em Tempo Real'
      : 'Verificando Conexão...';

  const statusBadge: 'default' | 'secondary' | 'destructive' | 'outline' = apiKeyValid === false
    ? 'secondary'
    : apiKeyValid === true
      ? 'default'
      : 'outline';

  const iconVariant = apiKeyValid === false
    ? 'bg-orange-100'
    : apiKeyValid === true
      ? 'bg-green-100'
      : 'bg-gray-100';

  const dataSourceLabelMap: Record<typeof dataSource, string> = {
    api: 'Google Sheets',
    mock: 'Mock local',
    mixed: 'Parcial (API + mock)',
    unknown: 'Aguardando carregamento'
  };

  const dataSourceBadgeVariant: 'outline' | 'default' | 'secondary' = dataSource === 'api'
    ? 'default'
    : dataSource === 'mock'
      ? 'secondary'
      : 'outline';

  return (
    <Card className={`shadow-card ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconVariant}`}>
              {apiKeyValid === false ? (
                <WifiOff className="w-5 h-5 text-orange-600" />
              ) : apiKeyValid === true ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <Database className="w-5 h-5 text-gray-600" />
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{statusLabel}</span>
                <Badge variant={statusBadge}>
                  {apiKeyValid === false ? 'Offline' : apiKeyValid === true ? 'Online' : 'Testando'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {apiKeyValid === false 
                  ? 'API Key inválida. Usando dados de exemplo.'
                  : apiKeyValid === true 
                  ? 'Conectado ao Google Sheets'
                  : 'Testando conexão com a API...'
                }
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Fonte de dados: 
                <Badge variant={dataSourceBadgeVariant} className="ml-1">
                  {dataSourceLabelMap[dataSource]}
                </Badge>
              </div>
              {mockModeEnabled && apiKeyValid !== true && (
                <div className="text-xs text-muted-foreground mt-1">
                  Modo demonstração habilitado via <code>VITE_USE_MOCK_DATA=true</code>.
                </div>
              )}
              {errorMessage && (
                <div className="text-xs text-destructive mt-1" role="status">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            
            {spreadsheetUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(spreadsheetUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir Planilha
              </Button>
            )}

            {apiKeyValid === false && !spreadsheetUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Configurar API
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
