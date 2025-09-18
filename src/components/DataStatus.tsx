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
}

export const DataStatus = ({ 
  isUsingMockData, 
  apiKeyValid,
  onRefresh, 
  isLoading = false,
  className = '' 
}: DataStatusProps) => {
  return (
    <Card className={`shadow-card ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              apiKeyValid === false ? 'bg-orange-100' : apiKeyValid === true ? 'bg-green-100' : 'bg-gray-100'
            }`}>
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
                <span className="text-sm font-medium">
                  {apiKeyValid === false ? 'Dados de Demonstração' : 
                   apiKeyValid === true ? 'Dados em Tempo Real' : 
                   'Verificando Conexão...'}
                </span>
                <Badge variant={apiKeyValid === false ? "secondary" : apiKeyValid === true ? "default" : "outline"}>
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
            
            {apiKeyValid === false && (
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
