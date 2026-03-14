import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Loader2, Minimize2, Trash2, User, CheckCircle2, XCircle, Maximize2, History, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import temiAvatar from '@/assets/temi-avatar.png';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };
type QuickAction = { label: string; msg?: string; isWhatsApp?: boolean };

interface SavedConversation {
  id: string;
  title: string;
  date: string;
  messages: Msg[];
  conversationId: string | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bardahl-assistant`;
const HIDDEN_PATHS = ['/panier', '/checkout'];
const CONSENT_KEY = 'bardahl-chat-consent';
const CONSENT_EXPIRY_HOURS = 24;
const HISTORY_KEY = 'temi-chat-history';
const MAX_CONVERSATIONS = 20;
const WIDGETS_VISIBILITY_KEY = 'floating-widgets-visible';

function getSessionId() {
  let sid = sessionStorage.getItem('bardahl-chat-session');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('bardahl-chat-session', sid);
  }
  return sid;
}

function getWidgetsVisibility(): boolean {
  const stored = localStorage.getItem(WIDGETS_VISIBILITY_KEY);
  return stored === null ? true : stored === 'true';
}

function hasConsent(): boolean {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return false;

  try {
    const { timestamp } = JSON.parse(stored);
    const now = Date.now();
    const expiryTime = CONSENT_EXPIRY_HOURS * 60 * 60 * 1000; // 24h en millisecondes

    // Vérifie si le consentement a expiré
    if (now - timestamp > expiryTime) {
      localStorage.removeItem(CONSENT_KEY);
      return false;
    }
    return true;
  } catch {
    // Si le format est invalide, on supprime et redemande
    localStorage.removeItem(CONSENT_KEY);
    return false;
  }
}

function setConsent(value: boolean) {
  if (value) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      timestamp: Date.now(),
      accepted: true
    }));
  } else {
    localStorage.removeItem(CONSENT_KEY);
  }
}

function loadHistory(): SavedConversation[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(history: SavedConversation[]) {
  const trimmed = history.slice(0, MAX_CONVERSATIONS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

async function streamChat({
  messages, conversationId, sessionId, onDelta, onDone, onConversationId,
}: {
  messages: Msg[]; conversationId: string | null; sessionId: string;
  onDelta: (t: string) => void; onDone: () => void; onConversationId: (id: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: JSON.stringify({ messages, conversationId, sessionId }),
  });
  if (!resp.ok) { const err = await resp.json().catch(() => ({ error: 'Erreur réseau' })); throw new Error(err.error || `Erreur ${resp.status}`); }
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
      } catch { buf = line + '\n' + buf; break; }
    }
  }
  onDone();
}

const WELCOME_MSG: Msg = {
  role: 'assistant',
  content: "Salut ! 👋 Je suis **Témi**, votre assistant d'Autopassion BJ.\n\nComment puis-je vous aider aujourd'hui ?",
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: '🚗 Trouver mon huile', msg: "J'aimerais trouver l'huile adaptée à mon véhicule" },
  { label: '🔧 Conseil vidange', msg: 'Quand dois-je faire ma vidange ?' },
  { label: '📦 Voir les produits', msg: 'Quels produits Bardahl avez-vous ?' },
  { label: '💬 WhatsApp', isWhatsApp: true },
];

export function BardahlChat() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [widgetsVisible, setWidgetsVisible] = useState(getWidgetsVisibility);
  const [messages, setMessages] = useState<Msg[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedConversation[]>(loadHistory);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Listen to widgets visibility changes
  useEffect(() => {
    const handleVisibilityChange = (e: CustomEvent) => {
      setWidgetsVisible(e.detail);
      if (!e.detail && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('widgetsVisibilityChange', handleVisibilityChange as EventListener);
    return () => window.removeEventListener('widgetsVisibilityChange', handleVisibilityChange as EventListener);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !hasConsent()) setShowConsent(true);
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close chat when clicking outside
  useEffect(() => {
    if (!isOpen || isMinimized || showConsent) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMinimized, showConsent]);

  // Save current conversation to history on each new message
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;
    const currentId = conversationId || 'temp-' + Date.now();
    const title = userMessages[0].content.slice(0, 50) + (userMessages[0].content.length > 50 ? '…' : '');
    setHistory(prev => {
      const updated = prev.filter(c => c.id !== currentId);
      const newConv: SavedConversation = { id: currentId, title, date: new Date().toISOString(), messages, conversationId };
      const result = [newConv, ...updated].slice(0, MAX_CONVERSATIONS);
      saveHistory(result);
      return result;
    });
  }, [messages, conversationId]);

  const send = useCallback(async (text: string) => {
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
        conversationId, sessionId: getSessionId(),
        onDelta: upsert, onDone: () => setIsLoading(false), onConversationId: setConversationId,
      });
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${e.message || "Erreur de connexion. Réessayez."}` }]);
      setIsLoading(false);
    }
  }, [messages, isLoading, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const clearChat = () => {
    setMessages([WELCOME_MSG]);
    setConversationId(null);
    sessionStorage.removeItem('bardahl-chat-session');
  };

  const restoreConversation = (conv: SavedConversation) => {
    setMessages(conv.messages);
    setConversationId(conv.conversationId);
    setShowHistory(false);
  };

  const deleteConversation = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveHistory(updated);
      return updated;
    });
  };

  const handleAcceptConsent = () => { setConsent(true); setShowConsent(false); };
  const handleRefuseConsent = () => { setIsOpen(false); setShowConsent(false); };

  const isHidden = HIDDEN_PATHS.some(p => pathname.startsWith(p));

  if (!isOpen || isHidden || !widgetsVisible) {
    if (isHidden || !widgetsVisible) return null;
    return (
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 md:right-6 z-50 h-10 px-2.5 pr-3 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 ring-1 ring-primary/20 animate-slide-in-right"
        style={{ animationDelay: '1s', animationFillMode: 'backwards' }} aria-label="Demandez à Témi">
        <img src={temiAvatar} alt="Témi" className="h-7 w-7 rounded-full object-cover" />
        <span className="text-xs font-semibold whitespace-nowrap">Parlez à Témi</span>
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-4 md:right-6 z-50 h-10 px-2 pr-3 rounded-full bg-secondary text-secondary-foreground shadow-xl hover:scale-105 transition-transform flex items-center gap-1.5">
        <img src={temiAvatar} alt="Témi" className="h-7 w-7 rounded-full object-cover" />
        <span className="text-xs font-semibold">Parlez à Témi</span>
      </button>
    );
  }

  return (
    <div ref={chatRef} className={`fixed z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isFullscreen
      ? 'inset-4 w-auto h-auto'
      : 'bottom-4 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-[380px] max-w-[calc(100vw-1rem)] h-[min(560px,calc(100vh-6rem))]'
    }`}>
      {showConsent ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 -z-10" />
          <div className="relative mb-4 animate-in zoom-in duration-700 delay-100">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <img src={temiAvatar} alt="Témi" className="h-16 w-16 rounded-full object-cover relative shadow-xl ring-4 ring-primary/10" />
          </div>
          <h2 className="text-xl font-extrabold mb-1 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-in slide-in-from-top duration-500 delay-200">Bienvenue sur AutoPassion BJ</h2>
          <p className="text-sm text-muted-foreground mb-3 animate-in fade-in duration-500 delay-300">Notre assistant intelligent peut vous aider à :</p>
          <div className="grid grid-cols-2 gap-1.5 mb-3 w-full max-w-sm text-xs animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
            {['Diagnostiquer certaines pannes', 'obtenir des conseils d\'entretien', 'comprendre les produits et additifs', 'suivre votre carnet d\'entretien'].map((feature, i) => (
              <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-2 text-left hover:bg-card/80 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary animate-pulse shrink-0" /><span className="leading-tight">{feature}</span></span>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-muted/80 to-muted/50 backdrop-blur-sm rounded-lg p-2.5 mb-4 text-xs border border-border/50 shadow-lg w-full max-w-sm animate-in fade-in duration-500 delay-800">
            <div className="flex items-center justify-center gap-1 mb-1.5"><span className="text-sm">🔒</span><span className="font-bold text-xs text-foreground">Confidentialité</span></div>
            <p className="text-muted-foreground mb-1 leading-relaxed">En continuant la discussion, vous acceptez que vos messages soient traités par notre assistant afin d'améliorer votre expérience.</p>
            <p className="font-semibold text-foreground">Merci de ne pas partager d'informations sensibles</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-sm animate-in fade-in slide-in-from-bottom duration-500 delay-1000">
            <Button onClick={handleAcceptConsent} className="w-full gap-2 h-10 text-sm font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <CheckCircle2 className="h-4 w-4 group-hover:scale-110 transition-transform" />🚗 Démarrer la conversation
            </Button>
            <Button onClick={handleRefuseConsent} variant="outline" className="w-full gap-2 h-9 text-xs hover:bg-muted/50 hover:border-primary/30 transition-all duration-300">
              <XCircle className="h-3.5 w-3.5" />Refuser
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-secondary text-secondary-foreground shrink-0">
            <div className="flex items-center gap-2">
              <img src={temiAvatar} alt="Témi" className="h-7 w-7 rounded-full object-cover" />
              <div><h3 className="text-sm font-bold leading-none">Témi</h3><span className="text-xs opacity-70">Votre assistant auto</span></div>
            </div>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={() => setShowHistory(!showHistory)} title="Historique">
                <History className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={clearChat} title="Nouvelle conversation">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Réduire" : "Plein écran"}>
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={() => setIsMinimized(true)} title="Minimiser">
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary-foreground hover:bg-white/10" onClick={() => setIsOpen(false)} title="Fermer">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* History panel */}
          {showHistory && (
            <div className="absolute inset-0 top-[52px] z-10 bg-background border-t border-border flex flex-col animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h4 className="text-sm font-bold">Historique des conversations</h4>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(false)}><X className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation sauvegardée</p>
                ) : (
                  history.map(conv => (
                    <div key={conv.id} className="px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors">
                      <p className="text-xs font-medium truncate">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(conv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {' • '}{conv.messages.filter(m => m.role === 'user').length} msg
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        <button onClick={() => restoreConversation(conv)} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                          <RotateCcw className="h-2.5 w-2.5" /> Restaurer
                        </button>
                        <button onClick={() => deleteConversation(conv.id)} className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1">
                          <Trash2 className="h-2.5 w-2.5" /> Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-1.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && <img src={temiAvatar} alt="Témi" className="h-6 w-6 rounded-full object-cover shrink-0 mb-0.5" />}
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                </div>
                {m.role === 'user' && <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mb-0.5"><User className="h-3.5 w-3.5 text-primary" /></div>}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-end gap-1.5 justify-start">
                <img src={temiAvatar} alt="Témi" className="h-6 w-6 rounded-full object-cover shrink-0 mb-0.5" />
                <div className="bg-muted rounded-xl px-3 py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} onClick={() => {
                  if (a.isWhatsApp) {
                    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '2290196526472';
                    const message = encodeURIComponent("Bonjour, j'aimerais avoir plus d'informations sur vos produits");
                    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                  } else { send(a.msg!); }
                }} className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors">
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2 border-t border-border shrink-0">
            <div className="flex gap-2 items-end">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Votre question..." disabled={isLoading} rows={1}
                className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 max-h-20" />
              <Button size="icon" className="h-9 w-9 shrink-0" disabled={isLoading || !input.trim()} onClick={() => send(input)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}