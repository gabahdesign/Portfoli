"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveActivity(formData: any, categoryId: string) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const startDateTime = formData.isAllDay 
    ? `${formData.date}T00:00:00` 
    : `${formData.date}T${formData.time}:00`;

  let endDateTime = null;
  if (!formData.isAllDay && formData.endTime) {
    endDateTime = `${formData.date}T${formData.endTime}:00`;
  }

  const payload = {
    title: formData.title,
    description: formData.description,
    whatsapp_link: formData.whatsapp_link || null,
    subcategory_id: formData.subcategory_id || null,
    category_id: categoryId,
    start_datetime: startDateTime,
    end_datetime: endDateTime,
    location: formData.location,
    location_coords: formData.location_coords || null,
    metadata: {
      distance: formData.distance,
      elevation: formData.elevation,
      difficulty: formData.difficulty,
      isAllDay: formData.isAllDay
    },
    status: 'published'
  };

  let error;
  if (formData.id) {
    const { error: updateError } = await supabase.from("move_activities").update(payload).eq("id", formData.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase.from("move_activities").insert(payload);
    error = insertError;
  }

  if (error) {
    console.error("Error saving activity:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/v/[token]/move", "page");
  return { success: true };
}

export async function deleteActivity(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase.from("move_activities").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/v/[token]/move", "page");
  return { success: true };
}

export async function geocodeLocation(query: string) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`, {
      method: "GET",
      headers: {
        "Accept-Language": "ca,es,en",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { success: true, lat: data[0].lat, lng: data[0].lon, display_name: data[0].display_name };
    }
    return { success: false, error: "No s'ha trobat res" };
  } catch (e) {
    console.error("Geocode error:", e);
    return { success: false, error: "Error de xarxa" };
  }
}

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
      method: "GET",
      headers: {
        "Accept-Language": "ca,es,en",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    
    const data = await res.json();
    if (data && data.display_name) {
      return { success: true, address: data.display_name };
    }
    return { success: false, error: "Adreça no trobada" };
  } catch (e) {
    console.error("Reverse geocode error:", e);
    return { success: false, error: "Error de xarxa" };
  }
}

