
-- Study schedule (cronograma)
CREATE TABLE public.cronograma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  horario TEXT NOT NULL,
  materia TEXT NOT NULL,
  conteudo TEXT DEFAULT '',
  tipo_estudo TEXT DEFAULT 'leitura',
  duracao INTEGER DEFAULT 60,
  cor TEXT DEFAULT '#10B981',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.cronograma ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own schedule" ON public.cronograma FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Flashcards
CREATE TABLE public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  materia TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own decks" ON public.flashcard_decks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  frente TEXT NOT NULL,
  verso TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  facilidade REAL DEFAULT 2.5,
  intervalo INTEGER DEFAULT 0,
  proxima_revisao TIMESTAMPTZ DEFAULT now(),
  repeticoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study sessions (for dashboard)
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  materia TEXT NOT NULL,
  area TEXT NOT NULL,
  modo TEXT NOT NULL,
  duracao_min INTEGER NOT NULL,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Repertório ENEM
CREATE TABLE public.repertorio_enem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia TEXT NOT NULL,
  tema TEXT NOT NULL,
  texto TEXT NOT NULL,
  autor TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.repertorio_enem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read repertorio" ON public.repertorio_enem FOR SELECT TO authenticated USING (true);

-- User favorites for repertório
CREATE TABLE public.repertorio_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repertorio_id UUID REFERENCES public.repertorio_enem(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, repertorio_id)
);
ALTER TABLE public.repertorio_favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON public.repertorio_favoritos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT DEFAULT '',
  streak_dias INTEGER DEFAULT 0,
  xp_total INTEGER DEFAULT 0,
  ultimo_estudo DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
