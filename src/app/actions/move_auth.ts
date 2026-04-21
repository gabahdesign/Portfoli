"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface RegistrationFormData {
  email: string;
  username: string;
  password: string;
  name: string;
  surname?: string;
  phone?: string;
  location?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Validation Regex for secure password
// 8+ chars, number, symbol, upper, lower
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-\/,#])[A-Za-z\d@$!%*?&._\-\/,#]{8,}$/;

/**
 * Initiates the registration process.
 * Verifies username uniqueness and sends a 6-digit code.
 */
export async function initiateMoveRegistration(formData: RegistrationFormData) {
  const { email, username, password } = formData;
  const supabase = await createClient();

  // 1. Validate password
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      success: false, 
      error: "La contrasenya ha de tenir 8+ caràcters, una majúscula, una minúscula, un número i un símbol." 
    };
  }

  // 2. Check username uniqueness in move_profiles
  const { data: existingUser } = await supabase
    .from("move_profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    return { success: false, error: "Aquest nom d'usuari ja està agafat." };
  }

  // 3. Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 4. Store in move_temp_registrations
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 min expiry

  const { error: dbError } = await supabase
    .from("move_temp_registrations")
    .upsert({
      email,
      username,
      verification_code: code,
      payload: formData,
      expires_at: expiresAt.toISOString()
    }, { onConflict: 'email' });

  if (dbError) {
    console.error("DB Error:", dbError);
    return { success: false, error: "Error en el registre temporal." };
  }

  // 5. Send Email via Resend
  if (resend) {
    try {
      await resend.emails.send({
        from: "Move Activity Hub <onboarding@resend.dev>",
        to: [email],
        subject: "Codi de verificació - Move",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 20px;">
            <h2 style="color: #843aea; text-align: center;">Verifica el teu compte Move</h2>
            <p>Hola!</p>
            <p>Estàs a un pas d'unir-te a la comunitat d'activitats Move. Utilitza el següent codi per verificar el teu correu:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; margin: 30px 0;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
              Aquest és un missatge automàtic, si us plau <strong>no respongueu</strong> a aquest correu. Si no has demanat aquest codi, pots ignorar aquest missatge.
            </p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Email Error:", emailErr);
      return { success: false, error: "Error en enviar el correu de verificació." };
    }
  } else {
    console.warn("RESEND_API_KEY no configurada. Codi:", code);
    // In dev mode without key, we might want to return success for testing, 
    // but for production it should be an error.
  }

  return { success: true };
}

/**
 * Verifies the 6-digit code and creates the actual user.
 */
export async function verifyAndCompleteSignUp(email: string, code: string) {
  const supabase = await createClient();

  // 1. Check code in temp table
  const { data: temp, error: fetchError } = await supabase
    .from("move_temp_registrations")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (fetchError || !temp) {
    return { success: false, error: "No s'ha trobat cap registre pendent." };
  }

  if (temp.verification_code !== code) {
    return { success: false, error: "El codi de verificació no és vàlid." };
  }

  if (new Date(temp.expires_at) < new Date()) {
    return { success: false, error: "El codi ha caducat. Torna a intentar el registre." };
  }

  // 2. Create actual Supabase Auth user
  // We use signUp here. If email confirmation is enabled in dashboard, 
  // it would send another email, so it's best to have it disabled or managed differently.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: temp.email,
    password: temp.payload.password,
    options: {
      data: {
        username: temp.username,
        full_name: temp.payload.name,
      }
    }
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: "Error en crear l'usuari." };
  }

  // 3. Create Profile
  const { error: profileError } = await supabase
    .from("move_profiles")
    .insert([{
      id: authData.user.id,
      username: temp.username,
      full_name: temp.payload.name,
      surname: temp.payload.surname,
      phone: temp.payload.phone,
      location: temp.payload.location
    }]);

  if (profileError) {
    console.error("Profile Error:", profileError);
    return { success: false, error: "Usuari creat però ha fallat la creació del perfil." };
  }

  // 4. Cleanup temp registration
  await supabase.from("move_temp_registrations").delete().eq("email", email);

  return { success: true };
}

/**
 * Simple Login
 */
export async function loginMoveUser(formData: LoginFormData) {
  const { email, password } = formData;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, error: "Correu o contrasenya incorrectes." };
  }

  return { success: true, user: data.user };
}

/**
 * Logout
 */
export async function logoutMoveUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}
