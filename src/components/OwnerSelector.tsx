import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
            {/* Seletor com busca */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-56 justify-between">
                  {selectedOwnerData ? selectedOwnerData.name : 'Selecionar usuário...'}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandInput placeholder="Buscar usuário pelo nome..." />
                  <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {owners.map((owner) => (
                        <CommandItem
                          key={owner.id}
                          value={owner.name}
                          onSelect={() => {
                            onOwnerChange(owner.id);
                            setIsOpen(false);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          {owner.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

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
