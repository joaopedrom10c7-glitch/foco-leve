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

const Index = () => {
  const [studying, setStudying] = useState(false);

  if (studying) {
    return (
      <div className="min-h-screen bg-background">
        <GuidedSession onBack={() => setStudying(false)} />
        <AntiProcrastination />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onStart={() => setStudying(true)} />
      <StudyModes />
      <SpecialModes />
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
