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
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        {/* Logo centré en haut */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-4">
            <img src="/Bardahl_idiSpcDptj_1.svg" alt="Bardahl" className="h-16 w-auto mx-auto" />
          </Link>
          <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-2xl mx-auto">
            {t.footerDescription}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-secondary">{t.footerProducts}</h3>
            <ul className="space-y-2.5">
              {footerLinks.produits.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-secondary">{t.footerInfo}</h3>
            <ul className="space-y-2.5">
              {footerLinks.informations.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-secondary">{t.footerLegal}</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-primary-foreground/20">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                aria-label={label}>
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} Bardahl. {t.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
