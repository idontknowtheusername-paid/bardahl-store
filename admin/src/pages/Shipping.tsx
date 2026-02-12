import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/lib/types';

type ShippingZone = Tables<'shipping_zones'>;
type ShippingRate = Tables<'shipping_rates'>;

export default function Shipping() {
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as ShippingZone[];
    },
  });

  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ['shipping-rates', selectedZone?.id],
    queryFn: async () => {
      if (!selectedZone) return [];
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('shipping_zone_id', selectedZone.id)
        .order('price');
      if (error) throw error;
      return data as ShippingRate[];
    },
    enabled: !!selectedZone,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Livraison</h1>
        <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle zone de livraison</DialogTitle>
            </DialogHeader>
            <ZoneForm onSuccess={() => setZoneDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Zones */}
        <Card>
          <CardHeader>
            <CardTitle>Zones de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            {zonesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : !zones?.length ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune zone de livraison</p>
              </div>
            ) : (
              <div className="space-y-2">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedZone?.id === zone.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                      }`}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{zone.name}</h3>
                          {!zone.is_active && (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </div>
                        {zone.countries && zone.countries.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {zone.countries.join(', ')}
                          </p>
                        )}
                        {zone.cities && zone.cities.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {zone.cities.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedZone ? `Tarifs - ${selectedZone.name}` : 'Tarifs'}
              </CardTitle>
              {selectedZone && (
                <Dialog open={rateDialogOpen} onOpenChange={(o) => {
                  setRateDialogOpen(o);
                  if (!o) setEditingRate(null);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingRate ? 'Modifier le tarif' : 'Nouveau tarif'}
                      </DialogTitle>
                    </DialogHeader>
                    <RateForm
                      zoneId={selectedZone.id}
                      rate={editingRate}
                      onSuccess={() => {
                        setRateDialogOpen(false);
                        setEditingRate(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedZone ? (
              <p className="text-center text-muted-foreground py-8">
                Sélectionnez une zone
              </p>
            ) : ratesLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : !rates?.length ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun tarif</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rates.map((rate) => (
                  <div
                    key={rate.id}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rate.name}</h4>
                          {!rate.is_active && (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </div>
                        {rate.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {rate.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium">{rate.price} FCFA</span>
                          {rate.delivery_time && (
                            <span className="text-muted-foreground">
                              {rate.delivery_time}
                            </span>
                          )}
                        </div>
                        {rate.free_shipping_threshold && (
                          <p className="text-xs text-green-600 mt-1">
                            Gratuit à partir de {rate.free_shipping_threshold} FCFA
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingRate(rate);
                          setRateDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ZoneForm({ zone, onSuccess }: { zone?: ShippingZone; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    countries: zone?.countries?.join(', ') || '',
    cities: zone?.cities?.join(', ') || '',
    is_active: zone?.is_active ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        countries: data.countries ? data.countries.split(',').map(s => s.trim()).filter(Boolean) : null,
        cities: data.cities ? data.cities.split(',').map(s => s.trim()).filter(Boolean) : null,
        is_active: data.is_active,
      };

      if (zone) {
        const { error } = await supabase
          .from('shipping_zones')
          .update(payload)
          .eq('id', zone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shipping_zones')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast.success(zone ? 'Zone modifiée' : 'Zone créée');
      onSuccess();
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="countries">Pays (séparés par virgule)</Label>
        <Input
          id="countries"
          value={formData.countries}
          onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
          placeholder="Maroc, France, Belgique"
        />
      </div>

      <div>
        <Label htmlFor="cities">Villes (séparées par virgule)</Label>
        <Textarea
          id="cities"
          value={formData.cities}
          onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
          placeholder="Casablanca, Rabat, Marrakech"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}

function RateForm({ zoneId, rate, onSuccess }: { zoneId: string; rate?: ShippingRate | null; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: rate?.name || '',
    description: rate?.description || '',
    price: rate?.price || 0,
    delivery_time: rate?.delivery_time || '',
    min_order_amount: rate?.min_order_amount || null,
    free_shipping_threshold: rate?.free_shipping_threshold || null,
    is_active: rate?.is_active ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (rate) {
        const { error } = await supabase
          .from('shipping_rates')
          .update(data)
          .eq('id', rate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shipping_rates')
          .insert({ ...data, shipping_zone_id: zoneId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      toast.success(rate ? 'Tarif modifié' : 'Tarif créé');
      onSuccess();
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Livraison standard"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Prix (FCFA) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label htmlFor="delivery_time">Délai de livraison</Label>
          <Input
            id="delivery_time"
            value={formData.delivery_time}
            onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
            placeholder="2-3 jours"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min_order_amount">Montant min. (FCFA)</Label>
          <Input
            id="min_order_amount"
            type="number"
            step="0.01"
            value={formData.min_order_amount || ''}
            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>

        <div>
          <Label htmlFor="free_shipping_threshold">Gratuit à partir de (FCFA)</Label>
          <Input
            id="free_shipping_threshold"
            type="number"
            step="0.01"
            value={formData.free_shipping_threshold || ''}
            onChange={(e) => setFormData({ ...formData, free_shipping_threshold: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Actif</Label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
