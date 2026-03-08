
-- Table pour stocker les problèmes/symptômes et solutions recommandées
CREATE TABLE public.problem_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_number integer NOT NULL,
  symptom text NOT NULL,
  category text NOT NULL DEFAULT 'moteur',
  recommended_products text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.problem_solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Problem solutions are publicly readable"
  ON public.problem_solutions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage problem solutions"
  ON public.problem_solutions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trigger updated_at
CREATE TRIGGER update_problem_solutions_updated_at
  BEFORE UPDATE ON public.problem_solutions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
