import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type StudyMode = "normal" | "madrugada" | "vestibular" | "recuperacao";

interface StudyModeContextType {
  mode: StudyMode;
  setMode: (mode: StudyMode) => void;
}

const StudyModeContext = createContext<StudyModeContextType>({
  mode: "normal",
  setMode: () => {},
});

export function StudyModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<StudyMode>("normal");

  useEffect(() => {
    const root = document.documentElement;
    // Remove all mode classes
    root.classList.remove("dark", "mode-madrugada", "mode-vestibular", "mode-recuperacao");

    if (mode === "madrugada") {
      root.classList.add("dark", "mode-madrugada");
    } else if (mode === "vestibular") {
      root.classList.add("mode-vestibular");
    } else if (mode === "recuperacao") {
      root.classList.add("mode-recuperacao");
    }
  }, [mode]);

  return (
    <StudyModeContext.Provider value={{ mode, setMode }}>
      {children}
    </StudyModeContext.Provider>
  );
}

export function useStudyMode() {
  return useContext(StudyModeContext);
}
