import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const phases = [
  {
    name: 'Phase 1 — Notoriété (Jours 1-10)',
    budget: '$1/jour × 10 jours = $10',
    objective: 'Faire connaître BARDAHL OIL au Bénin',
    audience: 'Hommes 25-55 ans, Bénin (Cotonou, Porto-Novo, Parakou, Calavi), intérêts : automobile, mécanique, entretien véhicule',
    format: 'Carrousel & Vidéo courte (15s)',
    content: [
      'Jour 1-3 : Vidéo "Pourquoi votre moteur mérite Bardahl" — teaser produit',
      'Jour 4-6 : Carrousel "3 signes que votre huile doit être changée"',
      'Jour 7-10 : Vidéo témoignage mécanicien + CTA vers le site',
    ],
    kpis: ['Portée : 5 000-15 000 personnes', 'CPM cible : < $3', 'Engagement : > 3%'],
  },
  {
    name: 'Phase 2 — Considération (Jours 11-20)',
    budget: '$1/jour × 10 jours = $10',
    objective: 'Générer du trafic qualifié vers le site e-commerce',
    audience: 'Retargeting visiteurs site + Lookalike 1% des engagés Phase 1',
    format: 'Image produit + Offre & Collection Ads',
    content: [
      'Jour 11-13 : "Trouvez l\'huile parfaite pour votre véhicule" — lien sélecteur',
      'Jour 14-16 : Promo "Livraison gratuite dès 15 000 FCFA" avec urgence',
      'Jour 17-20 : Carrousel "Nos best-sellers" avec prix et CTA achat',
    ],
    kpis: ['CTR cible : > 2%', 'CPC cible : < $0.15', 'Visites site : 200-500'],
  },
  {
    name: 'Phase 3 — Conversion (Jours 21-30)',
    budget: '$1/jour × 10 jours = $10',
    objective: 'Convertir en ventes et fidéliser',
    audience: 'Retargeting abandons panier + ajouts panier + visiteurs produit',
    format: 'Dynamic Product Ads + Stories',
    content: [
      'Jour 21-23 : "Vous avez oublié quelque chose ?" — retargeting panier',
      'Jour 24-26 : Code promo exclusif -10% Meta Ads (BARDAHL10)',
      'Jour 27-30 : "Derniers jours ! Offre spéciale fin de mois" — urgence',
    ],
    kpis: ['ROAS cible : > 3x', 'Coût par achat : < $5', 'Ventes : 6-15 commandes'],
  },
];

const calendar = [
  { days: '1-3', type: 'Vidéo teaser', objectif: 'Notoriété', budget: '$1/j' },
  { days: '4-6', type: 'Carrousel éducatif', objectif: 'Notoriété', budget: '$1/j' },
  { days: '7-10', type: 'Témoignage', objectif: 'Notoriété', budget: '$1/j' },
  { days: '11-13', type: 'Sélecteur huile', objectif: 'Trafic', budget: '$1/j' },
  { days: '14-16', type: 'Promo livraison', objectif: 'Trafic', budget: '$1/j' },
  { days: '17-20', type: 'Best-sellers', objectif: 'Trafic', budget: '$1/j' },
  { days: '21-23', type: 'Retargeting panier', objectif: 'Conversion', budget: '$1/j' },
  { days: '24-26', type: 'Code promo', objectif: 'Conversion', budget: '$1/j' },
  { days: '27-30', type: 'Urgence fin mois', objectif: 'Conversion', budget: '$1/j' },
];

