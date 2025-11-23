import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const prompt = `
Gere um currículo profissional em formato JSON com base nos seguintes dados:

Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}
Resumo: ${data.resumo}
Habilidades: ${data.habilidades}

Experiências:
${data.experiencias.map((exp: any, i: number) => `
${i + 1}. ${exp.cargo} na ${exp.empresa}
   Período: ${exp.periodo}
   ${exp.descricao}
`).join('\n')}

Retorne APENAS um JSON válido no seguinte formato:
{
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "resumo": "string",
  "habilidades": ["string"],
  "experiencias": [
    {
      "cargo": "string",
      "empresa": "string",
      "periodo": "string",
      "descricao": "string"
    }
  ]
}
`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em criação de currículos. Retorne APENAS JSON válido, sem explicações adicionais.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Extract JSON from response (in case it's wrapped in markdown)
    let resumeJSON;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      resumeJSON = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse JSON:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Save to database
    const { data: savedResume, error: insertError } = await supabaseClient
      .from('resumes')
      .insert({
        user_id: user.id,
        resume_json: resumeJSON
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ resume: savedResume }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-resume:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
