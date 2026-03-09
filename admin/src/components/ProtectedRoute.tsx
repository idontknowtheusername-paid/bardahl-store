import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Rediriger immédiatement vers login si pas d'utilisateur et pas en chargement
  if (!isLoading && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Afficher le loader seulement si on est en train de charger
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
          <p className="text-muted-foreground mt-2">
            Vous n'avez pas les droits d'accès à cette section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