export default function MarketingPlan() {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 20;

    const addPage = () => { doc.addPage(); y = 20; };
    const checkPage = (need: number) => { if (y + need > 275) addPage(); };

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 33, 33);
    doc.text('BARDAHL OIL', margin, y);
    y += 8;
    doc.setFontSize(16);
    doc.setTextColor(180, 160, 0);
    doc.text('Plan Marketing Meta Ads — 30 Jours', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Budget total : $30 ($1/jour) | Marché : Bénin & Afrique de l\'Ouest', margin, y);
    y += 12;

    // Summary box
    doc.setFillColor(255, 248, 220);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 33, 33);
    doc.text('Résumé Exécutif', margin + 5, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Stratégie en 3 phases (Notoriété → Considération → Conversion) pour maximiser', margin + 5, y + 14);
    doc.text('le ROI avec un micro-budget. Objectif : 6-15 ventes, ROAS > 3x, base email +200.', margin + 5, y + 20);
    y += 35;

    // Phases
    phases.forEach((phase) => {
      checkPage(80);
      // Phase header
      doc.setFillColor(33, 33, 33);
      doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 208, 0);
      doc.text(phase.name, margin + 4, y + 5.5);
      y += 12;

      doc.setTextColor(33, 33, 33);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Budget : ', margin, y); doc.setFont('helvetica', 'normal'); doc.text(phase.budget, margin + 18, y); y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Objectif : ', margin, y); doc.setFont('helvetica', 'normal'); doc.text(phase.objective, margin + 20, y); y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Audience : ', margin, y); doc.setFont('helvetica', 'normal');
      const audienceLines = doc.splitTextToSize(phase.audience, contentW - 22);
      doc.text(audienceLines, margin + 22, y); y += audienceLines.length * 4 + 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Format : ', margin, y); doc.setFont('helvetica', 'normal'); doc.text(phase.format, margin + 18, y); y += 7;

      // Content
      doc.setFont('helvetica', 'bold');
      doc.text('Contenu :', margin, y); y += 5;
      doc.setFont('helvetica', 'normal');
      phase.content.forEach(c => {
        checkPage(6);
        doc.text('• ' + c, margin + 4, y); y += 5;
      });
      y += 3;

      // KPIs
      doc.setFont('helvetica', 'bold');
      doc.text('KPIs cibles :', margin, y); y += 5;
      doc.setFont('helvetica', 'normal');
      phase.kpis.forEach(k => {
        checkPage(6);
        doc.text('✓ ' + k, margin + 4, y); y += 5;
      });
      y += 8;
    });

    // Calendar
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 33, 33);
    doc.text('Calendrier Éditorial', margin, y); y += 8;

    // Table header
    doc.setFillColor(33, 33, 33);
    doc.rect(margin, y, contentW, 7, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Jours', margin + 3, y + 5);
    doc.text('Type de contenu', margin + 30, y + 5);
    doc.text('Objectif', margin + 100, y + 5);
    doc.text('Budget', margin + 145, y + 5);
    y += 7;

    doc.setTextColor(33, 33, 33);
    calendar.forEach((row, i) => {
      checkPage(7);
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, y, contentW, 6, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.text(row.days, margin + 3, y + 4.5);
      doc.text(row.type, margin + 30, y + 4.5);
      doc.text(row.objectif, margin + 100, y + 4.5);
      doc.text(row.budget, margin + 145, y + 4.5);
      y += 6;
    });
    y += 10;

    // Tips
    checkPage(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Conseils d\'Optimisation', margin, y); y += 8;

    const tips = [
      'Tester 2-3 variantes de créatifs par phase (A/B testing)',
      'Couper les ads avec CTR < 1% après 48h et réallouer le budget',
      'Utiliser les Reels/Stories pour un meilleur CPM en Afrique de l\'Ouest',
      'Installer le Pixel Meta sur le site pour le tracking des conversions',
      'Créer une audience personnalisée "Acheteurs" pour le lookalike',
      'Poster du contenu organique en parallèle (3x/semaine minimum)',
      'Répondre aux commentaires dans l\'heure pour booster l\'engagement',
    ];
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    tips.forEach(tip => {
      checkPage(6);
      doc.text('→ ' + tip, margin + 2, y); y += 5.5;
    });
    y += 10;

    // Footer
    checkPage(15);
    doc.setFillColor(255, 248, 220);
    doc.roundedRect(margin, y, contentW, 12, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 80, 0);
    doc.text('BARDAHL OIL — Plan Marketing Meta Ads | Budget: $30 | Durée: 30 jours', margin + 5, y + 7.5);

    doc.save('BARDAHL_OIL_Marketing_Plan_Meta_Ads.pdf');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
          </Link>
          <Button onClick={generatePDF} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" /> Télécharger PDF
          </Button>
        </div>

        <div ref={contentRef}>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">BARDAHL OIL</h1>
            <p className="text-xl font-semibold text-primary">Plan Marketing Meta Ads — 30 Jours</p>
            <p className="text-muted-foreground mt-2">Budget total : $30 ($1/jour) | Marché : Bénin & Afrique de l'Ouest</p>
          </div>

          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-lg text-foreground mb-2">Résumé Exécutif</h2>
            <p className="text-muted-foreground text-sm">
              Stratégie en 3 phases (Notoriété → Considération → Conversion) pour maximiser le ROI avec un micro-budget de $1/jour. 
              Objectif : 6-15 ventes, ROAS {">"} 3x, base email +200 contacts.
            </p>
          </Card>

          {phases.map((phase, idx) => (
            <Card key={idx} className="p-6 mb-6">
              <h2 className="font-bold text-lg text-primary-foreground bg-secondary text-secondary-foreground px-4 py-2 rounded-md mb-4">
                {phase.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div><span className="font-semibold">Budget :</span> {phase.budget}</div>
                <div><span className="font-semibold">Format :</span> {phase.format}</div>
                <div className="md:col-span-2"><span className="font-semibold">Objectif :</span> {phase.objective}</div>
                <div className="md:col-span-2"><span className="font-semibold">Audience :</span> {phase.audience}</div>
              </div>
              <h3 className="font-semibold text-sm mb-2">Contenu :</h3>
              <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1 mb-4">
                {phase.content.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
              <h3 className="font-semibold text-sm mb-2">KPIs cibles :</h3>
              <div className="flex flex-wrap gap-2">
                {phase.kpis.map((k, i) => (
                  <span key={i} className="bg-primary/10 text-primary-foreground text-xs font-medium px-3 py-1 rounded-full border border-primary/20">
                    ✓ {k}
                  </span>
                ))}
              </div>
            </Card>
          ))}

          <Card className="p-6 mb-6">
            <h2 className="font-bold text-lg text-foreground mb-4">Calendrier Éditorial</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary text-secondary-foreground">
                    <th className="px-3 py-2 text-left rounded-tl-md">Jours</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Objectif</th>
                    <th className="px-3 py-2 text-left rounded-tr-md">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {calendar.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="px-3 py-2 font-medium">{row.days}</td>
                      <td className="px-3 py-2">{row.type}</td>
                      <td className="px-3 py-2">{row.objectif}</td>
                      <td className="px-3 py-2">{row.budget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-lg text-foreground mb-4">Conseils d'Optimisation</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>→ Tester 2-3 variantes de créatifs par phase (A/B testing)</li>
              <li>→ Couper les ads avec CTR {"<"} 1% après 48h et réallouer le budget</li>
              <li>→ Utiliser les Reels/Stories pour un meilleur CPM en Afrique de l'Ouest</li>
              <li>→ Installer le Pixel Meta sur le site pour le tracking des conversions</li>
              <li>→ Créer une audience personnalisée "Acheteurs" pour le lookalike</li>
              <li>→ Poster du contenu organique en parallèle (3x/semaine minimum)</li>
              <li>→ Répondre aux commentaires dans l'heure pour booster l'engagement</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
