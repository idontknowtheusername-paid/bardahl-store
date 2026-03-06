import { Link } from 'react-router-dom';
import { Stethoscope, ShoppingBag } from 'lucide-react';

export function FloatingActions() {
  const whatsappNumber = '22996786284';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Bonjour, je souhaite passer une commande")}`;

  const actions = [
    {
      label: 'Diagnostic',
      icon: Stethoscope,
      href: '/diagnostic',
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
    {
      label: 'WhatsApp',
      icon: ShoppingBag,
      href: whatsappUrl,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      external: true,
    },
  ];

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-40 flex flex-col-reverse items-end gap-2" style={{ marginBottom: '4rem' }}>
      {actions.map((action) => {
        const content = (
          <>
            <action.icon className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold whitespace-nowrap hidden md:inline">{action.label}</span>
          </>
        );

        const className = `flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg transition-all duration-300 ${action.color}`;

        if (action.external) {
          return (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
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
            className={className}
            title={action.label}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
