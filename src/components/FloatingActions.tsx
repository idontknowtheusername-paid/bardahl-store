import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MessageCircle, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingActions() {
  const [isExpanded, setIsExpanded] = useState(false);

  const whatsappNumber = '22996786284';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Bonjour, je souhaite passer une commande")}`;

  const actions = [
    {
      label: 'Diagnostiquer ma voiture',
      icon: Stethoscope,
      href: '/diagnostic',
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
    {
      label: 'Commander sur WhatsApp',
      icon: ShoppingBag,
      href: whatsappUrl,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      external: true,
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
      {/* Toggle button - mobile only */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden h-10 w-10 rounded-full bg-accent text-accent-foreground shadow-lg"
        size="icon"
      >
        {isExpanded ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
      </Button>

      {/* Action buttons */}
      <div className={`flex flex-col gap-2 ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
        {actions.map((action) => {
          const content = (
            <>
              <action.icon className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold whitespace-nowrap hidden xl:inline">{action.label}</span>
            </>
          );

          if (action.external) {
            return (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg transition-all duration-300 ${action.color}`}
                title={action.label}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={action.label}
              to={action.href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg transition-all duration-300 ${action.color}`}
              title={action.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}