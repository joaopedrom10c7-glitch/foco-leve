
-- Adicionar coluna de apelido público ao profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS apelido TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS publico BOOLEAN NOT NULL DEFAULT true;

-- Política para leitura pública dos campos de ranking
DROP POLICY IF EXISTS "Ranking público" ON public.profiles;
CREATE POLICY "Ranking público"
ON public.profiles
FOR SELECT
TO authenticated
USING (publico = true);
