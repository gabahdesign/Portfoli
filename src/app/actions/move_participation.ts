"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Join an activity
 */
export async function joinMoveActivity(activityId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: "Has d'haver iniciat sessió." };
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from("move_profiles")
    .select("id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "Perfil d'usuari Move no trobat." };
  }

  const { error } = await supabase
    .from("move_activity_participants")
    .insert([{
      activity_id: activityId,
      profile_id: profile.id
    }]);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: "Ja estàs apuntat a aquesta activitat." };
    }
    return { success: false, error: "Error en apuntar-se a l'activitat." };
  }

  return { success: true };
}

/**
 * Leave an activity
 */
export async function leaveMoveActivity(activityId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: "Has d'haver iniciat sessió." };
  }

  const { error } = await supabase
    .from("move_activity_participants")
    .delete()
    .eq("activity_id", activityId)
    .eq("profile_id", session.user.id);

  if (error) {
    return { success: false, error: "Error en desapuntar-se de l'activitat." };
  }

  return { success: true };
}

/**
 * Get participants of an activity (nicks only)
 */
export async function getActivityParticipants(activityId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("move_activity_participants")
    .select(`
      profile:move_profiles (
        username
      )
    `)
    .eq("activity_id", activityId);

  if (error) {
    console.error("Error fetching participants:", error);
    return [];
  }

  return data.map((d: any) => d.profile.username);
}
