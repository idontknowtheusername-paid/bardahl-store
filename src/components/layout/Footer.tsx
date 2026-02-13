import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/bardahl', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/bardahl', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/bardahl', label: 'YouTube' },
  { icon: Linkedin, href: 'https://linkedin.com/company/bardahl', label: 'LinkedIn' },
];

export function Footer() {
  const t = useTranslation();

  const footerLinks = {
    produits: [
      { label: t.navMotorOils, href: '/collections/huiles-moteur' },
      { label: t.navAdditives, href: '/collections/additifs' },
      { label: t.navMaintenance, href: '/collections/entretien' },
      { label: t.navAllProducts, href: '/collections' },
    ],
    informations: [
      { label: t.footerAbout, href: '/a-propos' },
      { label: t.footerTechnologies, href: '/blog' },
      { label: t.navContact, href: '/contact' },
      { label: t.footerDeliveryReturns, href: '/livraison-retours' },
      { label: t.footerFAQ, href: '/faq' },
    ],
    legal: [
      { label: t.footerLegalNotice, href: '/mentions-legales' },
      { label: t.footerCGV, href: '/cgv' },
      { label: t.footerPrivacy, href: '/politique-confidentialite' },
    ],
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-primary font-extrabold text-2xl tracking-tight">BARDAHL</span>
            </Link>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed">
              {t.footerDescription}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary">{t.footerProducts}</h3>
            <ul className="space-y-2.5">
              {footerLinks.produits.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary">{t.footerInfo}</h3>
            <ul className="space-y-2.5">
              {footerLinks.informations.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary">{t.footerLegal}</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
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
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center text-secondary-foreground/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label={label}>
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-xs text-secondary-foreground/40">
            © {new Date().getFullYear()} Bardahl. {t.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
