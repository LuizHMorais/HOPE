# Configuração da Integração com Google Sheets

Este documento explica como configurar a integração com Google Sheets para o app HOPE.

## 📋 Pré-requisitos

1. **Planilha do Google Sheets** com as seguintes abas:
   - `People` - Dados das pessoas/usuários
   - `Accounts` - Contas bancárias
   - `Transactions` - Transações financeiras
   - `Dashboard` - Métricas consolidadas
   - `AI_Insights` - Insights gerados pela IA
   - `SyncState` - Estado de sincronização

2. **API Key do Google Sheets** (opcional, para desenvolvimento)

## 🔧 Configuração

### 1. Configurar API Key (Desenvolvimento)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Sheets
4. Crie uma API Key
5. Configure a variável de ambiente:

```bash
# .env.local
VITE_GOOGLE_SHEETS_API_KEY=AQ.Ab8RN6L6lcMgLNGXJZOvPUOxq_utwCf1PBlx86-fdOq456cW0g
```

### 2. Configurar Permissões da Planilha

1. Abra sua planilha no Google Sheets
2. Clique em "Compartilhar" (botão azul no canto superior direito)
3. Configure as permissões:
   - **Para desenvolvimento**: "Qualquer pessoa com o link pode visualizar"
   - **Para produção**: Configure permissões específicas

### 3. Estrutura da Planilha

#### Aba `People`
```
link_id | person_alias | first_name | last_name | email | phone
```

#### Aba `Accounts`
```
account_id | link_id | account_name | institution_name | balance_current | currency | liability_outstanding | funds_total
```

#### Aba `Transactions`
```
transaction_id | link_id | amount | description | category | value_date | posted_date
```

#### Aba `Dashboard`
```
link_id | total_balance | gasto_mes_atual | gasto_mes_anterior | variacao_percentual | total_transactions | inflow_sum | outflow_sum | net_flow
```

#### Aba `AI_Insights`
```
insight_id | link_id | source_from | source_to | generated_at | title | insight | category | priority | action | confidence | metrics_json | model | temperature | prompt_tokens | completion_tokens
```

## 🚀 Uso

### 1. Importar o Hook

```typescript
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';

const MyComponent = () => {
  const {
    data,
    selectedOwner,
    setSelectedOwner,
    isLoading,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetrics,
    owners
  } = useGoogleSheetsData();

  // Usar os dados...
};
```

### 2. Componentes Disponíveis

- `OwnerSelector` - Seletor de usuário/owner
- `AIInsights` - Exibição de insights de IA
- `GoogleSheetsIntegration` - Integração com Google Sheets

### 3. Exemplo de Uso Completo

```typescript
import { OwnerSelector } from '@/components/OwnerSelector';
import { AIInsights } from '@/components/AIInsights';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';

const Dashboard = () => {
  const {
    selectedOwner,
    setSelectedOwner,
    isLoading,
    fetchAllData,
    getSelectedOwnerData,
    getSelectedOwnerMetrics,
    owners
  } = useGoogleSheetsData();

  const ownerData = getSelectedOwnerData();
  const ownerMetrics = getSelectedOwnerMetrics();

  return (
    <div>
      <OwnerSelector
        owners={owners}
        selectedOwner={selectedOwner}
        onOwnerChange={setSelectedOwner}
        onRefresh={fetchAllData}
        isLoading={isLoading}
      />
      
      {ownerData && (
        <AIInsights 
          insights={ownerData.insights}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
```

## 🔄 Fluxo de Dados

1. **n8n V5.2** - ETL dos dados da Belvo para Google Sheets
2. **n8n IA Flow** - Geração de insights usando Ollama
3. **App HOPE** - Consumo dos dados processados

## 🛠️ Troubleshooting

### Erro 403 - Acesso Negado
- Verifique as permissões da planilha
- Confirme se a API Key tem acesso à planilha

### Erro 404 - Planilha Não Encontrada
- Verifique o ID da planilha em `src/config/googleSheets.ts`
- Confirme se a planilha existe e está acessível

### Dados Não Carregam
- Verifique se as abas existem na planilha
- Confirme se os headers estão corretos
- Verifique o console do navegador para erros

### API Key Não Funciona
- Verifique se a API do Google Sheets está ativada
- Confirme se a API Key está correta
- Verifique as restrições da API Key

## 📝 Notas Importantes

1. **Limite de Requisições**: A API do Google Sheets tem limites de requisições
2. **Cache**: Os dados são cacheados por 5 minutos
3. **Retry**: Sistema de retry automático em caso de falha
4. **Segurança**: Em produção, use OAuth2 em vez de API Key

## 🔗 Links Úteis

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [Ollama Documentation](https://ollama.ai/docs)
