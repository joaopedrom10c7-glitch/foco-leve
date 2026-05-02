import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">EstudaFácil</span>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Feito com <Heart className="h-3 w-3 text-accent" /> para estudantes brasileiros
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Termos</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
          <a href="#" className="hover:text-foreground transition-colors">Contato</a>
        </div>
      </div>
    </footer>
  );
}
