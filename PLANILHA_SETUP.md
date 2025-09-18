# Configuração da Planilha Google Sheets

## 🎯 **Objetivo**
Conectar o app HOPE à planilha real do Google Sheets para usar os dados processados pelo n8n.

## 📋 **Passos para Configurar**

### 1. **Tornar a Planilha Pública**

1. **Abra a planilha**: [https://docs.google.com/spreadsheets/d/1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1h-xknv9IelCmariwIkh0lIGhSgwgQzHoG6V9nB9dsps/edit?usp=sharing)

2. **Clique em "Compartilhar"** (canto superior direito)

3. **Configure as permissões**:
   - **"Restrito"** → **"Qualquer pessoa com o link"**
   - **Permissão**: **"Visualizador"**
   - **Clique em "Concluído"**

### 2. **Verificar as Abas**

A planilha deve ter as seguintes abas:
- ✅ **People** - Dados das pessoas
- ✅ **Accounts** - Contas bancárias
- ✅ **Transactions** - Transações
- ✅ **Dashboard** - Métricas consolidadas
- ✅ **AI_Insights** - Insights gerados pela IA

### 3. **Configurar API Key (Opcional)**

Se quiser usar uma API Key personalizada:

1. **Acesse**: [Google Cloud Console](https://console.cloud.google.com/)

2. **Crie um projeto** ou selecione um existente

3. **Ative a API**:
   - Vá em "APIs e Serviços" → "Biblioteca"
   - Procure por "Google Sheets API"
   - Clique em "Ativar"

4. **Crie uma API Key**:
   - Vá em "APIs e Serviços" → "Credenciais"
   - Clique em "Criar Credenciais" → "Chave de API"
   - Copie a chave gerada

5. **Configure no app**:
   - Crie o arquivo `.env.local` na raiz do projeto
   - Adicione: `VITE_GOOGLE_SHEETS_API_KEY=sua_chave_aqui`
   - Reinicie o servidor

### 4. **Testar a Conexão**

1. **Abra o app** e vá para a página principal
2. **Clique em "Testar Conexão"** no componente de diagnóstico
3. **Verifique o resultado**:
   - ✅ **Sucesso**: "Conexão com Google Sheets funcionando!"
   - ❌ **Erro 401**: Planilha não está pública
   - ❌ **Erro 403**: API Key sem permissões
   - ❌ **Erro 404**: Planilha não encontrada

## 🔧 **Soluções para Problemas**

### **Erro 401 - Unauthorized**
- **Causa**: Planilha não está pública
- **Solução**: Tornar a planilha pública (passo 1)

### **Erro 403 - Forbidden**
- **Causa**: API Key sem permissões
- **Solução**: Configurar API Key corretamente (passo 3)

### **Erro 404 - Not Found**
- **Causa**: ID da planilha incorreto
- **Solução**: Verificar se a URL da planilha está correta

### **Dados não carregam**
- **Causa**: Abas não existem ou estão vazias
- **Solução**: Verificar se o n8n está populando as abas

## 📊 **Estrutura Esperada dos Dados**

### **Aba People**
```
link_id | person_alias | first_name | last_name | email | phone
```

### **Aba Accounts**
```
account_id | link_id | account_name | institution_name | balance_current | currency | liability_outstanding | funds_total
```

### **Aba Transactions**
```
transaction_id | link_id | amount | description | category | value_date | posted_date
```

### **Aba Dashboard**
```
link_id | total_balance | gasto_mes_atual | gasto_mes_anterior | variacao_percentual | total_transactions | inflow_sum | outflow_sum | net_flow
```

### **Aba AI_Insights**
```
insight_id | link_id | source_from | source_to | generated_at | title | insight | category | priority | action | confidence | metrics_json | model | temperature | prompt_tokens | completion_tokens
```

## ✅ **Verificação Final**

Após configurar, o app deve:
1. **Conectar** sem erros 401/403
2. **Carregar** dados das 5 abas
3. **Mostrar** usuários no seletor
4. **Exibir** métricas e insights
5. **Funcionar** todas as funcionalidades

## 🆘 **Suporte**

Se ainda houver problemas:
1. **Verifique** se a planilha está pública
2. **Teste** a conexão no componente de diagnóstico
3. **Confirme** que o n8n está populando as abas
4. **Verifique** se a API Key está configurada corretamente
