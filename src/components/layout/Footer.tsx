import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';

const footerLinks = {
  produits: [
    { label: 'Huiles Moteur', href: '/collections/huiles-moteur' },
    { label: 'Additifs', href: '/collections/additifs' },
    { label: 'Entretien', href: '/collections/entretien' },
    { label: 'Tous les produits', href: '/collections' },
  ],
  informations: [
    { label: 'À propos de Bardahl', href: '/a-propos' },
    { label: 'Nos technologies', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Livraison & Retours', href: '/livraison-retours' },
  ],
  legal: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'CGV', href: '/cgv' },
    { label: 'Confidentialité', href: '/politique-confidentialite' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/bardahl', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/bardahl', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/bardahl', label: 'YouTube' },
  { icon: Linkedin, href: 'https://linkedin.com/company/bardahl', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12 md:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-primary font-extrabold text-2xl tracking-tight">BARDAHL</span>
            </Link>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed">
              Depuis 1939, la technologie Polar Plus et le Fullerène C60 au service de la performance de votre moteur.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary">Produits</h3>
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

          {/* Informations */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary">Infos</h3>
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

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary">Légal</h3>
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

        {/* Social */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-secondary-foreground/10">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center text-secondary-foreground/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-xs text-secondary-foreground/40">
            © {new Date().getFullYear()} Bardahl. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
