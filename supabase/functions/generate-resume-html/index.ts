import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, improve = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build tone and instructions based on area
    const toneInstructions = {
      Tecnologia: `
        - Use linguagem técnica e objetiva
        - Destaque stack técnica, frameworks e ferramentas
        - Inclua métricas e resultados quantificáveis (ex: "Aumentou performance em 40%")
        - Foco em projetos e conquistas mensuráveis
        - Habilidades devem incluir tecnologias específicas
      `,
      Saúde: `
        - Use linguagem empática e profissional
        - Destaque certificações, registro profissional e formação
        - Inclua experiência clínica e áreas de especialização
        - Foco em cuidado ao paciente e competências técnicas da área
        - Tom humano e ético
      `,
      Administrativo: `
        - Use linguagem formal e corporativa
        - Destaque organização, gestão de processos e eficiência
        - Inclua resultados em otimização e produtividade
        - Foco em liderança, comunicação e sistemas
        - Tom profissional e orientado a resultados
      `
    };

    const templateColors = {
      Tecnologia: { primary: '#2563eb', accent: '#3b82f6' },
      Saúde: { primary: '#059669', accent: '#10b981' },
      Administrativo: { primary: '#7c3aed', accent: '#8b5cf6' }
    };

    const colors = templateColors[data.area as keyof typeof templateColors];

    const systemPrompt = `Você é um especialista em criação de currículos profissionais corporativos.

INSTRUÇÕES CRÍTICAS:
1. Retorne APENAS HTML puro + CSS inline. Sem markdown, sem explicações.
2. Use fontes web-safe: Arial, Helvetica, Georgia, sans-serif
3. Layout profissional, corporativo, limpo, moderno
4. Margens adequadas para impressão (mínimo 18px)
5. Estrutura semântica obrigatória:
   - <header> com dados pessoais
   - <section id="resumo"> com resumo profissional
   - <section id="habilidades"> com lista de habilidades
   - <section id="experiencia"> com experiências profissionais

TONS POR ÁREA:
${toneInstructions[data.area as keyof typeof toneInstructions]}

MELHORIAS AUTOMÁTICAS:
${improve ? '- MELHORE o texto para torná-lo mais profissional, ATS-friendly e impactante' : '- Mantenha o texto original, apenas formate'}
- Transforme descrições em bullet points curtos e impactantes
- Use verbos de ação no passado
- Mantenha a veracidade - não invente informações

CORES DO TEMPLATE:
- Primária: ${colors.primary}
- Destaque: ${colors.accent}

CSS INLINE OBRIGATÓRIO - COMPATÍVEL COM PUPPETEER:
- Largura máxima: 800px
- Fonte padrão: 16px
- Espaçamentos generosos
- Sem position:fixed, sem animations complexas
- Background branco, texto preto principal`;

    const userPrompt = `
Área: ${data.area}

Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}

Resumo Profissional:
${data.resumo || 'Profissional qualificado e dedicado'}

Habilidades:
${data.habilidades || 'Diversas habilidades profissionais'}

Experiências:
${data.experiencias.map((exp: any, i: number) => `
${i + 1}. ${exp.cargo} - ${exp.empresa}
   Período: ${exp.periodo}
   ${exp.descricao}
`).join('\n')}

Gere um currículo HTML completo, profissional e corporativo seguindo todas as instruções acima.
`;

    console.log('Calling Lovable AI for resume generation...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    let html = aiData.choices[0].message.content;
    
    // Extract HTML if wrapped in markdown
    const htmlMatch = html.match(/```html\n([\s\S]*?)\n```/);
    if (htmlMatch) {
      html = htmlMatch[1];
    }

    // Clean up any remaining markdown
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();

    console.log('Resume HTML generated successfully');

    return new Response(
      JSON.stringify({ html }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-resume-html:', error);
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
