import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
];

interface LanguageSelectorProps {
  label: string;
  selectedLanguage: Language;
  onSelect: (language: Language) => void;
}

export function LanguageSelector({ label, selectedLanguage, onSelect }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card rounded-2xl shadow-soft border border-border hover:shadow-elevated transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedLanguage.flag}</span>
          <span className="font-semibold text-foreground">{selectedLanguage.name}</span>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden animate-scale-in">
          <div className="max-h-64 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onSelect(language);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors",
                  selectedLanguage.code === language.code && "bg-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <span className="font-medium text-foreground">{language.name}</span>
                </div>
                {selectedLanguage.code === language.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { languages, type Language };
