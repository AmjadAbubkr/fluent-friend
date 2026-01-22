import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Message {
  id: string;
  text: string;
  is_user_reply: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  source_language: string;
  target_language: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          messages (*)
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      toast.error("Failed to load conversation history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(async (
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (err) {
      console.error("Error creating conversation:", err);
      toast.error("Failed to save conversation");
      return null;
    }
  }, [user]);

  const addMessage = useCallback(async (
    conversationId: string,
    text: string,
    isUserReply: boolean
  ): Promise<Message | null> => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          text,
          is_user_reply: isUserReply,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data;
    } catch (err) {
      console.error("Error adding message:", err);
      return null;
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;
      
      setConversations((prev) => 
        prev.filter((c) => c.id !== conversationId)
      );
      toast.success("Conversation deleted");
    } catch (err) {
      console.error("Error deleting conversation:", err);
      toast.error("Failed to delete conversation");
    }
  }, []);

  return {
    conversations,
    loading,
    createConversation,
    addMessage,
    deleteConversation,
    refetch: fetchConversations,
  };
}
