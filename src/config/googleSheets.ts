// Configuração para integração com Google Sheets
export const GOOGLE_SHEETS_CONFIG = {
  // ID da planilha (extraído da URL)
  SPREADSHEET_ID: '1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps',
  
  // Nomes das abas
  SHEETS: {
    PEOPLE: 'People',
    ACCOUNTS: 'Accounts', 
    TRANSACTIONS: 'Transactions',
    DASHBOARD: 'Dashboard',
    AI_INSIGHTS: 'AI_Insights',
    SYNC_STATE: 'SyncState'
  },
  
  // URL base da API do Google Sheets
  API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
  
  // Para desenvolvimento, você pode usar uma API key
  // Em produção, use autenticação OAuth2
  API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'YOUR_API_KEY_HERE',
  
  // Configurações de cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Função para construir URLs da API
export const buildSheetUrl = (sheetName: string, range?: string) => {
  const { API_BASE_URL, SPREADSHEET_ID, API_KEY } = GOOGLE_SHEETS_CONFIG;
  const rangeParam = range ? `/${range}` : '';
  const keyParam = API_KEY ? `?key=${API_KEY}` : '';
  
  return `${API_BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}${rangeParam}${keyParam}`;
};

// Função para extrair ID da planilha de uma URL
export const extractSpreadsheetId = (url: string): string | null => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// Headers padrão para requisições
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Função para tratar erros da API
export const handleApiError = (error: any): string => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return 'Dados inválidos enviados para a API';
      case 401:
        return 'Não autorizado. Verifique suas credenciais';
      case 403:
        return 'Acesso negado. Verifique as permissões da planilha';
      case 404:
        return 'Planilha não encontrada';
      case 429:
        return 'Muitas requisições. Tente novamente em alguns minutos';
      case 500:
        return 'Erro interno do servidor';
      default:
        return `Erro ${status}: ${data?.error?.message || 'Erro desconhecido'}`;
    }
  }
  
  if (error.request) {
    return 'Não foi possível conectar com a API do Google Sheets';
  }
  
  return error.message || 'Erro desconhecido';
};
