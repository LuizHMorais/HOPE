// Dados mockados baseados na estrutura real da planilha Google Sheets
// Estes dados são usados quando a API Key não está disponível ou falha

export const mockPeopleData = [
  {
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    person_alias: "Alícia Cunha Mendonça",
    first_name: "Alícia",
    last_name: "Cunha Mendonça",
    email: "opereira@example.com",
    phone: "+55 11 99999-9999"
  },
  {
    link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
    person_alias: "Maria Júlia Souza Aparecida",
    first_name: "Maria Júlia",
    last_name: "Souza Aparecida",
    email: "luiz-gustavo60@example.com",
    phone: "+55 11 88888-8888"
  },
  {
    link_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0",
    person_alias: "Léo Castro da Conceição",
    first_name: "Léo",
    last_name: "Castro da Conceição",
    email: "duartebrayan@example.com",
    phone: "+55 11 77777-7777"
  }
];

export const mockAccountsData = [
  {
    account_id: "49329389-a6d2-4be3-983c-e850c970fc4f",
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    account_name: "PGBL - REGRESSIVA DEFINITIVA",
    institution_name: "erebor_br_retail",
    balance_current: 666667,
    currency: "BRL",
    liability_outstanding: 0,
    funds_total: 666667
  },
  {
    account_id: "eef5419c-ac5c-492a-8206-c7378d0b5932",
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    account_name: "PREV CONVENIOS VGBL",
    institution_name: "erebor_br_retail",
    balance_current: 481932,
    currency: "BRL",
    liability_outstanding: 0,
    funds_total: 481932
  },
  {
    account_id: "76518877-06c0-49d5-b8a7-c6b9da57f679",
    link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
    account_name: "Person Juro Real Target2026 Pgbl",
    institution_name: "erebor_br_retail",
    balance_current: 614591,
    currency: "BRL",
    liability_outstanding: 0,
    funds_total: 614591
  },
  {
    account_id: "44666acb-4c52-49fc-be35-55244f93dca9",
    link_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0",
    account_name: "Person Smart Acoes Prem V40 Pgbl",
    institution_name: "erebor_br_retail",
    balance_current: 684751,
    currency: "BRL",
    liability_outstanding: 0,
    funds_total: 684751
  }
];

export const mockTransactionsData = [
  {
    transaction_id: "tx_001",
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    amount: 4536.37,
    description: "Transferência recebida",
    category: "transfers",
    value_date: "2025-09-18",
    posted_date: "2025-09-18"
  },
  {
    transaction_id: "tx_002",
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    amount: -1286.91,
    description: "Compra no supermercado",
    category: "uncategorized",
    value_date: "2025-09-17",
    posted_date: "2025-09-17"
  },
  {
    transaction_id: "tx_003",
    link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
    amount: 10881.91,
    description: "Salário mensal",
    category: "income",
    value_date: "2025-09-15",
    posted_date: "2025-09-15"
  },
  {
    transaction_id: "tx_004",
    link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
    amount: -8500,
    description: "Plataforma de streaming",
    category: "online platforms & leisure",
    value_date: "2025-09-14",
    posted_date: "2025-09-14"
  },
  {
    transaction_id: "tx_005",
    link_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0",
    amount: 3317.97,
    description: "Freelance",
    category: "income",
    value_date: "2025-09-13",
    posted_date: "2025-09-13"
  },
  {
    transaction_id: "tx_006",
    link_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0",
    amount: -937.7,
    description: "Saque ATM",
    category: "withdrawal & atm",
    value_date: "2025-09-12",
    posted_date: "2025-09-12"
  }
];

