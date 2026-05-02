import { useEffect, useState } from "react";
import mascotImage from "@/assets/mascot-foco.png";

export default function AntiProcrastination() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        // User left the tab
        setShowPopup(true);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card rounded-3xl shadow-elevated p-8 max-w-sm text-center animate-scale-in">
        <img src={mascotImage} alt="Mascote" className="w-16 h-16 mx-auto mb-4" />
        <h3 className="font-display font-800 text-xl text-foreground mb-2">Ei! 👋</h3>
        <p className="text-muted-foreground mb-1">Volta só mais 3 minutos.</p>
        <p className="text-muted-foreground text-sm mb-6">Depois você pode parar.</p>
        <button
          onClick={() => setShowPopup(false)}
          className="bg-gradient-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 text-base shadow-elevated hover:opacity-90 transition-opacity active:scale-95"
        >
          Voltar a estudar 💪
        </button>
      </div>
    </div>
  );
}
