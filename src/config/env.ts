// Configuração centralizada de todas as variáveis de ambiente
// Este arquivo centraliza todas as configurações de API e URLs

export const ENV_CONFIG = {
  // ========================================
  // GOOGLE SHEETS API
  // ========================================
  GOOGLE_SHEETS: {
    API_KEY: String(import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'YOUR_API_KEY_HERE').trim(),
    SPREADSHEET_ID: String(import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID || '1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps').trim(),
    URL: String(import.meta.env.VITE_GOOGLE_SHEETS_URL || 'https://docs.google.com/spreadsheets/d/1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps/edit?usp=sharing').trim(),
    API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
  },

  // ========================================
  // N8N WORKFLOW APIs
  // ========================================
  N8N: {
    BASE_URL: import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
    WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
  },

  // ========================================
  // BELVO API (Open Banking)
  // ========================================
  BELVO: {
    API_URL: import.meta.env.VITE_BELVO_API_URL || 'https://sandbox.belvo.com/api',
    SECRET_ID: import.meta.env.VITE_BELVO_SECRET_ID || 'YOUR_BELVO_SECRET_ID',
    SECRET_PASSWORD: import.meta.env.VITE_BELVO_SECRET_PASSWORD || 'YOUR_BELVO_PASSWORD',
  },

  // ========================================
  // OLLAMA AI API
  // ========================================
  OLLAMA: {
    API_URL: import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434',
    MODEL: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2:3b',
  },

  // ========================================
  // APP CONFIGURATION
  // ========================================
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'HOPE',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  // Verificar se uma configuração está definida
  isConfigured: (key: string): boolean => {
    return import.meta.env[key] !== undefined && import.meta.env[key] !== '';
  },

  // Obter configuração com fallback
  get: (key: string, fallback: string = ''): string => {
    return import.meta.env[key] || fallback;
  },

  // Verificar se está em modo de desenvolvimento
  isDevelopment: (): boolean => {
    return import.meta.env.DEV;
  },

  // Verificar se está em modo de produção
  isProduction: (): boolean => {
    return import.meta.env.PROD;
  },
};

// Exportar configurações específicas para facilitar o uso
export const {
  GOOGLE_SHEETS,
  N8N,
  BELVO,
  OLLAMA,
  APP,
} = ENV_CONFIG;

// Função para validar configurações obrigatórias
export const validateConfig = (): { isValid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  // Verificar configurações obrigatórias
  if (!ENV_CONFIG.GOOGLE_SHEETS.API_KEY || ENV_CONFIG.GOOGLE_SHEETS.API_KEY === 'YOUR_API_KEY_HERE') {
    missing.push('VITE_GOOGLE_SHEETS_API_KEY');
  }
  
  if (!ENV_CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID) {
    missing.push('VITE_GOOGLE_SHEETS_SPREADSHEET_ID');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
};

// Função para obter informações de configuração
export const getConfigInfo = () => {
  const validation = validateConfig();
  
  return {
    app: {
      name: ENV_CONFIG.APP.NAME,
      version: ENV_CONFIG.APP.VERSION,
      mode: ENV_CONFIG.isDevelopment() ? 'development' : 'production',
    },
    apis: {
      googleSheets: {
        configured: ENV_CONFIG.isConfigured('VITE_GOOGLE_SHEETS_API_KEY'),
        spreadsheetId: ENV_CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
      },
      n8n: {
        configured: ENV_CONFIG.isConfigured('VITE_N8N_BASE_URL'),
        baseUrl: ENV_CONFIG.N8N.BASE_URL,
      },
      belvo: {
        configured: ENV_CONFIG.isConfigured('VITE_BELVO_SECRET_ID'),
        apiUrl: ENV_CONFIG.BELVO.API_URL,
      },
      ollama: {
        configured: ENV_CONFIG.isConfigured('VITE_OLLAMA_API_URL'),
        apiUrl: ENV_CONFIG.OLLAMA.API_URL,
        model: ENV_CONFIG.OLLAMA.MODEL,
      },
    },
    validation,
  };
};
