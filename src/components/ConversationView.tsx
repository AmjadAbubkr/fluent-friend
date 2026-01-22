import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Settings, Sparkles, AlertCircle } from "lucide-react";
import { ListeningButton } from "@/components/ListeningButton";
import { TranscriptionCard } from "@/components/TranscriptionCard";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { type Language } from "@/components/LanguageSelector";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useConversations, type Message as DbMessage } from "@/hooks/useConversations";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ConversationViewProps {
  sourceLanguage: Language;
  targetLanguage: Language;
  mode: "helper" | "translate";
  onBack: () => void;
}

export function ConversationView({ sourceLanguage, targetLanguage, mode, onBack }: ConversationViewProps) {
  const { user } = useAuth();
  const { createConversation, addMessage: saveMessage } = useConversations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const lastTranscriptRef = useRef("");

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error: speechError,
  } = useSpeechRecognition(sourceLanguage.code);

  // Create conversation when starting
  useEffect(() => {
    const initConversation = async () => {
      if (user && !conversationId) {
        const id = await createConversation(sourceLanguage.code, targetLanguage.code);
        setConversationId(id);
      }
    };
    initConversation();
  }, [user, sourceLanguage.code, targetLanguage.code]);

  // Process transcript when we have new content
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current && !isListening) {
      lastTranscriptRef.current = transcript;
      processTranscript(transcript.trim());
    }
  }, [transcript, isListening]);

  const processTranscript = async (text: string) => {
    if (!text) return;

    // Add the heard message
    const heardMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, heardMessage]);

    // Save to database
    if (conversationId) {
      await saveMessage(conversationId, text, false);
    }

    // Generate AI response or Translation
    setIsProcessing(true);
    try {
      const response = await generateAIResponse(text, targetLanguage.code, sourceLanguage.code, mode);

      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, replyMessage]);

      // Save reply to database
      if (conversationId) {
        await saveMessage(conversationId, response, true);
      }

      // Auto-play translation if in translate mode
      if (mode === "translate") {
        handlePlayAudio(replyMessage.id, response);
      }
    } catch (err) {
      console.error("Error generating response:", err);
      toast.error("Failed to generate response");
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  };

  const generateAIResponse = async (
    heardText: string,
    replyLanguage: string,
    sourceLanguage: string,
    mode: "helper" | "translate"
  ): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-reply", {
        body: {
          heardText,
          replyLanguage,
          sourceLanguage,
          mode,
        },
      });

      if (error) throw error;
      return data.reply;
    } catch (err) {
      console.error("AI generation error:", err);
      return "Sorry, could not process that request.";
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      lastTranscriptRef.current = "";
      startListening();
    }
  };

  const handlePlayAudio = (id: string, text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser");
      return;
    }

    setPlayingId(id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLanguage.code === "en" ? "en-US" : `${targetLanguage.code}-${targetLanguage.code.toUpperCase()}`;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex flex-col pt-safe-top pb-safe-bottom">
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

      {/* Speech not supported warning */}
      {!isSupported && (
        <div className="container py-4">
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-2xl border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              Speech recognition is not supported in this browser. Please use Chrome or Edge for the best experience.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 container py-6 space-y-4 overflow-y-auto">
        {messages.length === 0 && !isListening && !interimTranscript && (
          <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {mode === "helper" ? "Conversational Helper" : "Ready to Translate"}
            </h3>
            <p className="text-muted-foreground max-w-xs">
              {mode === "helper"
                ? `I'll listent to ${sourceLanguage.name} and suggest replies in ${targetLanguage.name}.`
                : `Say something in ${sourceLanguage.name} to translate to ${targetLanguage.name}.`}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <TranscriptionCard
            key={message.id}
            text={message.text}
            isUser={message.isUser}
            isPlaying={playingId === message.id}
            onPlayAudio={message.isUser ? () => handlePlayAudio(message.id, message.text) : undefined}
          />
        ))}

        {/* Interim transcript while listening */}
        {(interimTranscript || (isListening && transcript)) && (
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border animate-fade-in mr-8">
            <p className="text-sm font-medium text-muted-foreground mb-1">Listening...</p>
            <p className="text-foreground">{interimTranscript || transcript}</p>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl animate-fade-in ml-8">
            <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {mode === "helper" ? "Generating reply..." : "Translating..."}
              </p>
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
            onToggle={handleToggleListening}
            disabled={isProcessing || !isSupported}
          />

          <p className="text-sm text-muted-foreground">
            {isListening ? "Tap to stop" : "Tap to listen"}
          </p>
        </div>
      </div>
    </div>
  );
}
