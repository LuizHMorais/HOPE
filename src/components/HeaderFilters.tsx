import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronDown, RefreshCw, User, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/mockData';

interface OwnerOption {
  id: string;
  name: string;
}

interface HeaderFiltersProps {
  owners: OwnerOption[];
  selectedOwner: string;
  onOwnerChange: (ownerId: string) => void;
  selectedMonth: number; // 0-11 UTC
  onMonthChange: (m: number) => void;
  selectedYear: number;
  onYearChange: (y: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: Date;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  netFlow?: number;
  savingsRate?: number;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

export const HeaderFilters = ({
  owners,
  selectedOwner,
  onOwnerChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  onRefresh,
  isLoading = false,
  lastUpdated,
  monthlyIncome = 0,
  monthlyExpenses = 0,
  netFlow = 0,
  savingsRate = 0,
}: HeaderFiltersProps) => {
  const [openOwner, setOpenOwner] = useState(false);
  const [openPeriod, setOpenPeriod] = useState(false);

  const owner = useMemo(() => owners.find(o => o.id === selectedOwner), [owners, selectedOwner]);
  const ownerName = owner?.name || 'Selecionar usuário';
  const initials = getInitials(ownerName);
  const monthLabel = new Date(Date.UTC(2000, selectedMonth, 1)).toLocaleString('pt-BR', { month: 'long' });
  const updatedAt = (lastUpdated || new Date()).toLocaleString('pt-BR');

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Owner chip */}
            <Popover open={openOwner} onOpenChange={setOpenOwner}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full pl-2 pr-3 h-9"
                  aria-label="Selecionar usuário"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mr-2">
                    {initials || <User className="w-3 h-3" />}
                  </div>
                  <span className="max-w-[12rem] sm:max-w-[16rem] truncate">{ownerName}</span>
                  <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-64" align="start">
                <Command>
                  <CommandInput placeholder="Buscar usuário..." />
                  <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {owners.map((o) => (
                        <CommandItem
                          key={o.id}
                          value={o.name}
                          onSelect={() => { onOwnerChange(o.id); setOpenOwner(false); }}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mr-2">
                            {getInitials(o.name)}
                          </div>
                          <span className="truncate">{o.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Period chip (month/year) */}
            <Popover open={openPeriod} onOpenChange={setOpenPeriod}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-3 h-9"
                  aria-label="Selecionar período"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="capitalize">{monthLabel} {selectedYear}</span>
                  <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Selecionar mês</div>
                  <Command>
                    <CommandInput placeholder="Buscar mês..." />
                    <CommandList>
                      <CommandGroup>
                        {Array.from({ length: 12 }, (_, m) => (
                          <CommandItem
                            key={m}
                            value={new Date(2000, m, 1).toLocaleString('pt-BR', { month: 'long' })}
                            onSelect={() => { onMonthChange(m); setOpenPeriod(false); }}
                          >
                            <span className="capitalize">
                              {new Date(2000, m, 1).toLocaleString('pt-BR', { month: 'long' })}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>

                  <div className="text-sm font-medium">Selecionar ano</div>
                  <Select value={String(selectedYear)} onValueChange={(v) => onYearChange(Number(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 6 }, (_, i) => new Date().getUTCFullYear() - i).map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Atualizar dados"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            {/* Atalhos de período */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => { onMonthChange(new Date().getUTCMonth()); onYearChange(new Date().getUTCFullYear()); }}>Este mês</Button>
              <Button variant="ghost" size="sm" onClick={() => { const d=new Date(); const m=(d.getUTCMonth()+11)%12; const y=m===11?d.getUTCFullYear()-1:d.getUTCFullYear(); onMonthChange(m); onYearChange(y); }}>Anterior</Button>
              <Button variant="ghost" size="sm" onClick={() => { onMonthChange(0); onYearChange(new Date().getUTCFullYear()); }}>YTD</Button>
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2 flex-wrap" aria-live="polite">
          <span className="flex items-center gap-1">
            <span>Dados sincronizados do Google Sheets</span>
          </span>
          <Badge variant="outline">Última atualização: {updatedAt}</Badge>
        </div>

        {/* KPI pills */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-full border px-3 py-2 flex items-center justify-between bg-background/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Receita mensal</span>
            </div>
            <span className="text-sm font-semibold">{formatCurrency(monthlyIncome)}</span>
          </div>
          <div className="rounded-full border px-3 py-2 flex items-center justify-between bg-background/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Gastos mensais</span>
            </div>
            <span className="text-sm font-semibold">{formatCurrency(monthlyExpenses)}</span>
          </div>
          <div className="rounded-full border px-3 py-2 flex items-center justify-between bg-background/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Fluxo do mês</span>
            </div>
            <span className={`text-sm font-semibold ${netFlow >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(netFlow)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderFilters;


