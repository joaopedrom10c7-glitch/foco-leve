import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else if (!isLogin) {
      toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar." });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-elevated animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-bold text-xl">{isLogin ? "Entrar" : "Criar conta"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email" placeholder="E-mail" value={email}
            onChange={e => setEmail(e.target.value)} required
          />
          <Input
            type="password" placeholder="Senha (min. 6 caracteres)" value={password}
            onChange={e => setPassword(e.target.value)} required minLength={6}
          />
          <Button type="submit" variant="hero" className="w-full rounded-full" disabled={loading}>
            {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-3">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button className="text-primary font-semibold" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
