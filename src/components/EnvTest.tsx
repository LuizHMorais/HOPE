import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ENV_CONFIG } from '@/config/env';

export const EnvTest = () => {
  // Exemplo de como o env.ts pega as informações do .env.local
  const googleSheetsConfig = ENV_CONFIG.GOOGLE_SHEETS;
  
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>🔍 Teste de Configuração - Como Funciona</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">📁 Variáveis do .env.local (carregadas pelo Vite):</h4>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            <div>
              VITE_GOOGLE_SHEETS_API_KEY=
              {import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
                ? `${String(import.meta.env.VITE_GOOGLE_SHEETS_API_KEY).slice(0, 8)}********`
                : 'NÃO DEFINIDA'}
            </div>
            <div>
              VITE_GOOGLE_SHEETS_SPREADSHEET_ID=
              {import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID || 'NÃO DEFINIDA'}
            </div>
            <div>
              VITE_GOOGLE_SHEETS_URL=
              {import.meta.env.VITE_GOOGLE_SHEETS_URL || 'NÃO DEFINIDA'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">⚙️ Código env.ts:</h4>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            <div>GOOGLE_SHEETS: {'{'}</div>
            <div className="ml-4">API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'YOUR_API_KEY_HERE',</div>
            <div className="ml-4">SPREADSHEET_ID: import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID || 'fallback',</div>
            <div className="ml-4">URL: import.meta.env.VITE_GOOGLE_SHEETS_URL || 'fallback',</div>
            <div>{'}'}</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">🎯 Valores Carregados:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Key:</span>
              <Badge variant="outline" className="text-xs">
                {googleSheetsConfig.API_KEY.substring(0, 20)}...
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Spreadsheet ID:</span>
              <Badge variant="outline" className="text-xs">
                {googleSheetsConfig.SPREADSHEET_ID}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">URL:</span>
              <Badge variant="outline" className="text-xs">
                {googleSheetsConfig.URL.substring(0, 30)}...
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">🔄 Fluxo de Funcionamento:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span>Vite carrega automaticamente o arquivo .env.local</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span>import.meta.env.VITE_* acessa as variáveis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span>env.ts centraliza todas as configurações</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <span>Componentes usam ENV_CONFIG.GOOGLE_SHEETS.API_KEY</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
