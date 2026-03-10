import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { languages } from '@/i18n';

interface Banner {
  text: string;
  startDate?: { month: number; day: number };
  endDate?: { month: number; day: number };
  type: 'seasonal' | 'permanent' | 'special';
}

const banners: Banner[] = [
  // JANVIER
  { text: "🎊 Bonne année ! Démarrez 2026 avec un moteur en pleine forme", startDate: { month: 1, day: 1 }, endDate: { month: 1, day: 15 }, type: 'seasonal' },
  { text: "✨ Nouvelle année : Vidange complète à prix réduit", startDate: { month: 1, day: 1 }, endDate: { month: 1, day: 31 }, type: 'seasonal' },
  { text: "🎯 Résolution 2026 : Prenez soin de votre véhicule", startDate: { month: 1, day: 1 }, endDate: { month: 1, day: 31 }, type: 'seasonal' },
  
  // FÉVRIER-MARS
  { text: "📚 Rentrée scolaire : Préparez votre véhicule maintenant", startDate: { month: 2, day: 1 }, endDate: { month: 3, day: 15 }, type: 'seasonal' },
  { text: "🎭 Carnaval approche ! Vérifiez votre véhicule", startDate: { month: 2, day: 15 }, endDate: { month: 3, day: 10 }, type: 'seasonal' },
  { text: "🚗 Préparez votre voiture pour la saison des voyages", startDate: { month: 2, day: 1 }, endDate: { month: 3, day: 31 }, type: 'seasonal' },
  
  // AVRIL (Pâques)
  { text: "🐣 Joyeuses Pâques ! Offres spéciales entretien", startDate: { month: 4, day: 1 }, endDate: { month: 4, day: 25 }, type: 'seasonal' },
  { text: "✝️ Week-end de Pâques : Préparez votre véhicule", startDate: { month: 4, day: 10 }, endDate: { month: 4, day: 22 }, type: 'seasonal' },
  { text: "🌸 Pâques : -15% sur tous les packs entretien", startDate: { month: 4, day: 1 }, endDate: { month: 4, day: 30 }, type: 'seasonal' },
  
  // MAI (Fête du Travail)
  { text: "💼 1er Mai : Votre véhicule mérite un repos", startDate: { month: 5, day: 1 }, endDate: { month: 5, day: 5 }, type: 'special' },
  { text: "⚙️ Fête du Travail : Offrez un entretien complet", startDate: { month: 5, day: 1 }, endDate: { month: 5, day: 10 }, type: 'seasonal' },
  { text: "🔧 Profitez du pont pour une révision complète", startDate: { month: 5, day: 1 }, endDate: { month: 5, day: 31 }, type: 'seasonal' },
  
  // JUIN (Vacances)
  { text: "🏖️ Vacances approchent ! Diagnostic gratuit", startDate: { month: 6, day: 1 }, endDate: { month: 6, day: 30 }, type: 'seasonal' },
  { text: "☀️ Grandes vacances : Préparez vos longs trajets", startDate: { month: 6, day: 15 }, endDate: { month: 7, day: 15 }, type: 'seasonal' },
  { text: "🚙 Départ en vacances ? Vérification offerte", startDate: { month: 6, day: 1 }, endDate: { month: 6, day: 30 }, type: 'seasonal' },
  
  // JUILLET-AOÛT (Retours/Vacances)
  { text: "✈️ Retours au pays : Entretenez votre véhicule", startDate: { month: 7, day: 1 }, endDate: { month: 8, day: 31 }, type: 'seasonal' },
  { text: "🌍 Saison des retours : Votre voiture au top", startDate: { month: 7, day: 15 }, endDate: { month: 8, day: 20 }, type: 'seasonal' },
  { text: "🎉 Accueillez vos proches avec un véhicule impeccable", startDate: { month: 7, day: 1 }, endDate: { month: 8, day: 31 }, type: 'seasonal' },
  
  // AOÛT (Fête Nationale)
  { text: "🇧🇯 Fête Nationale : Célébrez avec style", startDate: { month: 8, day: 1 }, endDate: { month: 8, day: 5 }, type: 'special' },
  { text: "🎖️ Indépendance du Bénin : Offres patriotiques", startDate: { month: 7, day: 25 }, endDate: { month: 8, day: 5 }, type: 'special' },
  
  // SEPTEMBRE (Rentrée)
  { text: "🎒 C'est la rentrée ! Révision complète", startDate: { month: 9, day: 1 }, endDate: { month: 9, day: 30 }, type: 'seasonal' },
  { text: "📖 Rentrée : Sécurité des enfants sur la route", startDate: { month: 9, day: 1 }, endDate: { month: 9, day: 20 }, type: 'seasonal' },
  { text: "🚸 Trajets école : Vérifiez freins et pneus", startDate: { month: 9, day: 1 }, endDate: { month: 9, day: 30 }, type: 'seasonal' },
  
  // OCTOBRE
  { text: "🌤️ Fin des pluies : Protection anti-corrosion", startDate: { month: 10, day: 1 }, endDate: { month: 10, day: 31 }, type: 'seasonal' },
  { text: "🛡️ Après les pluies : Protégez votre moteur", startDate: { month: 10, day: 1 }, endDate: { month: 10, day: 31 }, type: 'seasonal' },
  { text: "💧 Post-pluies : Diagnostic complet offert", startDate: { month: 10, day: 1 }, endDate: { month: 10, day: 31 }, type: 'seasonal' },
  
  // NOVEMBRE (Black Friday)
  { text: "🎄 Fêtes approchent : Préparez votre véhicule", startDate: { month: 11, day: 1 }, endDate: { month: 11, day: 30 }, type: 'seasonal' },
  { text: "🎁 Black Friday Auto : Jusqu'à -25%", startDate: { month: 11, day: 20 }, endDate: { month: 11, day: 30 }, type: 'seasonal' },
  { text: "🛍️ Novembre : Profitez des offres avant fêtes", startDate: { month: 11, day: 1 }, endDate: { month: 11, day: 30 }, type: 'seasonal' },
  
  // DÉCEMBRE (Noël)
  { text: "🎅 Joyeux Noël ! Offrez un bon d'entretien", startDate: { month: 12, day: 1 }, endDate: { month: 12, day: 25 }, type: 'seasonal' },
  { text: "🎄 Fêtes de fin d'année : Livraison express", startDate: { month: 12, day: 1 }, endDate: { month: 12, day: 31 }, type: 'seasonal' },
  { text: "🎊 Fin 2026 : Révisez avant 2027", startDate: { month: 12, day: 15 }, endDate: { month: 12, day: 31 }, type: 'seasonal' },
  { text: "✨ Réveillon : Voyagez en toute sécurité", startDate: { month: 12, day: 20 }, endDate: { month: 12, day: 31 }, type: 'seasonal' },
  
  // PERMANENTES (toujours actives)
  { text: "🚚 Livraison Parakou 2h - Bénin 24h", type: 'permanent' },
  { text: "💬 Besoin de conseil ? WhatsApp disponible", type: 'permanent' },
  { text: "🎯 Diagnostic rapide gratuit en 1 minute", type: 'permanent' },
  { text: "⭐ +1000 clients satisfaits | Produits authentiques", type: 'permanent' },
  { text: "🔥 Consultez nos offres spéciales du moment", type: 'permanent' },
];

