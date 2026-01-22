import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  isActive: boolean;
  className?: string;
}

export function WaveformVisualizer({ isActive, className }: WaveformVisualizerProps) {
  const bars = 5;
  
  return (
    <div className={cn("flex items-center justify-center gap-1 h-8", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full bg-primary transition-all duration-300",
            isActive ? [
              "h-8",
              i === 0 && "animate-wave",
              i === 1 && "animate-wave-delay-1",
              i === 2 && "animate-wave-delay-2",
              i === 3 && "animate-wave-delay-3",
              i === 4 && "animate-wave-delay-4",
            ] : "h-2 opacity-30"
          )}
        />
      ))}
    </div>
  );
}
