import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudyModeProvider } from "@/contexts/StudyModeContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import CronogramaPage from "./pages/Cronograma";
import DashboardPage from "./pages/Dashboard";
import FlashcardsPage from "./pages/FlashcardsPage";
import RepertorioPage from "./pages/Repertorio";
import NotFound from "./pages/NotFound";
import PlanosPage from "./pages/Planos";
import SimuladoPage from "./pages/Simulado";
import AnalyticsPage from "./pages/Analytics";
import ProfilePage from "./pages/Profile";
import ConquistasPage from "./pages/Conquistas";
import RedacaoPage from "./pages/Redacao";
import ConfiguracoesPage from "./pages/Configuracoes";
import RankingPage from "./pages/Ranking";
import Onboarding from "./components/Onboarding";
import AICoach from "./components/AICoach";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setNeedsOnboarding(false);
        setCheckingOnboarding(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("study_preference")
        .eq("id", user.id)
        .single();

      const prefs = data?.study_preference as Record<string, unknown> | null;
      setNeedsOnboarding(!prefs?.onboarding_complete);
      setCheckingOnboarding(false);
    };
    if (!loading) check();
  }, [user, loading]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-display">Carregando...</div>
      </div>
    );
  }

  if (user && needsOnboarding) {
    return <Onboarding onComplete={() => setNeedsOnboarding(false)} />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cronograma" element={<CronogramaPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/repertorio" element={<RepertorioPage />} />
        <Route path="/simulado" element={<SimuladoPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/conquistas" element={<ConquistasPage />} />
        <Route path="/redacao" element={<RedacaoPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/planos" element={<PlanosPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AICoach />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionProvider>
        <StudyModeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </StudyModeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
