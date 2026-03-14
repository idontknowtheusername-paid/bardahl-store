import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, MessageCircle, EyeOff, Eye } from 'lucide-react';

const HIDDEN_PATHS = ['/panier', '/checkout'];
const WIDGETS_VISIBILITY_KEY = 'floating-widgets-visible';

function getWidgetsVisibility(): boolean {
  const stored = localStorage.getItem(WIDGETS_VISIBILITY_KEY);
  return stored === null ? true : stored === 'true';
}

function setWidgetsVisibility(visible: boolean) {
  localStorage.setItem(WIDGETS_VISIBILITY_KEY, visible.toString());
  // Dispatch event pour notifier les autres composants
  window.dispatchEvent(new CustomEvent('widgetsVisibilityChange', { detail: visible }));
}

export function FloatingActions() {
  const { pathname } = useLocation();
  const [showFullText, setShowFullText] = useState(true);
  const [widgetsVisible, setWidgetsVisible] = useState(getWidgetsVisibility);

  useEffect(() => {
    // Animation en boucle toutes les 20 secondes
    const interval = setInterval(() => {
      setShowFullText(true);

      // Après 6 secondes, on réduit le texte
      setTimeout(() => {
        setShowFullText(false);
      }, 6000);
    }, 20000);

    // Premier cycle au chargement
    setTimeout(() => {
      setShowFullText(false);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const toggleWidgets = () => {
    const newVisibility = !widgetsVisible;
    setWidgetsVisible(newVisibility);
    setWidgetsVisibility(newVisibility);
  };

  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  const whatsappNumber = '2290196526472';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Bonjour, je souhaite passer une commande")}`;

  const actions = [
    {
      label: showFullText ? 'Commandez sur WhatsApp' : 'WhatsApp',
      fullLabel: 'Commandez sur WhatsApp',
      shortLabel: 'WhatsApp',
      icon: MessageCircle,
      href: whatsappUrl,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      external: true,
      isWhatsApp: true,
    },
    {
      label: 'Diagnostic moteur',
      icon: Stethoscope,
      href: '/diagnostic',
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
  ];

  return (
    <>
      {/* Toggle button - always visible at Témi's position when widgets hidden */}
      {!widgetsVisible && (
        <button
          onClick={toggleWidgets}
          className="fixed bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 h-10 px-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 border border-primary/20"
          title="Afficher les widgets"
        >
          <Eye className="h-4 w-4" />
          <span className="text-xs font-semibold whitespace-nowrap">Afficher les widgets</span>
        </button>
      )}

      {/* Widgets stack */}
      {widgetsVisible && (
        <div className="fixed bottom-6 right-4 md:right-6 z-40 flex flex-col-reverse items-end gap-2" style={{ marginBottom: '2.75rem' }}>
          {/* Action buttons */}
          {actions.map((action) => {
            const content = (
              <>
                <action.icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold whitespace-nowrap">{action.label}</span>
              </>
            );

            const className = `flex items-center gap-1.5 h-10 px-3 rounded-full shadow-lg transition-all duration-300 ${action.color} animate-in slide-in-from-right`;

            if (action.external) {
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  title={action.fullLabel || action.label}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={action.label}
                to={action.href}
                className={className}
                title={action.label}
              >
                {content}
              </Link>
            );
          })}

          {/* Toggle button - small when widgets visible - at the top */}
          <button
            onClick={toggleWidgets}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/80 hover:bg-muted shadow-md transition-all duration-300 border border-border"
            title="Masquer les widgets"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
