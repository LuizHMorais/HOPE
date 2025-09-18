import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, ChevronDown, RefreshCw, Database } from 'lucide-react';

interface Owner {
  id: string;
  name: string;
}

interface OwnerSelectorProps {
  owners: Owner[];
  selectedOwner: string;
  onOwnerChange: (ownerId: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
}

export const OwnerSelector = ({
  owners,
  selectedOwner,
  onOwnerChange,
  onRefresh,
  isLoading = false,
  className = ''
}: OwnerSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOwnerData = owners.find(owner => owner.id === selectedOwner);

  return (
    <Card className={`shadow-card hover:shadow-elevated transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Visualizando dados de:
                </span>
                <Badge variant="outline" className="font-semibold">
                  {selectedOwnerData?.name || 'Selecione um usuário'}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground mt-1">
                {owners.length} {owners.length === 1 ? 'usuário' : 'usuários'} disponível{owners.length !== 1 ? 'is' : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Seletor de Owner */}
            <Select value={selectedOwner} onValueChange={onOwnerChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar usuário" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{owner.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botão de Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="hover:shadow-card transition-all duration-300"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Informações adicionais */}
        {selectedOwnerData && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Dados sincronizados do Google Sheets</span>
              </div>
              <div>
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
