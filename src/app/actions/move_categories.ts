"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveCategory(name: string, groupId: string, id?: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const payload = {
    name,
    group_id: groupId,
  };

  let error;
  if (id) {
    const { error: updateError } = await supabase
      .from("move_categories")
      .update(payload)
      .eq("id", id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("move_categories")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    console.error("Error saving category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/v/[token]/move", "page");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  // Check if there are activities using this category
  const { count, error: countError } = await supabase
    .from("move_activities")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return { success: false, error: countError.message };
  
  if (count && count > 0) {
    return { 
      success: false, 
      error: `No es pot esborrar: Hi ha ${count} activitats en aquesta categoria. Reorganitza-les primer.` 
    };
  }

  const { error } = await supabase.from("move_categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/v/[token]/move", "page");
  return { success: true };
}