export const mockDashboardData = [
  {
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    total_balance: 2277102.01,
    gasto_mes_atual: 1286.91,
    gasto_mes_anterior: 1200.00,
    variacao_percentual: 7.24,
    total_transactions: 2,
    inflow_sum: 4536.37,
    outflow_sum: 1286.91,
    net_flow: 3249.46
  },
  {
    link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
    total_balance: 2364250.89,
    gasto_mes_atual: 8500.00,
    gasto_mes_anterior: 8000.00,
    variacao_percentual: 6.25,
    total_transactions: 2,
    inflow_sum: 10881.91,
    outflow_sum: 8500.00,
    net_flow: 2381.91
  },
  {
    link_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0",
    total_balance: 2303121.43,
    gasto_mes_atual: 937.7,
    gasto_mes_anterior: 800.00,
    variacao_percentual: 17.21,
    total_transactions: 2,
    inflow_sum: 3317.97,
    outflow_sum: 937.7,
    net_flow: 2380.27
  }
];

export const mockAIInsightsData = [
  {
    insight_id: "791405df-8b19-49d3-bdde-ad252157d91a-s5hrbg0u",
    link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
    source_from: "2025-06-18",
    source_to: "2025-09-18",
    generated_at: "2025-09-18T02:19:09.473Z",
    title: "Fluxo de caixa positivo",
    insight: "O fluxo de caixa é positivo, com um valor de inflow de R$ 4.536,37.",
    category: "income",
    priority: "low",
    action: "Aumentar o fluxo de caixa",
    confidence: 0.9,
    metrics_json: JSON.stringify({
      link_id: "791405df-8b19-49d3-bdde-ad252157d91a",
      kpis: {
        total_inflow: 4536.37,
        total_outflow: 1286.91,
        net_flow: 3249.46
      }
    }),
    model: "llama3.2:3b",
    temperature: 0.1,
    prompt_tokens: 594,
    completion_tokens: 195
  },
  {
    insight_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40-kfc98ucn",
    link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
    source_from: "2025-06-18",
    source_to: "2025-09-18",
    generated_at: "2025-09-18T02:19:11.223Z",
    title: "Concentração por conta",
    insight: "As contas têm uma concentração desigual de fundos, com 2 contas tendo mais de 50% do total.",
    category: "alerts",
    priority: "high",
    action: "Reorganizar contas para melhorar a gestão financeira",
    confidence: 0.8,
    metrics_json: JSON.stringify({
      link_id: "1d2b216d-ce08-4906-a73b-68a6046e3f40",
      kpis: {
        total_balance: 2364250.89,
        total_inflow: 10881.91,
        total_outflow: 8500.00
      }
    }),
    model: "llama3.2:3b",
    temperature: 0.1,
    prompt_tokens: 602,
    completion_tokens: 235
  },
  {
    insight_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0-alrc3u3h",
    link_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0",
    source_from: "2025-06-18",
    source_to: "2025-09-18",
    generated_at: "2025-09-18T02:20:11.306Z",
    title: "Categorias de gastos",
    insight: "As categorias de gastos mostram que há mais saques e cobranças do que receitas, indicando uma tendência de despesa.",
    category: "spending",
    priority: "medium",
    action: "Monitorar as despesas para identificar áreas de melhoria",
    confidence: 0.7,
    metrics_json: JSON.stringify({
      link_id: "6021e3e3-3d14-4856-b1ac-3a571dc134f0",
      kpis: {
        total_inflow: 3317.97,
        total_outflow: 937.7,
        net_flow: 2380.27
      }
    }),
    model: "llama3.2:3b",
    temperature: 0.1,
    prompt_tokens: 599,
    completion_tokens: 255
  }
];

// Função para simular delay da API
export const simulateApiDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Função para simular dados da API
export const getMockSheetData = async (sheetName: string) => {
  await simulateApiDelay(500); // Simular delay da rede
  
  switch (sheetName) {
    case 'People':
      return mockPeopleData.map(person => Object.values(person));
    case 'Accounts':
      return mockAccountsData.map(account => Object.values(account));
    case 'Transactions':
      return mockTransactionsData.map(transaction => Object.values(transaction));
    case 'Dashboard':
      return mockDashboardData.map(dashboard => Object.values(dashboard));
    case 'AI_Insights':
      return mockAIInsightsData.map(insight => Object.values(insight));
    default:
      return [];
  }
};
