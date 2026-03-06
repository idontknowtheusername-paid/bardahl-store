import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface CustomerProfile {
  id: string;
  phone: string;
  email: string | null;
  full_name: string;
  city: string | null;
}

interface Vehicle {
  id: string;
  license_plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  fuel_type: string | null;
  mileage: number | null;
}

interface CustomerAuthContextType {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  vehicles: Vehicle[];
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: { phone: string; password: string; full_name: string; email?: string; license_plate?: string }) => Promise<{ error: string | null }>;
  login: (identifier: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<{ error: string | null }>;
  deleteVehicle: (id: string) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const AUTH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-auth`;

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!profile;

  const fetchProfile = async () => {
    if (!user) { setProfile(null); return; }
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data as CustomerProfile | null);
  };

  const fetchVehicles = async () => {
    if (!profile) { setVehicles([]); return; }
    const { data } = await supabase
      .from('customer_vehicles')
      .select('*')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false });
    setVehicles((data as Vehicle[]) || []);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchProfile();
    else { setProfile(null); setVehicles([]); }
  }, [user]);

  useEffect(() => {
    if (profile) fetchVehicles();
    else setVehicles([]);
  }, [profile]);

  const register = async (data: { phone: string; password: string; full_name: string; email?: string; license_plate?: string }) => {
    try {
      const resp = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...data }),
      });
      const result = await resp.json();
      if (!resp.ok) return { error: result.error || 'Erreur' };

      if (result.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }
      return { error: null };
    } catch {
      return { error: 'Erreur de connexion' };
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const resp = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', identifier, password }),
      });
      const result = await resp.json();
      if (!resp.ok) return { error: result.error || 'Erreur' };

      if (result.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }
      return { error: null };
    } catch {
      return { error: 'Erreur de connexion' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setVehicles([]);
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    if (!profile) return { error: 'Non connecté' };
    const { error } = await supabase.from('customer_vehicles').insert({
      customer_id: profile.id,
      ...vehicle,
    });
    if (error) return { error: error.message };
    await fetchVehicles();
    return { error: null };
  };

  const deleteVehicle = async (id: string) => {
    await supabase.from('customer_vehicles').delete().eq('id', id);
    await fetchVehicles();
  };

  return (
    <CustomerAuthContext.Provider value={{
      user, session, profile, vehicles, isLoading, isAuthenticated,
      register, login, logout,
      refreshProfile: fetchProfile,
      refreshVehicles: fetchVehicles,
      addVehicle, deleteVehicle,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
