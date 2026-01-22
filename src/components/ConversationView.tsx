import { useState, useEffect } from "react";
import { ArrowLeft, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListeningButton } from "@/components/ListeningButton";
import { TranscriptionCard } from "@/components/TranscriptionCard";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { type Language } from "@/components/LanguageSelector";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConversationViewProps {
  sourceLanguage: Language;
  targetLanguage: Language;
  onBack: () => void;
}

export function ConversationView({ sourceLanguage, targetLanguage, onBack }: ConversationViewProps) {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Simulated speech recognition (in real app, would use Web Speech API or backend)
  useEffect(() => {
    if (isListening) {
      const timeout = setTimeout(() => {
        // Simulate hearing something
        const heardText = "Bonjour, comment allez-vous aujourd'hui?";
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: heardText,
          isUser: false,
          timestamp: new Date()
        }]);
        
        setIsProcessing(true);
        
        // Simulate AI generating a response
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: "Je vais très bien, merci! Et vous?",
            isUser: true,
            timestamp: new Date()
          }]);
          setIsProcessing(false);
          setIsListening(false);
        }, 1500);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isListening]);

  const handlePlayAudio = (id: string) => {
    setPlayingId(id);
    // Simulate audio playback
    setTimeout(() => setPlayingId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-lg">{sourceLanguage.flag}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-lg">{targetLanguage.flag}</span>
          </div>
          
          <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 container py-6 space-y-4 overflow-y-auto">
        {messages.length === 0 && !isListening && (
          <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to help</h3>
            <p className="text-muted-foreground max-w-xs">
              Tap the microphone to start listening. I'll help you respond in {targetLanguage.name}.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <TranscriptionCard
            key={message.id}
            text={message.text}
            isUser={message.isUser}
            isPlaying={playingId === message.id}
            onPlayAudio={message.isUser ? () => handlePlayAudio(message.id) : undefined}
          />
        ))}

        {isProcessing && (
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl animate-fade-in ml-8">
            <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Generating your response...</p>
              <WaveformVisualizer isActive={true} className="mt-2" />
            </div>
          </div>
        )}
      </div>

      {/* Listening Controls */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-8">
        <div className="container flex flex-col items-center gap-4">
          {isListening && (
            <div className="flex items-center gap-2 text-primary animate-fade-in">
              <WaveformVisualizer isActive={true} />
              <span className="text-sm font-medium">Listening...</span>
            </div>
          )}
          
          <ListeningButton
            isListening={isListening}
            onToggle={() => setIsListening(!isListening)}
            disabled={isProcessing}
          />
          
          <p className="text-sm text-muted-foreground">
            {isListening ? "Tap to stop" : "Tap to listen"}
          </p>
        </div>
      </div>
    </div>
  );
}
