import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Save, Globe, Mail, Phone, DollarSign, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { languages, type Language } from '@/i18n';
import type { Tables } from '@/lib/types';

type SiteSettings = Tables<'site_settings'>;

export default function Settings() {
  const queryClient = useQueryClient();
  const { language, setLanguage, t } = useLanguage();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SiteSettings | null;
    },
  });

  const [formData, setFormData] = useState<Partial<SiteSettings>>({});

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('site_settings')
          .update(data)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success(t.settings.settingsSaved);
    },
    onError: () => {
      toast.error(t.settings.settingsError);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    toast.success(t.settings.languageChanged);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? t.common.loading : t.common.save}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t.settings.language}
            </CardTitle>
            <CardDescription>
              {t.settings.selectLanguage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Select value={language} onValueChange={(value) => handleLanguageChange(value as Language)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t.settings.general}
            </CardTitle>
            <CardDescription>
              {t.settings.siteName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site_name">{t.settings.siteName}</Label>
              <Input
                id="site_name"
                value={formData.site_name || ''}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                placeholder="Cannesh Lingerie"
              />
            </div>

            <div>
              <Label htmlFor="site_description">{t.settings.siteDescription}</Label>
              <Textarea
                id="site_description"
                value={formData.site_description || ''}
                onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                placeholder="Lingerie de luxe..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="announcement_bar">{t.settings.announcementBar}</Label>
              <Input
                id="announcement_bar"
                value={formData.announcement_bar || ''}
                onChange={(e) => setFormData({ ...formData, announcement_bar: e.target.value })}
                placeholder="Livraison gratuite à partir de 500 FCFA"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="maintenance_mode"
                checked={formData.maintenance_mode || false}
                onCheckedChange={(checked) => setFormData({ ...formData, maintenance_mode: checked })}
              />
              <Label htmlFor="maintenance_mode">{t.settings.maintenanceMode}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t.settings.contact}
            </CardTitle>
            <CardDescription>
              Coordonnées et notifications administrateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin_email">Email administrateur (notifications commandes)</Label>
              <Input
                id="admin_email"
                type="email"
                value={(formData as any).admin_email || ''}
                onChange={(e) => setFormData({ ...formData, admin_email: e.target.value } as any)}
                placeholder="admin@bardahl.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Reçoit les alertes de nouvelles commandes</p>
            </div>

            <div>
              <Label htmlFor="contact_email">{t.settings.contactEmail}</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@bardahl.com"
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">{t.settings.contactPhone}</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+229 XX XX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_number">{t.settings.whatsapp}</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="+229 XX XX XX XX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Commerce Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t.settings.commerce}
            </CardTitle>
            <CardDescription>
              {t.settings.currency}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">{t.settings.currency}</Label>
              <Input
                id="currency"
                value={formData.currency || ''}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="FCFA"
              />
            </div>

            <div>
              <Label htmlFor="minimum_order_amount">{t.settings.minimumOrderAmount}</Label>
              <Input
                id="minimum_order_amount"
                type="number"
                step="0.01"
                value={formData.minimum_order_amount || ''}
                onChange={(e) => setFormData({ ...formData, minimum_order_amount: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              {t.settings.socialMedia}
            </CardTitle>
            <CardDescription>
              {t.settings.facebook}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook_url">{t.settings.facebook}</Label>
              <Input
                id="facebook_url"
                type="url"
                value={formData.facebook_url || ''}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <Label htmlFor="instagram_url">{t.settings.instagram}</Label>
              <Input
                id="instagram_url"
                type="url"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <Label htmlFor="tiktok_url">{t.settings.tiktok}</Label>
              <Input
                id="tiktok_url"
                type="url"
                value={formData.tiktok_url || ''}
                onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/@..."
              />
            </div>

            <div>
              <Label htmlFor="twitter_url">{t.settings.twitter}</Label>
              <Input
                id="twitter_url"
                type="url"
                value={formData.twitter_url || ''}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://twitter.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? t.common.loading : t.common.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
