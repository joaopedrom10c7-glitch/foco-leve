import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PlanType = "free" | "pro" | "ultra";

interface PlanLimits {
  flashcardsPerDay: number;
  hasAI: boolean;
  hasSimulados: boolean;
  hasAdvancedStats: boolean;
  hasCustomThemes: boolean;
  hasWeeklyReport: boolean;
  hasPrioritySupport: boolean;
  hasUnlimitedModes: boolean;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    flashcardsPerDay: 5,
    hasAI: false,
    hasSimulados: false,
    hasAdvancedStats: false,
    hasCustomThemes: false,
    hasWeeklyReport: false,
    hasPrioritySupport: false,
    hasUnlimitedModes: false,
  },
  pro: {
    flashcardsPerDay: 999,
    hasAI: true,
    hasSimulados: true,
    hasAdvancedStats: true,
    hasCustomThemes: true,
    hasWeeklyReport: true,
    hasPrioritySupport: false,
    hasUnlimitedModes: true,
  },
  ultra: {
    flashcardsPerDay: 999,
    hasAI: true,
    hasSimulados: true,
    hasAdvancedStats: true,
    hasCustomThemes: true,
    hasWeeklyReport: true,
    hasPrioritySupport: true,
    hasUnlimitedModes: true,
  },
};

interface SubscriptionContextType {
  plan: PlanType;
  limits: PlanLimits;
  loading: boolean;
  isPro: boolean;
  isUltra: boolean;
  canUseFeature: (feature: keyof PlanLimits) => boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: "free",
  limits: PLAN_LIMITS.free,
  loading: true,
  isPro: false,
  isUltra: false,
  canUseFeature: () => false,
  refresh: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>("free");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setPlan("free"); setLoading(false); return; }
    const { data } = await supabase
      .from("user_subscriptions")
      .select("plano, status")
      .eq("user_id", user.id)
      .single();
    if (data && data.status === "active") {
      setPlan(data.plano as PlanType);
    } else {
      setPlan("free");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const limits = PLAN_LIMITS[plan];
  const isPro = plan === "pro" || plan === "ultra";
  const isUltra = plan === "ultra";
  const canUseFeature = (feature: keyof PlanLimits) => !!limits[feature];

  return (
    <SubscriptionContext.Provider value={{ plan, limits, loading, isPro, isUltra, canUseFeature, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
