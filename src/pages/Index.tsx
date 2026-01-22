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
  const [sourceLanguage, setSourceLanguage] = useState<Language>(languages[0]); // French
  const [targetLanguage, setTargetLanguage] = useState<Language>(languages[0]); // French
  const [isInConversation, setIsInConversation] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isInConversation) {
    return (
      <ConversationView
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        onBack={() => setIsInConversation(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center shadow-glow">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ConvoHelper</h1>
              <p className="text-sm text-muted-foreground">Your conversation companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/history")}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
              title="Conversation History"
            >
              <History className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => signOut()}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* User Greeting */}
      {user.email && (
        <div className="container pb-2 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Welcome, {user.user_metadata?.display_name || user.email}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container py-6 animate-fade-in">
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI-Powered Replies</h2>
              <p className="text-sm text-muted-foreground">Never struggle to respond again</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Understand what others say but struggle to reply? I'll listen to the conversation and suggest natural responses in real-time.
          </p>
        </div>
      </section>

      {/* Language Selection */}
      <section className="container py-4 space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <LanguageSelector
          label="I understand (they speak)"
          selectedLanguage={sourceLanguage}
          onSelect={setSourceLanguage}
        />

        <div className="flex items-center justify-center py-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Globe className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <LanguageSelector
          label="Help me reply in"
          selectedLanguage={targetLanguage}
          onSelect={setTargetLanguage}
        />
      </section>

      {/* Start Button */}
      <section className="container py-6 mt-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <Button
          variant="gradient"
          size="xl"
          className="w-full"
          onClick={() => setIsInConversation(true)}
        >
          Start Conversation
          <ArrowRight className="w-5 h-5" />
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Tap the microphone to begin listening
        </p>
      </section>

      {/* Features Grid */}
      <section className="container pb-8">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🎧", label: "Listen" },
            { icon: "🤖", label: "Generate" },
            { icon: "🗣️", label: "Speak" },
          ].map((feature, i) => (
            <div
              key={feature.label}
              className="bg-card rounded-2xl p-4 text-center shadow-soft border border-border animate-scale-in"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <span className="text-sm font-medium text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