export function SeasonalBanner() {
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeBanners, setActiveBanners] = useState<Banner[]>([]);

  const currentLang = languages.find(l => l.code === language);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const filtered = banners.filter(banner => {
      if (banner.type === 'permanent') return true;
      
      if (banner.startDate && banner.endDate) {
        const start = banner.startDate.month * 100 + banner.startDate.day;
        const end = banner.endDate.month * 100 + banner.endDate.day;
        const current = currentMonth * 100 + currentDay;
        
        return current >= start && current <= end;
      }
      
      return false;
    });

    setActiveBanners(filtered.length > 0 ? filtered : banners.filter(b => b.type === 'permanent'));
  }, []);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners]);

  if (activeBanners.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex items-center justify-between sm:justify-center py-2 text-sm relative">
          <div className="flex items-center gap-2 font-semibold animate-fade-in">
            <span>{activeBanners[currentBannerIndex]?.text}</span>
          </div>

          <div className="sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-white gap-1 text-xs h-6 px-2 font-medium"
                onClick={() => setShowLangMenu(!showLangMenu)}
              >
                <span className="text-base">{currentLang?.flag}</span>
                <span className="hidden sm:inline">{currentLang?.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>

              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[180px]">
                    <p className="text-xs font-bold text-foreground px-2 py-1 uppercase tracking-wider">
                      <Globe className="h-3 w-3 inline mr-1" />
                      Language
                    </p>
                    {languages.filter(l => l.code === 'fr' || l.code === 'en').map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-muted flex items-center gap-2 ${language === lang.code ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                    <div className="border-t border-border my-2" />
                    <p className="text-xs font-bold text-foreground px-2 py-1 uppercase tracking-wider">
                      Devise
                    </p>
                    {(['EUR', 'FCFA'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => { setCurrency(c); setShowLangMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-muted ${currency === c ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}`}
                      >
                        {c === 'EUR' ? '€ Euro' : 'FCFA Franc CFA'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
