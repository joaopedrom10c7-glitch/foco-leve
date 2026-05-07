
-- Achievements catalog
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  icone text NOT NULL DEFAULT '🏆',
  tipo text NOT NULL DEFAULT 'generic',
  meta integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read achievements" ON public.achievements FOR SELECT TO authenticated USING (true);

-- User unlocked achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own user_achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Redação submissions
CREATE TABLE public.redacao_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tema text NOT NULL,
  texto text NOT NULL DEFAULT '',
  nota integer,
  feedback text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.redacao_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own redacao" ON public.redacao_submissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User settings
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tema text NOT NULL DEFAULT 'dark',
  meta_diaria_min integer NOT NULL DEFAULT 120,
  notificacoes boolean NOT NULL DEFAULT true,
  som boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed achievements
INSERT INTO public.achievements (nome, descricao, icone, tipo, meta) VALUES
  ('Primeiro Passo', 'Complete sua primeira sessão de estudo', '🌱', 'sessions', 1),
  ('Estudante Dedicado', 'Complete 10 sessões de estudo', '📚', 'sessions', 10),
  ('Maratonista', 'Complete 50 sessões de estudo', '🏃', 'sessions', 50),
  ('Lenda', 'Complete 100 sessões de estudo', '🏆', 'sessions', 100),
  ('Streak de 3', 'Mantenha 3 dias seguidos de estudo', '🔥', 'streak', 3),
  ('Streak de 7', 'Uma semana inteira estudando!', '⚡', 'streak', 7),
  ('Streak de 30', '30 dias seguidos — incrível!', '💎', 'streak', 30),
  ('Primeira Nota', 'Faça seu primeiro simulado', '🎯', 'simulado', 1),
  ('Simulador Pro', 'Faça 10 simulados', '🧠', 'simulado', 10),
  ('XP 1000', 'Acumule 1000 XP', '⭐', 'xp', 1000),
  ('XP 5000', 'Acumule 5000 XP', '🌟', 'xp', 5000),
  ('Escritor ENEM', 'Envie sua primeira redação', '✍️', 'redacao', 1),
  ('Flashcard Master', 'Revise 100 flashcards', '🃏', 'flashcard', 100);
