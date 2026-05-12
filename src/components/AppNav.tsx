import { Link, useLocation } from "react-router-dom";
import { BookOpen, Calendar, BarChart3, Layers, User, LogOut, Brain, TrendingUp, Trophy, PenTool, Settings, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import AuthModal from "./AuthModal";

const links = [
  { to: "/", label: "Início", icon: BookOpen },
  { to: "/cronograma", label: "Cronograma", icon: Calendar },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/simulado", label: "Simulado", icon: Brain },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/redacao", label: "Redação", icon: PenTool },
  { to: "/conquistas", label: "Conquistas", icon: Trophy },
  { to: "/ranking", label: "Ranking", icon: Crown },
  { to: "/analytics", label: "Análise", icon: TrendingUp },
  { to: "/perfil", label: "Perfil", icon: User },
];

const mobileLinks = [
  { to: "/", label: "Início", icon: BookOpen },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/simulado", label: "Simulado", icon: Brain },
  { to: "/redacao", label: "Redação", icon: PenTool },
  { to: "/perfil", label: "Perfil", icon: User },
];

export default function AppNav() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      {/* Top nav */}
      <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">FOCO LEVE</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to} to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >{l.label}</Link>
            ))}
          </div>
          {user ? (
            <button onClick={signOut} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} className="flex items-center gap-1 text-sm text-primary font-semibold">
              <User className="h-4 w-4" /> Entrar
            </button>
          )}
        </div>
      </nav>

      {/* Bottom mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border">
        <div className="flex justify-around py-2">
          {mobileLinks.map(l => {
            const Icon = l.icon;
            const active = pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className={`flex flex-col items-center gap-0.5 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
