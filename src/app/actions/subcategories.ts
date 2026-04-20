"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSubcategories(categoryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("move_subcategories")
    .select("*")
    .eq("category_id", categoryId);
    
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addSubcategory(categoryId: string, name: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("move_subcategories")
    .insert({ category_id: categoryId, name })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/v/[token]/move", "page");
  return { success: true, data };
}

export async function deleteSubcategory(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("move_subcategories")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/v/[token]/move", "page");
  return { success: true };
}
