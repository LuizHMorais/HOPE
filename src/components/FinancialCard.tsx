import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FinancialCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const FinancialCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend = 'neutral',
  className
}: FinancialCardProps) => {
  const variantClasses = {
    default: 'border-border',
    success: 'border-success/20 bg-success-soft/30',
    warning: 'border-warning/20 bg-warning-soft/30',
    destructive: 'border-destructive/20 bg-destructive-soft/30'
  };

  const trendClasses = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className={cn(
      'shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1',
      variantClasses[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {subtitle && (
          <p className={cn('text-xs', trendClasses[trend])}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};