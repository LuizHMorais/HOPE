import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIInsight } from '@/hooks/useGoogleSheetsData';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Clock,
  Zap,
  ChevronRight
} from 'lucide-react';

interface AIInsightsProps {
  insights: AIInsight[];
  isLoading?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'spending':
    case 'gastos':
      return <TrendingDown className="w-4 h-4" />;
    case 'income':
    case 'receita':
      return <TrendingUp className="w-4 h-4" />;
    case 'alerts':
    case 'alertas':
      return <AlertTriangle className="w-4 h-4" />;
    case 'recommendations':
    case 'recomendações':
      return <Lightbulb className="w-4 h-4" />;
    case 'savings':
    case 'poupança':
      return <Target className="w-4 h-4" />;
    case 'subscriptions':
    case 'assinaturas':
      return <Clock className="w-4 h-4" />;
    case 'cashflow':
    case 'fluxo de caixa':
      return <Zap className="w-4 h-4" />;
    default:
      return <Brain className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'spending':
    case 'gastos':
      return 'destructive';
    case 'income':
    case 'receita':
      return 'success';
    case 'alerts':
    case 'alertas':
      return 'destructive';
    case 'recommendations':
    case 'recomendações':
      return 'default';
    case 'savings':
    case 'poupança':
      return 'success';
    case 'subscriptions':
    case 'assinaturas':
      return 'secondary';
    case 'cashflow':
    case 'fluxo de caixa':
      return 'primary';
    default:
      return 'outline';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'alta':
      return 'destructive';
    case 'medium':
    case 'média':
      return 'secondary';
    case 'low':
    case 'baixa':
      return 'outline';
    default:
      return 'outline';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'text-success';
  if (confidence >= 0.6) return 'text-warning';
  return 'text-destructive';
};

export const AIInsights = ({ insights, isLoading = false }: AIInsightsProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Insights de IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Insights de IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum insight disponível ainda. Os insights são gerados automaticamente pelo sistema de IA.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar insights por prioridade e confiança
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return b.confidence - a.confidence;
  });

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Insights de IA</span>
            <Badge variant="outline" className="ml-2">
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button variant="ghost" size="sm">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedInsights.slice(0, 5).map((insight) => (
          <div
            key={insight.insight_id}
            className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getCategoryIcon(insight.category)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant={getCategoryColor(insight.category) as any}
                      className="text-xs"
                    >
                      {insight.category}
                    </Badge>
                    <Badge 
                      variant={getPriorityColor(insight.priority) as any}
                      className="text-xs"
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                  {Math.round(insight.confidence * 100)}% confiança
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(insight.generated_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {insight.insight}
            </p>

            {insight.action && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-primary mb-1">
                      Ação Recomendada:
                    </div>
                    <div className="text-sm text-foreground">
                      {insight.action}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Modelo: {insight.model} • Temp: {insight.temperature}
              </div>
              <div className="text-xs text-muted-foreground">
                {insight.prompt_tokens && insight.completion_tokens && (
                  <>
                    {insight.prompt_tokens} → {insight.completion_tokens} tokens
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
