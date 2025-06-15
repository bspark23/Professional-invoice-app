
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthLocal } from "@/hooks/useAuthLocal";

// Note type
export type Note = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export function useNotes() {
  const queryClient = useQueryClient();
  const { user } = useAuthLocal();

  // Fetch all notes for the logged-in user
  const { data: notes, isLoading, error } = useQuery<Note[]>({
    queryKey: ["notes", user?.email], // make this user-scoped
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user?.email) // using email as user_id for demo
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Add a new note
  const addNote = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("notes")
        .insert([{ content, user_id: user.email }]) // FIX: add user_id
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.email] });
    },
  });

  // Update a note
  const updateNote = useMutation({
    mutationFn: async ({ id, content }: {id: string, content: string}) => {
      const { data, error } = await supabase
        .from("notes")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.email] });
    },
  });

  // Delete a note
  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", user?.email] });
    },
  });

  return { notes, isLoading, error, addNote, updateNote, deleteNote };
}
