import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import GuidedSession from "@/components/GuidedSession";
import StudyModes from "@/components/StudyModes";
import SpecialModes from "@/components/SpecialModes";
import Flashcards from "@/components/Flashcards";
import ProgressDashboard from "@/components/ProgressDashboard";
import AnxietyMode from "@/components/AnxietyMode";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import AntiProcrastination from "@/components/AntiProcrastination";
import ModoMadrugada from "@/components/ModoMadrugada";
import ModoVestibular from "@/components/ModoVestibular";
import ModoRecuperacao from "@/components/ModoRecuperacao";
import StudyPlanner from "@/components/StudyPlanner";
import { useStudyMode } from "@/contexts/StudyModeContext";

type ActiveView = "home" | "guided" | "madrugada" | "vestibular" | "recuperacao" | "planner" | "flashcards";

const Index = () => {
  const [view, setView] = useState<ActiveView>("home");
  const { setMode } = useStudyMode();

  const goHome = () => {
    setView("home");
    setMode("normal");
  };

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
      <AntiProcrastination />
    </div>
  );

  if (view === "madrugada") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <ModoMadrugada onBack={goHome} />
      <AntiProcrastination />
    </div>
  );

  if (view === "vestibular") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <ModoVestibular onBack={goHome} />
      <AntiProcrastination />
    </div>
  );

  if (view === "recuperacao") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <ModoRecuperacao onBack={goHome} />
    </div>
  );

  if (view === "planner") return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <StudyPlanner onBack={goHome} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <HeroSection onStart={() => activateMode("guided")} />
      <StudyModes
        onModeSelect={(mode) => {
          if (mode === "pomodoro" || mode === "revisao" || mode === "sprint") activateMode("guided");
          else if (mode === "flashcard") setView("flashcards");
          else if (mode === "recuperacao") activateMode("recuperacao");
          else if (mode === "revisao7") activateMode("guided");
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
      <Flashcards />
      <ProgressDashboard />
      <AnxietyMode />
      <Pricing />
      <Footer />
      <AntiProcrastination />
    </div>
  );
};

export default Index;
