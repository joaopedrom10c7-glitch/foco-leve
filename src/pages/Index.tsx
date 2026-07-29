import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import GuidedSession from "@/components/GuidedSession";
import StudyModes from "@/components/StudyModes";
import SpecialModes from "@/components/SpecialModes";
import ProgressDashboard from "@/components/ProgressDashboard";
import AnxietyMode from "@/components/AnxietyMode";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import ModoMadrugada from "@/components/ModoMadrugada";
import ModoVestibular from "@/components/ModoVestibular";
import ModoRecuperacao from "@/components/ModoRecuperacao";
import StudyPlanner from "@/components/StudyPlanner";
import StudyModeSession from "@/components/StudyModeSession";
import AppNav from "@/components/AppNav";
import { useStudyMode } from "@/contexts/StudyModeContext";
import { useNavigate } from "react-router-dom";

type ActiveView = "home" | "guided" | "madrugada" | "vestibular" | "recuperacao" | "planner" | "pomodoro" | "revisao";

const Index = () => {
  const [view, setView] = useState<ActiveView>("home");
  const { setMode } = useStudyMode();
  const navigate = useNavigate();

  const goHome = () => { setView("home"); setMode("normal"); };

  const activateMode = (v: ActiveView) => {
    setView(v);
    if (v === "madrugada") setMode("madrugada");
    else if (v === "vestibular") setMode("vestibular");
    else if (v === "recuperacao") setMode("recuperacao");
    else setMode("normal");
  };

  if (view === "guided") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <GuidedSession onBack={goHome} />
    </div>
  );
  if (view === "madrugada") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <ModoMadrugada onBack={goHome} />
    </div>
  );
  if (view === "vestibular") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <ModoVestibular onBack={goHome} />
    </div>
  );
  if (view === "recuperacao") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <ModoRecuperacao onBack={goHome} />
    </div>
  );
  if (view === "planner") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <AppNav />
      <StudyPlanner onBack={goHome} />
    </div>
  );
  if (view === "pomodoro" || view === "revisao") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <AppNav />
      <StudyModeSession mode={view} onBack={goHome} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <AppNav />
      <HeroSection onStart={() => activateMode("guided")} />
      <StudyModes
        onModeSelect={(mode) => {
          if (mode === "pomodoro") setView("pomodoro");
          else if (mode === "revisao") setView("revisao");
          else if (mode === "flashcard") navigate("/flashcards");
          else if (mode === "recuperacao") activateMode("recuperacao");
        }}
      />
      <SpecialModes
        onModeSelect={(mode) => {
          if (mode === "madrugada") activateMode("madrugada");
          else if (mode === "vestibular") activateMode("vestibular");
          else if (mode === "recuperacao") activateMode("recuperacao");
        }}
        onPlannerOpen={() => setView("planner")}
      />
      <ProgressDashboard />
      <AnxietyMode />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
