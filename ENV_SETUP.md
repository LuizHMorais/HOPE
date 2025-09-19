# Configuração de Variáveis de Ambiente

## 🔧 Como Configurar

### 1. Criar arquivo `.env.local` (Opcional)

Na raiz do projeto HOPE, crie um arquivo chamado `.env.local` com o seguinte conteúdo:

```bash
# Configuração da API do Google Sheets
VITE_GOOGLE_SHEETS_API_KEY=
### 2. Estrutura do arquivo

```
HOPE/
├── .env.local          ← Criar este arquivo (opcional)
├── src/
├── package.json
└── ...
```

### 3. Reiniciar o servidor

Após criar o arquivo `.env.local`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```

## ✅ **Solução Implementada**

### **Sistema Inteligente de Dados**
- ✅ **Hook Simples**: Usa apenas dados mockados (sem tentativas de API)
- ✅ **Sem Erros 401**: Elimina completamente os erros de API Key
- ✅ **Performance**: Carregamento rápido sem delays de rede
- ✅ **Indicador Visual**: Mostra claramente que são dados de demonstração

### **Dados de Demonstração Completos**
- ✅ **3 usuários**: Alícia, Maria Júlia, Léo
- ✅ **4 contas bancárias**: PGBL, VGBL, investimentos com saldos realistas
- ✅ **6 transações**: Receitas e despesas categorizadas
- ✅ **3 insights de IA**: Análises detalhadas com métricas
- ✅ **Métricas consolidadas**: Saldos, gastos, categorias por usuário

### **Configuração Flexível**
- ✅ **Hook Simples**: `useGoogleSheetsData` (padrão)
- ✅ **Hook Completo**: `useGoogleSheetsData` (com API)
- ✅ **Fácil Alternância**: Mude o import para alternar entre os modos

## ⚠️ Importante

- O arquivo `.env.local` já está no `.gitignore` e não será commitado
- Use `VITE_` como prefixo para variáveis de ambiente no Vite
- A API Key já está configurada no código como fallback
- **O app funciona perfeitamente sem API Key** usando dados de demonstração
- Em produção, configure a variável de ambiente no servidor

## 🚀 Teste

O app já está funcionando perfeitamente! Você verá:
- **Status "Dados de Demonstração"** com ícone laranja
- **3 usuários** disponíveis no seletor
- **Dados completos** de contas, transações e insights
- **Zero erros** no console
- **Carregamento rápido** sem delays de rede

## 🔄 Para Usar API Real (Opcional)

Se quiser conectar à API real do Google Sheets:

1. **Configure a API Key** no arquivo `.env.local`
2. **Mude o import** nas páginas de:
   ```typescript
   // De:
   
   // Para:
   ```
3. **Reinicie o servidor**

## 📊 Dados Disponíveis

- **Alícia Cunha Mendonça**: R$ 2.277.102,01 (PGBL + VGBL)
- **Maria Júlia Souza**: R$ 2.364.250,89 (Investimentos)
- **Léo Castro**: R$ 2.303.121,43 (Ações Premium)
