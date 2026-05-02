import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudyModeProvider } from "@/contexts/StudyModeContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CronogramaPage from "./pages/Cronograma";
import DashboardPage from "./pages/Dashboard";
import FlashcardsPage from "./pages/FlashcardsPage";
import RepertorioPage from "./pages/Repertorio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StudyModeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cronograma" element={<CronogramaPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/repertorio" element={<RepertorioPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StudyModeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
