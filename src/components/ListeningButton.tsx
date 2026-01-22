import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListeningButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ListeningButton({ isListening, onToggle, disabled }: ListeningButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <div className="absolute w-32 h-32 rounded-full bg-primary/20 animate-listening-pulse" />
          <div className="absolute w-40 h-40 rounded-full bg-primary/10 animate-listening-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute w-48 h-48 rounded-full bg-primary/5 animate-listening-pulse" style={{ animationDelay: "1s" }} />
        </>
      )}
      
      <button
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300",
          "shadow-glow hover:shadow-elevated active:scale-95",
          isListening 
            ? "gradient-warm" 
            : "bg-card border-4 border-primary/20 hover:border-primary/40"
        )}
      >
        {isListening ? (
          <MicOff className="w-10 h-10 text-primary-foreground" />
        ) : (
          <Mic className="w-10 h-10 text-primary" />
        )}
      </button>
    </div>
  );
}
