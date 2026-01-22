import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Trash2, ChevronRight, Clock } from "lucide-react";
import { useConversations, type Conversation } from "@/hooks/useConversations";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const languageFlags: Record<string, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  es: "🇪🇸",
  de: "🇩🇪",
  it: "🇮🇹",
  pt: "🇵🇹",
  ar: "🇸🇦",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
};

export default function History() {
  const navigate = useNavigate();
  const { conversations, loading, deleteConversation } = useConversations();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg">Conversation History</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 container py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
            <p className="text-muted-foreground max-w-xs">
              Start a conversation to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation, index) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isExpanded={expandedId === conversation.id}
                onToggle={() => toggleExpand(conversation.id)}
                onDelete={() => deleteConversation(conversation.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationCardProps {
  conversation: Conversation;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  style?: React.CSSProperties;
}

function ConversationCard({ conversation, isExpanded, onToggle, onDelete, style }: ConversationCardProps) {
  const messageCount = conversation.messages?.length || 0;
  const preview = conversation.messages?.[0]?.text.slice(0, 50) || "No messages";

  return (
    <div
      className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden animate-slide-up"
      style={style}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-1 text-xl">
          <span>{languageFlags[conversation.source_language] || "🌐"}</span>
          <span className="text-xs text-muted-foreground">→</span>
          <span>{languageFlags[conversation.target_language] || "🌐"}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {preview}{preview.length >= 50 && "..."}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(new Date(conversation.created_at), "MMM d, yyyy 'at' h:mm a")}
            </span>
            <span className="text-xs text-muted-foreground">
              • {messageCount} message{messageCount !== 1 && "s"}
            </span>
          </div>
        </div>

        <ChevronRight className={cn(
          "w-5 h-5 text-muted-foreground transition-transform",
          isExpanded && "rotate-90"
        )} />
      </button>

      {isExpanded && conversation.messages && (
        <div className="border-t border-border">
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "p-3 rounded-xl text-sm",
                  message.is_user_reply
                    ? "bg-primary/10 ml-6"
                    : "bg-secondary mr-6"
                )}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {message.is_user_reply ? "Your reply" : "They said"}
                </p>
                <p className="text-foreground">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
