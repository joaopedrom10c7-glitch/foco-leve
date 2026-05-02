import HeroSection from "@/components/HeroSection";
import StudyMethods from "@/components/StudyMethods";
import FocusTimer from "@/components/FocusTimer";
import Flashcards from "@/components/Flashcards";
import ProgressDashboard from "@/components/ProgressDashboard";
import AnxietyMode from "@/components/AnxietyMode";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StudyMethods />
      <FocusTimer />
      <Flashcards />
      <ProgressDashboard />
      <AnxietyMode />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
