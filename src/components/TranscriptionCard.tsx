import { Volume2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptionCardProps {
  text: string;
  isUser?: boolean;
  isPlaying?: boolean;
  onPlayAudio?: () => void;
  className?: string;
}

export function TranscriptionCard({ 
  text, 
  isUser = false, 
  isPlaying,
  onPlayAudio,
  className 
}: TranscriptionCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-2xl animate-slide-up",
      isUser 
        ? "bg-primary/10 border border-primary/20 ml-8" 
        : "bg-card shadow-soft border border-border mr-8",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary/20" : "bg-secondary"
        )}>
          <User className={cn(
            "w-4 h-4",
            isUser ? "text-primary" : "text-secondary-foreground"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isUser ? "Suggested Reply" : "They said"}
          </p>
          <p className="text-foreground leading-relaxed">{text}</p>
        </div>

        {onPlayAudio && (
          <button
            onClick={onPlayAudio}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
              "hover:bg-secondary active:scale-95",
              isPlaying && "bg-primary/10"
            )}
          >
            <Volume2 className={cn(
              "w-5 h-5",
              isPlaying ? "text-primary animate-pulse" : "text-muted-foreground"
            )} />
          </button>
        )}
      </div>
    </div>
  );
}
