import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Minimize2, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import temiAvatar from '@/assets/temi-avatar.png';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };
type QuickAction = { label: string; msg?: string; isWhatsApp?: boolean };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bardahl-assistant`;

function getSessionId() {
  let sid = sessionStorage.getItem('bardahl-chat-session');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('bardahl-chat-session', sid);
  }
  return sid;
}

async function streamChat({
  messages,
  conversationId,
  sessionId,
  onDelta,
  onDone,
  onConversationId,
}: {
  messages: Msg[];
  conversationId: string | null;
  sessionId: string;
  onDelta: (t: string) => void;
  onDone: () => void;
  onConversationId: (id: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, conversationId, sessionId }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error || `Erreur ${resp.status}`);
  }

  const cId = resp.headers.get('X-Conversation-Id');
  if (cId) onConversationId(cId);

  if (!resp.body) throw new Error('Pas de stream');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + '\n' + buf;
        break;
      }
    }
  }
  onDone();
}

const WELCOME_MSG: Msg = {
  role: 'assistant',
  content: "Bonjour ! 👋 Je suis **Témi**, votre assistant auto Autopassion.\n\nComment puis-je vous aider aujourd'hui ?",
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: '🚗 Trouver mon huile', msg: "J'aimerais trouver l'huile adaptée à mon véhicule" },
  { label: '🔧 Conseil vidange', msg: 'Quand dois-je faire ma vidange ?' },
  { label: '📦 Voir les produits', msg: 'Quels produits Bardahl avez-vous ?' },
  { label: '💬 WhatsApp', isWhatsApp: true },
];

export function BardahlChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMsg: Msg = { role: 'user', content: text.trim() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput('');
      setIsLoading(true);

      let assistantSoFar = '';
      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && prev.length > updated.length) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev.slice(0, updated.length), { role: 'assistant', content: assistantSoFar }];
        });
      };

      try {
        await streamChat({
          messages: updated.filter((m) => m.role !== 'assistant' || updated.indexOf(m) !== 0),
          conversationId,
          sessionId: getSessionId(),
          onDelta: upsert,
          onDone: () => setIsLoading(false),
          onConversationId: setConversationId,
        });
      } catch (e: any) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `⚠️ ${e.message || "Erreur de connexion. Réessayez."}` },
        ]);
        setIsLoading(false);
      }
    },
    [messages, isLoading, conversationId]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MSG]);
    setConversationId(null);
    sessionStorage.removeItem('bardahl-chat-session');
  };

  // Floating button — bottom-right, compact
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 md:right-6 z-50 h-14 w-14 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center overflow-hidden ring-2 ring-primary/30"
        aria-label="Demandez à Témi"
      >
        <img src={temiAvatar} alt="Témi" className="h-full w-full object-cover" />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
      </button>
    );
  }

  // Minimized pill
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-4 md:right-6 z-50 h-10 px-2 pr-3 rounded-full bg-secondary text-secondary-foreground shadow-xl hover:scale-105 transition-transform flex items-center gap-1.5"
      >
        <img src={temiAvatar} alt="Témi" className="h-7 w-7 rounded-full object-cover" />
        <span className="text-xs font-semibold">Parlez à Témi</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:w-[380px] max-w-[calc(100vw-1rem)] h-[min(560px,calc(100vh-6rem))] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-secondary text-secondary-foreground shrink-0">
        <div className="flex items-center gap-2">
          <img src={temiAvatar} alt="Témi" className="h-7 w-7 rounded-full object-cover" />
          <div>
            <h3 className="text-sm font-bold leading-none">Témi</h3>
            <span className="text-[10px] opacity-70">Votre assistant auto</span>
          </div>
        </div>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={clearChat} title="Nouvelle conversation">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={() => setIsOpen(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions (only show at start) */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                if (a.isWhatsApp) {
                  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '237XXXXXXXXX';
                  const message = encodeURIComponent("Bonjour, j'aimerais avoir plus d'informations sur vos produits");
                  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                } else {
                  send(a.msg!);
                }
              }}
              className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t border-border shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre question..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 max-h-20"
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={isLoading || !input.trim()}
            onClick={() => send(input)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
