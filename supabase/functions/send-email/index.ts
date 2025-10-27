// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface EmailRequest {
  to: string;
  name: string;
  surname?: string;
  type: 'approval' | 'decline' | 'position_update' | 'your_turn';
  queuePosition?: number;
  estimatedTime?: string;
  reason?: string;
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateEmailContent(type: string, name: string, surname?: string, queuePosition?: number, estimatedTime?: string, reason?: string): { subject: string, html: string } {
  const fullName = surname ? `${name} ${surname}` : name;
  const logoUrl = 'https://imiojmzohfizckxbnfmk.supabase.co/storage/v1/object/public/AFMA/lg.jpg';
  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #8B1538 0%, #6B0F28 100%); }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      .header { background: linear-gradient(135deg, #8B1538 0%, #6B0F28 100%); color: white; padding: 30px; text-align: center; }
      .logo { width: 120px; height: 120px; border-radius: 60px; margin: 0 auto 20px; display: block; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
      .church-name { font-size: 24px; font-weight: bold; margin: 10px 0; letter-spacing: 1px; }
      .content { padding: 30px; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-top: 1px solid #eee; }
      .button { display: inline-block; background: linear-gradient(135deg, #8B1538 0%, #6B0F28 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; }
      .status-box { background: #f8f9fa; border-left: 4px solid #8B1538; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
  `;

  switch (type) {
    case 'approval':
      return {
        subject: '✅ Your AFMA Church Consultation Request Has Been Approved',
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="AFMA Church Logo" class="logo">
              <div class="church-name">AFMA Church</div>
              <h1>🙏 Request Approved - God Bless</h1>
            </div>
            <div class="content">
              <h2>Dear ${fullName},</h2>
              <p>We are pleased to inform you that your consultation request has been graciously approved by our pastoral leadership team.</p>
              <div class="status-box">
                <strong>📋 Your Queue Position: #${queuePosition}</strong><br>
                <strong>⏰ Estimated Wait Time: ${estimatedTime}</strong>
              </div>
              <p>We kindly ask for your patience as we work through each consultation with care, prayer, and attention. You will receive timely updates as your position in the queue progresses.</p>
              <p>Please remain available and prepared for your consultation. We look forward to serving you in fellowship and spiritual guidance.</p>
              <p>May God's peace be with you as you wait.</p>
              <p><em>In His service,</em><br><strong>AFMA Church Pastoral Team</strong></p>
            </div>
            <div class="footer">
              <p>AFMA Church - Serving in Faith, Love & Unity<br>
              <small>This is an automated notification from our consultation management system.</small></p>
            </div>
          </div>
        `
      };

    case 'decline':
      return {
        subject: '📋 AFMA Church Consultation Request - Update Required',
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="AFMA Church Logo" class="logo">
              <div class="church-name">AFMA Church</div>
              <h1>📋 Consultation Request Update</h1>
            </div>
            <div class="content">
              <h2>Dear ${fullName},</h2>
              <p>Thank you for submitting your consultation request to AFMA Church. After prayerful consideration by our pastoral team, we need to provide you with an important update regarding your request.</p>
              <div class="status-box">
                <strong>Update Details:</strong><br>
                ${reason || 'Please contact our church office for additional information and guidance on next steps.'}
              </div>
              <p>We want to assure you that this decision was made with careful prayer and consideration for your spiritual well-being and the needs of our congregation.</p>
              <p>Please do not hesitate to reach out to our pastoral team if you have any questions or would like to discuss alternative ways we can support you in your spiritual journey.</p>
              <p>You remain in our thoughts and prayers.</p>
              <p><em>In Christian love and service,</em><br><strong>AFMA Church Pastoral Team</strong></p>
            </div>
            <div class="footer">
              <p>AFMA Church - Serving in Faith, Love & Unity<br>
              <small>This is an automated notification from our consultation management system.</small></p>
            </div>
          </div>
        `
      };

    case 'position_update':
      return {
        subject: `📍 AFMA Church Consultation Queue Update - Position #${queuePosition}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="AFMA Church Logo" class="logo">
              <div class="church-name">AFMA Church</div>
              <h1>📍 Consultation Queue Update</h1>
            </div>
            <div class="content">
              <h2>Dear ${fullName},</h2>
              <p>We are writing to provide you with an update on your position in our consultation queue.</p>
              <div class="status-box">
                <strong>📋 Current Queue Position: #${queuePosition}</strong><br>
                <strong>⏰ Estimated Wait Time: ${estimatedTime}</strong>
              </div>
              <p>We deeply appreciate your patience as our pastoral team works diligently to provide each member with the time, attention, and spiritual guidance they deserve.</p>
              <p>Please continue to remain available, as you will receive another notification when it is your turn for consultation.</p>
              <p>We encourage you to use this waiting time for personal prayer and reflection.</p>
              <p><em>Blessings and peace,</em><br><strong>AFMA Church Pastoral Team</strong></p>
            </div>
            <div class="footer">
              <p>AFMA Church - Serving in Faith, Love & Unity<br>
              <small>This is an automated notification from our consultation management system.</small></p>
            </div>
          </div>
        `
      };

    case 'your_turn':
      return {
        subject: '🔔 AFMA Church Consultation - Please Come Forward',
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="AFMA Church Logo" class="logo">
              <div class="church-name">AFMA Church</div>
              <h1>🔔 Your Consultation is Ready</h1>
            </div>
            <div class="content">
              <h2>Dear ${fullName},</h2>
              <p><strong>The time has come for your scheduled consultation.</strong> Our pastoral team is now ready to meet with you and provide the spiritual guidance you have requested.</p>
              <div class="status-box">
                <strong>✅ You are now being called for consultation</strong><br>
                <strong>📍 Please proceed to the pastoral office immediately</strong><br>
                <strong>🙏 Come with a prayerful heart</strong>
              </div>
              <p>Please bring any relevant documents, questions, or concerns you would like to discuss during your consultation.</p>
              <p>We are honored to serve you and look forward to this time of fellowship and spiritual guidance.</p>
              <p>May this consultation be a blessing to you and strengthen your walk with the Lord.</p>
              <p><em>In His love and service,</em><br><strong>AFMA Church Pastoral Team</strong></p>
            </div>
            <div class="footer">
              <p>AFMA Church - Serving in Faith, Love & Unity<br>
              <small>This is an automated notification from our consultation management system.</small></p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: 'AFMA Church Consultation Notification',
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="AFMA Church Logo" class="logo">
              <div class="church-name">AFMA Church</div>
              <h1>Consultation Notification</h1>
            </div>
            <div class="content">
              <h2>Dear ${fullName},</h2>
              <p>This is a notification regarding your consultation request with AFMA Church.</p>
              <p>If you have any questions or concerns, please do not hesitate to contact our church office.</p>
              <p><em>In Christian fellowship,</em><br><strong>AFMA Church Pastoral Team</strong></p>
            </div>
            <div class="footer">
              <p>AFMA Church - Serving in Faith, Love & Unity</p>
            </div>
          </div>
        `
      };
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    const { to, name, surname, type, queuePosition, estimatedTime, reason }: EmailRequest = await req.json();

    if (!to || !name || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, name, type' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { subject, html } = generateEmailContent(type, name, surname, queuePosition, estimatedTime, reason);

    // Use Resend's testing domain which works immediately
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AFMA Church <noreply@mmqtech.co.za>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Resend API error: ${emailResponse.status} - ${errorData}`);
    }

    const result = await emailResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via mmqtech.co.za',
        emailId: result.id,
        recipient: to
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{
      "to": "user@example.com",
      "name": "John Doe",
      "type": "approval",
      "queuePosition": 3,
      "estimatedTime": "15 minutes"
    }'

*/
