import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Settings, Bell, Volume2, Target, Moon, Sun, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserSettings {
  tema: string;
  meta_diaria_min: number;
  notificacoes: boolean;
  som: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  tema: "dark",
  meta_diaria_min: 120,
  notificacoes: true,
  som: true,
};

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single();
    if (data) {
      setSettings({
        tema: data.tema,
        meta_diaria_min: data.meta_diaria_min,
        notificacoes: data.notificacoes,
        som: data.som,
      });
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (!error) {
      toast({ title: "Configurações salvas! ⚙️" });
      // Apply theme
      document.documentElement.classList.toggle("dark", settings.tema === "dark");
    } else {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setSaving(false);
  };

  if (!user) {
    return <><AppNav /><div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Faça login para configurar.</p></div></>;
  }

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-lg space-y-5">
          <div>
            <h1 className="font-display font-bold text-2xl flex items-center gap-2"><Settings className="h-6 w-6 text-primary" /> Configurações</h1>
            <p className="text-sm text-muted-foreground">Personalize sua experiência de estudo</p>
          </div>

          {/* Theme */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 shadow-card space-y-4">
            <h3 className="font-display font-bold text-sm flex items-center gap-2">
              {settings.tema === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Aparência
            </h3>
            <div className="flex gap-3">
              {[
                { value: "dark", label: "Escuro", icon: Moon },
                { value: "light", label: "Claro", icon: Sun },
              ].map(t => (
                <button
                  key={t.value}
                  className={`flex-1 p-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    settings.tema === t.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => setSettings({ ...settings, tema: t.value })}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Daily goal */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-4 shadow-card space-y-3">
            <h3 className="font-display font-bold text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Meta diária</h3>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={15}
                max={480}
                value={settings.meta_diaria_min}
                onChange={e => setSettings({ ...settings, meta_diaria_min: parseInt(e.target.value) || 60 })}
                className="w-24 text-center"
              />
              <span className="text-sm text-muted-foreground">minutos por dia</span>
            </div>
            <div className="flex gap-2">
              {[30, 60, 120, 180].map(m => (
                <button
                  key={m}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.meta_diaria_min === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => setSettings({ ...settings, meta_diaria_min: m })}
                >{m === 60 ? "1h" : m === 120 ? "2h" : m === 180 ? "3h" : `${m}min`}</button>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-4 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-display font-bold text-sm">Notificações</span>
              </div>
              <Switch checked={settings.notificacoes} onCheckedChange={v => setSettings({ ...settings, notificacoes: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="font-display font-bold text-sm">Sons</span>
              </div>
              <Switch checked={settings.som} onCheckedChange={v => setSettings({ ...settings, som: v })} />
            </div>
          </motion.div>

          <Button variant="hero" className="w-full rounded-full" onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </div>
    </>
  );
}
