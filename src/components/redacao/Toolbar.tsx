import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Moon,
  Save,
  Sun,
} from "lucide-react";

interface Props {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onCopy: () => void;
  onExport: (format: "txt" | "pdf" | "docx") => void;
  onSave: () => void;
  saving: boolean;
  savedAt: string | null;
}

export default function Toolbar({
  fullscreen,
  onToggleFullscreen,
  dark,
  onToggleDark,
  onCopy,
  onExport,
  onSave,
  saving,
  savedAt,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button size="sm" variant="ghost" onClick={onToggleDark} title="Tema">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button size="sm" variant="ghost" onClick={onToggleFullscreen} title="Tela cheia">
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
      <Button size="sm" variant="ghost" onClick={onCopy} title="Copiar">
        <Copy className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onExport("txt")} title="Exportar TXT">
        <FileText className="h-4 w-4" />
        <span className="ml-1 text-xs">TXT</span>
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onExport("pdf")} title="Exportar PDF">
        <Download className="h-4 w-4" />
        <span className="ml-1 text-xs">PDF</span>
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onExport("docx")} title="Exportar DOCX">
        <Download className="h-4 w-4" />
        <span className="ml-1 text-xs">DOCX</span>
      </Button>
      <Button size="sm" variant="secondary" className="rounded-full" onClick={onSave} disabled={saving}>
        <Save className="mr-1 h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
      </Button>
      {savedAt && <span className="text-[10px] text-muted-foreground">salvo {savedAt}</span>}
    </div>
  );
}
