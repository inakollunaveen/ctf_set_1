import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Same secret as hidden endpoint for consistent flag generation
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
  
  return hashHex.substring(0, 12);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pc_no, submitted_identifier } = await req.json();
    
    if (!pc_no || !submitted_identifier) {
      return new Response(
        JSON.stringify({ error: "Missing pc_no or submitted_identifier" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate expected identifier for this PC
    const expectedIdentifier = await generateHMAC(`shadowbreak_mission_${pc_no}`, SECRET_KEY);
    
    console.log(`Validating for ${pc_no}: submitted=${submitted_identifier}, expected=${expectedIdentifier}`);

    const isValid = submitted_identifier.toLowerCase() === expectedIdentifier.toLowerCase();

    return new Response(
      JSON.stringify({ 
        valid: isValid,
        message: isValid ? "Correct! Flag validated successfully." : "Invalid identifier. Try again."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in validate-flag function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
