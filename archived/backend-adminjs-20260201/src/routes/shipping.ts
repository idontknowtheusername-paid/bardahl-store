import { Router } from 'express';
import { prisma } from '../server.js';

export const shippingRoutes = Router();

// Benin cities configuration
const BENIN_CITIES = [
  'Cotonou',
  'Porto-Novo',
  'Parakou',
  'Abomey-Calavi',
  'Djougou',
  'Bohicon',
  'Natitingou',
  'Lokossa',
  'Ouidah',
  'Kandi',
];

// Get shipping rates for a city
shippingRoutes.get('/rates', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required',
      });
    }

    // Find zone that includes this city
    const zone = await prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        cities: { has: city as string },
      },
      include: {
        rates: {
          where: { isActive: true },
        },
      },
    });

    // If no zone found, use default rates
    if (!zone) {
      const defaultRates = getDefaultRates(city as string);
      return res.json({
        success: true,
        city,
        rates: defaultRates,
      });
    }

    const rates = zone.rates.map(rate => ({
      method: rate.method.toLowerCase(),
      price: rate.price,
      estimatedDays: rate.estimatedDays,
      label: getMethodLabel(rate.method),
    }));

    res.json({
      success: true,
      city,
      zone: zone.name,
      rates,
    });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shipping rates' });
  }
});

// Calculate shipping cost
shippingRoutes.post('/calculate', async (req, res) => {
  try {
    const { city, method = 'standard', items } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required',
      });
    }

    // Find zone and rate
    const zone = await prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        cities: { has: city },
      },
      include: {
        rates: {
          where: {
            isActive: true,
            method: method.toUpperCase(),
          },
        },
      },
    });

    let shippingCost: number;
    let estimatedDays: string;

    if (zone && zone.rates.length > 0) {
      shippingCost = zone.rates[0].price;
      estimatedDays = zone.rates[0].estimatedDays || getDefaultEstimate(method);
    } else {
      // Default rates
      const defaultRates = getDefaultRates(city);
      const rate = defaultRates.find(r => r.method === method.toLowerCase());
      shippingCost = rate?.price || 2000;
      estimatedDays = rate?.estimatedDays || '3-5 jours';
    }

    res.json({
      success: true,
      city,
      method,
      shippingCost,
      estimatedDays,
      label: getMethodLabel(method.toUpperCase()),
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate shipping' });
  }
});

// Get available cities
shippingRoutes.get('/cities', async (req, res) => {
  try {
    // Get cities from zones
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      select: { cities: true },
    });

    const citiesFromZones = zones.flatMap(z => z.cities);
    
    // Combine with default cities
    const allCities = [...new Set([...BENIN_CITIES, ...citiesFromZones])].sort();

    res.json({
      success: true,
      cities: allCities,
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
});

// Get all shipping zones (admin)
shippingRoutes.get('/zones', async (req, res) => {
  try {
    const zones = await prisma.shippingZone.findMany({
      include: {
        rates: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      zones,
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch zones' });
  }
});

// Helper functions
function getDefaultRates(city: string) {
  const isMajorCity = ['Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Ouidah'].includes(city);
  
  if (isMajorCity) {
    return [
      { method: 'standard', price: 1500, estimatedDays: '2-3 jours', label: 'Livraison Standard' },
      { method: 'express', price: 3000, estimatedDays: '24h', label: 'Livraison Express' },
      { method: 'pickup', price: 0, estimatedDays: 'Disponible sous 24h', label: 'Retrait en boutique' },
    ];
  }
  
  return [
    { method: 'standard', price: 2500, estimatedDays: '3-5 jours', label: 'Livraison Standard' },
    { method: 'express', price: 5000, estimatedDays: '1-2 jours', label: 'Livraison Express' },
  ];
}

function getMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    STANDARD: 'Livraison Standard',
    EXPRESS: 'Livraison Express',
    PICKUP: 'Retrait en boutique',
  };
  return labels[method] || method;
}

function getDefaultEstimate(method: string): string {
  const estimates: Record<string, string> = {
    standard: '2-3 jours',
    express: '24h',
    pickup: 'Disponible sous 24h',
  };
  return estimates[method.toLowerCase()] || '3-5 jours';
}
