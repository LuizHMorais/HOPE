import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIInsight, getPriorityColor, getPriorityBadgeVariant, getCategoryColor } from '@/lib/mockData';
import { Brain, Clock, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface InsightCardProps {
  insight: AIInsight;
}

export const InsightCard = ({ insight }: InsightCardProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Target className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confidencePercentage = Math.round(insight.confidence * 100);

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-primary">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <Badge 
            variant={getPriorityBadgeVariant(insight.priority)}
            className="flex items-center space-x-1"
          >
            {getPriorityIcon(insight.priority)}
            <span className="capitalize">{insight.priority}</span>
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatDate(insight.generated_at)}</span>
          </div>
          <Badge variant="outline" className={getCategoryColor(insight.category)}>
            {insight.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Insight da IA:</h4>
            <p className="text-foreground leading-relaxed">{insight.insight}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Ação Recomendada:</h4>
            <p className="text-muted-foreground leading-relaxed">{insight.action}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-success">
              {insight.metrics_json.transactions_summary.inflow_sum.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
            <div className="text-xs text-muted-foreground">Entradas</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">
              {insight.metrics_json.transactions_summary.outflow_sum.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
            <div className="text-xs text-muted-foreground">Saídas</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {insight.metrics_json.accounts_summary.count}
            </div>
            <div className="text-xs text-muted-foreground">Contas</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-warning">
              {confidencePercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Confiança</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Modelo: {insight.model} • Temp: {insight.temperature}
          </div>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};