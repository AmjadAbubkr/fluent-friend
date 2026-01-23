import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Sparkles, Globe, History, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector, languages, type Language } from "@/components/LanguageSelector";
import { ConversationView } from "@/components/ConversationView";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  // App Mode State
  const [activeTab, setActiveTab] = useState<"helper" | "translator">("helper");

  // Helper Mode State (Single language)
  const [conversationLanguage, setConversationLanguage] = useState<Language>(languages[0]);

  // Translator Mode State (Dual language)
  const [sourceLanguage, setSourceLanguage] = useState<Language>(languages[0]); // Them
  const [targetLanguage, setTargetLanguage] = useState<Language>(languages[1]); // Me

  const [isInConversation, setIsInConversation] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-surface animate-fade-in">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] gradient-warm flex items-center justify-center shadow-glow animate-pulse">
            <MessageCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Convo</h2>
            <p className="text-sm font-medium text-muted-foreground/60 uppercase tracking-[0.2em]">
              developed by amjad abubkr
            </p>
          </div>
          <div className="mt-4 flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isInConversation) {
    return (
      <ConversationView
        // If helper, source & target are the same (listen in X, reply in X)
        sourceLanguage={activeTab === "helper" ? conversationLanguage : sourceLanguage}
        targetLanguage={activeTab === "helper" ? conversationLanguage : targetLanguage}
        mode={activeTab === "helper" ? "helper" : "translate"}
        onBack={() => setIsInConversation(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-safe-top pb-safe-bottom bg-gradient-surface">
      {/* Header */}
      <header className="container pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center shadow-glow">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Convo</h1>
              <p className="text-sm text-muted-foreground">Your AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/history")}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <History className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => signOut()}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="container px-4">
        <div className="flex bg-secondary/50 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("helper")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "helper"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Sparkles className="w-4 h-4" />
            Convo Helper
          </button>
          <button
            onClick={() => setActiveTab("translator")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "translator"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Globe className="w-4 h-4" />
            Translator
          </button>
        </div>
      </div>

      {/* Helper Mode Content */}
      {activeTab === "helper" && (
        <main className="container flex-1 flex flex-col animate-fade-in">
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Co-Pilot Mode</h2>
            </div>
            <p className="text-muted-foreground">
              I'll listen to the conversation in {conversationLanguage.name} and suggest smart replies to keep it going.
            </p>
          </div>

          <div className="space-y-4">
            <LanguageSelector
              label="Conversation Language"
              selectedLanguage={conversationLanguage}
              onSelect={setConversationLanguage}
            />
          </div>

          <div className="mt-auto py-6">
            <Button
              variant="gradient"
              size="xl"
              className="w-full"
              onClick={() => setIsInConversation(true)}
            >
              Start Helper
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </main>
      )}

      {/* Translator Mode Content */}
      {activeTab === "translator" && (
        <main className="container flex-1 flex flex-col animate-fade-in">
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-semibold text-foreground">Live Translator</h2>
            </div>
            <p className="text-muted-foreground">
              I'll translate what they say in {sourceLanguage.name} to {targetLanguage.name} (Text + Speech).
            </p>
          </div>

          <div className="space-y-4">
            <LanguageSelector
              label="They Speak"
              selectedLanguage={sourceLanguage}
              onSelect={setSourceLanguage}
            />

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
            </div>

            <LanguageSelector
              label="I Speak / Understand"
              selectedLanguage={targetLanguage}
              onSelect={setTargetLanguage}
            />
          </div>

          <div className="mt-auto py-6">
            <Button
              variant="gradient"
              size="xl"
              className="w-full"
              onClick={() => setIsInConversation(true)}
            >
              Start Translator
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </main>
      )}
    </div>
  );
};

export default Index;
