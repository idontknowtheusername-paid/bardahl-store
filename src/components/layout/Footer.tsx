import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
  boutique: [
    { label: 'Soutiens-gorge', href: '/collections/soutiens-gorge' },
    { label: 'Culottes', href: '/collections/culottes' },
    { label: 'Ensembles', href: '/collections/ensembles' },
    { label: 'Nuisettes', href: '/collections/nuisettes' },
    { label: 'Pyjamas', href: '/collections/pyjamas' },
    { label: 'Accessoires', href: '/collections/accessoires' },
  ],
  informations: [
    { label: 'À propos', href: '/a-propos' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Livraison & Retours', href: '/livraison-retours' },
    { label: 'Guide des tailles', href: '/guide-tailles' },
  ],
  legal: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'CGV', href: '/cgv' },
    { label: 'Confidentialité', href: '/politique-confidentialite' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-10 md:py-12">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-2xl font-medium">
            Cannesh <span className="text-rose">Lingerie</span>
          </Link>
          <p className="mt-3 text-background/70 text-sm max-w-md mx-auto">
            Lingerie de qualité premium pour sublimer votre féminité au quotidien.
          </p>
        </div>

        {/* Links Grid - 3 columns on mobile */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
          {/* Boutique */}
          <div>
            <h3 className="font-serif text-sm md:text-base font-medium mb-3">Boutique</h3>
            <ul className="space-y-2">
              {footerLinks.boutique.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm text-background/70 hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="font-serif text-sm md:text-base font-medium mb-3">Infos</h3>
            <ul className="space-y-2">
              {footerLinks.informations.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm text-background/70 hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif text-sm md:text-base font-medium mb-3">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm text-background/70 hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center mb-6">
          <p className="text-sm text-background/70 mb-3">Suivez-nous</p>
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/70 hover:bg-rose hover:text-white transition-all duration-300"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-background/10">
          <p className="text-xs text-background/50">
            © 2025 Cannesh Lingerie. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
