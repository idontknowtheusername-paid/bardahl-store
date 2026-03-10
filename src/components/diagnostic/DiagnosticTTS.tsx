import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Pause, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagnosticTTSProps {
  text: string;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/[•\-]\s/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, '. ')
    .trim();
}

export default function DiagnosticTTS({ text }: DiagnosticTTSProps) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setStatus('idle');
  }, []);

  useEffect(() => () => { speechSynthesis.cancel(); }, []);

  const play = useCallback(() => {
    if (status === 'paused') {
      speechSynthesis.resume();
      setStatus('playing');
      return;
    }

    stop();
    const plainText = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Try to find a French female voice
    const voices = speechSynthesis.getVoices();
    const frFemale = voices.find(v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('fr') && /amelie|thomas|marie|celine|lea/i.test(v.name))
      || voices.find(v => v.lang.startsWith('fr'));
    if (frFemale) utterance.voice = frFemale;

    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('idle');
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    setStatus('playing');
  }, [text, status, stop]);

  const pause = useCallback(() => {
    speechSynthesis.pause();
    setStatus('paused');
  }, []);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
      {status === 'idle' && (
        <Button size="sm" variant="outline" onClick={play} className="gap-2">
          <Volume2 className="h-4 w-4" /> 🔊 Écouter le diagnostic
        </Button>
      )}
      {status === 'playing' && (
        <>
          <Button size="sm" variant="outline" onClick={pause} className="gap-2">
            <Pause className="h-4 w-4" /> Pause
          </Button>
          <Button size="sm" variant="ghost" onClick={stop} className="gap-2">
            <Square className="h-4 w-4" /> Stop
          </Button>
          <span className="text-xs text-primary font-medium animate-pulse">🔊 Lecture en cours...</span>
        </>
      )}
      {status === 'paused' && (
        <>
          <Button size="sm" variant="outline" onClick={play} className="gap-2">
            <Play className="h-4 w-4" /> Reprendre
          </Button>
          <Button size="sm" variant="ghost" onClick={stop} className="gap-2">
            <Square className="h-4 w-4" /> Stop
          </Button>
          <span className="text-xs text-muted-foreground">⏸ En pause</span>
        </>
      )}
    </div>
  );
}
