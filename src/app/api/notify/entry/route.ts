import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || token === 'preview') return new NextResponse('OK', { status: 200 });

    const supabase = await createClient();

    // 1. Get token and company info
    const { data: tokenData } = await supabase
      .from('access_tokens')
      .select('*, companies(name)')
      .eq('token', token)
      .maybeSingle();

    if (!tokenData) return new NextResponse('Invalid token', { status: 200 });

    const companyName = tokenData.companies?.name || 'Visitant desconegut';

    // 2. Send Email via Resend
    // Skip if no API key is configured yet to avoid 500s
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Portfolio Notification <onboarding@resend.dev>',
        to: 'marcg.design@gmail.com', // User's email from Prompt
        subject: `🚀 Entrada detectada: ${companyName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
            <h2>Nova visita al portfolio!</h2>
            <p>L'empresa <strong>${companyName}</strong> acaba d'entrar utilitzant el seu enllaç personalitzat.</p>
            <p><strong>Detalls del token:</strong></p>
            <ul>
              <li>Token: <code>${token}</code></li>
              <li>Data/Hora: ${new Date().toLocaleString('ca-ES')}</li>
            </ul>
            <hr />
            <p><a href="${process.env.NEXT_PUBLIC_SUPABASE_URL}">Veure analítiques al panel de control</a></p>
          </div>
        `,
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Notification error:', err);
    return new NextResponse('OK', { status: 200 }); // Silent fail
  }
}
