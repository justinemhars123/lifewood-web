import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const resendApiKey = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, message, subject } = await req.json()

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        // For Resend free accounts, you can only send from onboarding@resend.dev TO the email address you verified on Resend.
        // Once you verify your domain, change this to: from: 'Admin <admin@yourdomain.com>'
        from: 'Lifewood Admin <onboarding@resend.dev>', 
        to: [email],
        subject: subject || 'Lifewood Application Update',
        text: message,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || "Failed to send email via Resend");
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
