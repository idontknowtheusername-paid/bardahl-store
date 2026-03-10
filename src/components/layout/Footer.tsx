import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin, Mail } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function Footer() {
  const t = useTranslation();

  const { data: settings } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('public_site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const socialLinks = [
    ...(settings?.facebook_url ? [{ icon: Facebook, href: settings.facebook_url, label: 'Facebook' }] : [{ icon: Facebook, href: 'https://facebook.com/autopassionbj', label: 'Facebook' }]),
    ...(settings?.instagram_url ? [{ icon: Instagram, href: settings.instagram_url, label: 'Instagram' }] : [{ icon: Instagram, href: 'https://instagram.com/autopassionbj', label: 'Instagram' }]),
  ];

  const footerLinks = {
    produits: [
      { label: 'Huiles moteur', href: '/categories/huile-moteur' },
      { label: 'Transmission & freinage', href: '/categories/transmission' },
      { label: 'Additifs', href: '/categories/additifs' },
      { label: 'Liquides & lave-glace', href: '/categories/liquides' },
      { label: 'Accessoires & Électronique', href: '/categories/accessoires-electronique' },
      { label: 'Tous les produits', href: '/categories' },
    ],
    services: [
      { label: 'Diagnostic auto', href: '/diagnostic' },
      { label: 'Entretien véhicule', href: '/entretien' },
      { label: 'Mon espace véhicule', href: '/mon-espace' },
      { label: 'Conseils auto', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
    ],
    infos: [
      { label: 'À propos', href: '/a-propos' },
      { label: t.navContact, href: '/contact' },
      { label: t.footerDeliveryReturns, href: '/livraison-retours' },
      { label: t.footerLegalNotice, href: '/mentions-legales' },
      { label: t.footerCGV, href: '/cgv' },
      { label: t.footerPrivacy, href: '/politique-confidentialite' },
    ],
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12 md:py-16">
        {/* Logo + contact info */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-4">
            <span className="text-accent font-extrabold text-2xl tracking-tight">AUTO</span>
            <span className="text-primary font-extrabold text-2xl tracking-tight">PASSION</span>
            <span className="text-secondary-foreground/50 text-xs font-bold ml-1">BJ</span>
          </Link>
          <p className="text-secondary-foreground/60 text-sm leading-relaxed max-w-md mx-auto mb-4">
            Entretien automobile & solutions moteur. Votre partenaire de confiance pour la performance de votre véhicule au Bénin.
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-xs text-secondary-foreground/50">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 01 BP 369 Parakou</span>
            <a href={`tel:${settings?.contact_phone?.replace(/\s/g, '') || '+2290196786284'}`} className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer">
              <Phone className="h-3 w-3" /> {settings?.contact_phone || '+2290196786284'}
            </a>
            <a href={`mailto:${settings?.contact_email || 'contact@autopassionbj.com'}`} className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer">
              <Mail className="h-3 w-3" /> {settings?.contact_email || 'contact@autopassionbj.com'}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-accent">Produits</h3>
            <ul className="space-y-2.5">
              {footerLinks.produits.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-accent">Services</h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-accent">Informations</h3>
            <ul className="space-y-2.5">
              {footerLinks.infos.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-secondary-foreground/10">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center text-secondary-foreground/60 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                aria-label={label}>
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-secondary-foreground/40">
              © {new Date().getFullYear()} ETS Autopassion BJ. {t.allRightsReserved}
            </p>
            <p className="text-[10px] text-secondary-foreground/30 mt-1">
              N°RCCM RB/PKO/17 A 4167 • N°IFU: 2201501541800
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container py-3">
          <p className="text-[10px] text-secondary-foreground/30 text-center">
            Bardahl est une marque déposée appartenant à ses propriétaires respectifs. Autopassion BJ est un distributeur indépendant et n'est pas le site officiel de la marque.
          </p>
        </div>
      </div>
    </footer>
  );
}
