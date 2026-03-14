import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Loader2, Minimize2, Trash2, Maximize2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatWithAssistant } from '@/lib/mistral';
import { toast } from 'sonner';

// Simple markdown-like rendering for bold and lists
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        // Bold
        let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // List items
        if (processed.startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />;
        }
        if (processed.trim() === '') return <br key={i} />;
        return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: processed }} />;
      })}
    </>
  );
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '👋 Bonjour ! Je suis votre assistant de gestion **AutoPassion BJ**. Je peux vous aider à :\n\n- 📊 Analyser vos ventes et stocks\n- 📦 Gérer vos commandes\n- ✍️ Rédiger des descriptions produits\n- 💡 Vous proposer des actions prioritaires\n\nComment puis-je vous aider ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(msg, window.location.pathname);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Erreur lors de la communication avec l\'assistant';

      toast.error(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '💬 Conversation réinitialisée. Que souhaitez-vous piloter aujourd\'hui sur AutoPassion ? ',
        timestamp: new Date(),
      },
    ]);
  };

  const quickActions = [
    '📊 Résumé des KPIs du jour',
    '📦 Commandes à traiter en priorité',
    '⚠️ Produits en stock faible',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2.5 pl-3 pr-4 z-50 group"
        title="Assistant Admin AutoPassion"
      >
        <span className="h-8 w-8 rounded-full bg-primary-foreground/15 flex items-center justify-center">
          <Bot className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </span>
        <span className="text-sm font-medium">Assistant AutoPassion</span>
        {messages.length > 1 && (
          <span className="bg-primary-foreground text-primary text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
            {messages.length - 1}
          </span>
        )}
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="h-14 px-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-medium">Assistant</span>
          {messages.length > 1 && (
            <span className="bg-primary-foreground text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {messages.length - 1}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${isFullscreen ? 'inset-4' : 'bottom-6 right-6 w-96 h-[600px]'} bg-background border rounded-lg shadow-2xl flex flex-col z-50 ${!isFullscreen && 'max-w-[calc(100vw-1.5rem)]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-medium text-sm">Assistant AutoPassion</h3>
            <span className="text-xs opacity-80">Gestion & Conseils</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={clearChat}
            title="Nouvelle conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Réduire" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(true)}
            title="Minimiser"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="text-sm">
                  <SimpleMarkdown content={message.content} />
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              <span className="text-xs opacity-60 mt-1 block">
                {message.timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Quick actions on first message only */}
        {messages.length === 1 && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs text-muted-foreground">Analyse en cours...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: Donne-moi les 3 priorités de ce matin"
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

