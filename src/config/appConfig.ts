// Configuração da aplicação
export const APP_CONFIG = {
  // Se true, usa dados mockados (sem tentar conectar à API)
  // Se false, tenta conectar à API do Google Sheets
  USE_MOCK_DATA_ONLY: true,
  
  // Configurações de desenvolvimento
  DEV: {
    // Se true, mostra logs detalhados no console
    VERBOSE_LOGGING: false,
    
    // Se true, simula delay de rede
    SIMULATE_NETWORK_DELAY: true,
    
    // Delay em milissegundos para simular rede
    NETWORK_DELAY_MS: 1000,
  },
  
  // Configurações da API
  API: {
    // Timeout para requisições em milissegundos
    TIMEOUT_MS: 10000,
    
    // Número máximo de tentativas
    MAX_RETRIES: 3,
    
    // Delay entre tentativas em milissegundos
    RETRY_DELAY_MS: 1000,
  }
};

// Função para verificar se deve usar dados mockados
export const shouldUseMockData = (): boolean => {
  // Se a variável de ambiente está definida, usar ela
  if (import.meta.env.VITE_USE_MOCK_DATA !== undefined) {
    return import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }
  
  // Caso contrário, usar a configuração padrão
  return APP_CONFIG.USE_MOCK_DATA_ONLY;
};

// Função para obter o hook correto baseado na configuração
export const getDataHook = () => {
  if (shouldUseMockData()) {
    return () => import('@/hooks/useGoogleSheetsDataSimple').then(m => m.useGoogleSheetsDataSimple);
  } else {
    return () => import('@/hooks/useGoogleSheetsData').then(m => m.useGoogleSheetsData);
  }
};
