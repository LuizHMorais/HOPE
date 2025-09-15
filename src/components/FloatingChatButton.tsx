import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Sou o assistente financeiro do H.O.P.E. Como posso ajudá-lo com suas finanças hoje?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (question: string): string => {
    const lowercaseQuestion = question.toLowerCase();
    
    if (lowercaseQuestion.includes('gasto') || lowercaseQuestion.includes('despesa')) {
      return "Analisando seus dados, vejo que seus maiores gastos são em Alimentação (R$ 800) e Transporte (R$ 450). Gostaria de dicas para otimizar essas categorias?";
    }
    
    if (lowercaseQuestion.includes('meta') || lowercaseQuestion.includes('objetivo')) {
      return "Sua taxa de poupança atual é de 23.5%, superando a meta de 20%! Que tal definir uma nova meta de emergência ou investimento?";
    }
    
    if (lowercaseQuestion.includes('renda') || lowercaseQuestion.includes('salário')) {
      return "Sua receita mensal atual é de R$ 5.200. Considerando seus gastos de R$ 3.980, você tem uma margem saudável de R$ 1.220 para poupança e investimentos.";
    }
    
    return "Entendi sua pergunta sobre finanças. Com base nos seus dados do H.O.P.E., posso ajudar com análises de gastos, metas de poupança, categorização de despesas e insights personalizados. Poderia ser mais específico?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 h-96 animate-scale-in">
          <Card className="h-full shadow-elevated border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span>H.O.P.E. Assistant</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full pb-4 space-y-3">
              <ScrollArea className="flex-1 pr-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          message.isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex space-x-2 pt-2 border-t border-border/50">
                <Input
                  placeholder="Pergunte sobre suas finanças..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm"
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-primary hover:shadow-glow rounded-full shadow-card flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Abrir chat financeiro"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground transition-transform duration-200" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground transition-transform duration-200 group-hover:scale-110" />
        )}
      </button>
    </>
  );
};