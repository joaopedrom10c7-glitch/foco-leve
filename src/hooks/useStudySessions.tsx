import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useStudySessions() {
  const { user } = useAuth();

  const recordSession = async (materia: string, area: string, modo: string, duracao_min: number) => {
    if (!user) return;
    await supabase.from("study_sessions").insert({
      user_id: user.id,
      materia,
      area,
      modo,
      duracao_min,
    });
  };

  return { recordSession };
}
