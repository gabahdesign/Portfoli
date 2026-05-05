"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendWaitlistPromotionEmail } from "@/lib/email";

/**
 * Join an activity
 */
export async function joinMoveActivity(activityId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: "Has d'haver iniciat sessió." };
  }

  // 1. Get profile
  const { data: profile } = await supabase
    .from("move_profiles")
    .select("id, email, name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "Perfil d'usuari Move no trobat." };
  }

  // 2. Check capacity
  const { data: activity } = await supabase
    .from("move_activities")
    .select("id, max_capacity")
    .eq("id", activityId)
    .single();

  const { count: currentJoinedCount } = await supabase
    .from("move_activity_participants")
    .select("id", { count: 'exact', head: true })
    .eq("activity_id", activityId)
    .eq("status", "joined");

  let status: 'joined' | 'waitlisted' = 'joined';
  
  if (activity?.max_capacity && (currentJoinedCount || 0) >= activity.max_capacity) {
    status = 'waitlisted';
  }

  // 3. Insert participant
  const { error } = await supabase
    .from("move_activity_participants")
    .insert([{
      activity_id: activityId,
      profile_id: profile.id,
      status: status
    }]);

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: "Ja estàs apuntat a aquesta activitat." };
    }
    return { success: false, error: "Error en apuntar-se a l'activitat." };
  }

  revalidatePath('/v/[token]/move', 'page');
  return { success: true, status };
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

  // 1. Find the current participant record to know their status before deleting
  const { data: currentParticipant } = await supabase
    .from("move_activity_participants")
    .select("status")
    .eq("activity_id", activityId)
    .eq("profile_id", session.user.id)
    .single();

  const wasJoined = currentParticipant?.status === 'joined';

  // 2. Delete participant
  const { error } = await supabase
    .from("move_activity_participants")
    .delete()
    .eq("activity_id", activityId)
    .eq("profile_id", session.user.id);

  if (error) {
    return { success: false, error: "Error en desapuntar-se de l'activitat." };
  }

  // 3. If the person who left was 'joined', promote the first person in waitlist
  if (wasJoined) {
    const { data: nextInWaitlist } = await supabase
      .from("move_activity_participants")
      .select(`
        id,
        profile_id,
        move_profiles (
          email,
          name
        ),
        move_activities (
          title,
          start_datetime
        )
      `)
      .eq("activity_id", activityId)
      .eq("status", "waitlisted")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextInWaitlist) {
      // Update next person to 'joined'
      await supabase
        .from("move_activity_participants")
        .update({ status: 'joined' })
        .eq("id", nextInWaitlist.id);

      // Send email notification (automated)
      const profile = nextInWaitlist.move_profiles as any;
      const activity = nextInWaitlist.move_activities as any;
      
      if (profile?.email) {
        await sendWaitlistPromotionEmail({
          to: profile.email,
          userName: profile.name || "usuari",
          activityTitle: activity?.title || "Activitat",
          activityDate: activity?.start_datetime ? new Date(activity.start_datetime).toLocaleDateString('ca-ES') : ""
        });
      }
    }
  }

  revalidatePath('/v/[token]/move', 'page');
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
      status,
      profile:move_profiles (
        username
      )
    `)
    .eq("activity_id", activityId)
    .eq("status", "joined"); // Only show people with confirmed spots

  if (error) {
    console.error("Error fetching participants:", error);
    return [];
  }

  return (data as any[]).map((d) => d.profile.username);
}
