import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shadow-token',
};

// Server-side secret for HMAC generation
const SECRET_KEY = "ctf_shadowbreak_secret_2024";

// HMAC-SHA256 implementation using Web Crypto API
async function generateHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return first 12 characters for the unique identifier
  return hashHex.substring(0, 12);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pcNo = url.searchParams.get('pc_no');
    
    // Validate pc_no parameter
    if (!pcNo) {
      console.log("Missing pc_no parameter");
      return new Response(
        JSON.stringify({ error: "Missing pc_no parameter" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate X-Shadow-Token header
    const shadowToken = req.headers.get('x-shadow-token');
    console.log(`Request from PC: ${pcNo}, Token: ${shadowToken ? 'provided' : 'missing'}`);
    
    if (!shadowToken || shadowToken !== 'open_sesame') {
      console.log("Invalid or missing X-Shadow-Token header");
      return new Response(
        JSON.stringify({ 
          error: "Forbidden", 
          message: "Access denied. Valid X-Shadow-Token header required." 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate unique identifier using HMAC-SHA256
    const uniqueIdentifier = await generateHMAC(`shadowbreak_mission_${pcNo}`, SECRET_KEY);
    const flag = `flag{shadowbreak_mission_${pcNo}_${uniqueIdentifier}}`;
    
    console.log(`Generated flag for ${pcNo}: ${flag}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        flag: flag,
        message: "Extract the unique identifier (last 12 characters after the final underscore) and submit it to complete Round 3."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in hidden function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
