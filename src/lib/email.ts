import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WaitlistEmailProps {
  to: string;
  userName: string;
  activityTitle: string;
  activityDate: string;
}

/**
 * Sends an email when a user is promoted from waitlist to joined
 */
export async function sendWaitlistPromotionEmail({ to, userName, activityTitle, activityDate }: WaitlistEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Move Informa info@descobreix.com', // Replace with verified domain if available
      to: [to],
      subject: `🎉 Tens plaça per: ${activityTitle}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #843aea;">Hola ${userName}!</h2>
          <p>Bones notícies! S'ha alliberat una plaça per a l'activitat <strong>${activityTitle}</strong> i ara ja tens la teva confirmada.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Data:</strong> ${activityDate}</p>
          </div>
          <p>T'esperem!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Aquest és un correu automàtic de Move.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: err };
  }
}
