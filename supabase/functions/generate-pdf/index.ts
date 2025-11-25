import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple HTML to text converter
function htmlToText(html: string): { text: string; structure: any[] } {
  // Remove HTML tags and extract text with basic structure
  const lines: any[] = [];
  
  // Extract header info
  const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const emailMatch = html.match(/Email:.*?href="mailto:(.*?)"/i);
  const phoneMatch = html.match(/Telefone:\s*([^<]+)</i);
  
  if (nameMatch) lines.push({ type: 'title', text: nameMatch[1].trim() });
  if (emailMatch) lines.push({ type: 'contact', text: `Email: ${emailMatch[1].trim()}` });
  if (phoneMatch) lines.push({ type: 'contact', text: `Telefone: ${phoneMatch[1].trim()}` });
  
  // Extract sections
  const sections = html.match(/<section[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/section>/gi);
  if (sections) {
    sections.forEach(section => {
      const idMatch = section.match(/id="([^"]*)"/);
      const titleMatch = section.match(/<h2[^>]*>(.*?)<\/h2>/i);
      
      if (titleMatch) {
        lines.push({ type: 'section', text: titleMatch[1].trim() });
      }
      
      // Extract list items
      const items = section.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (items) {
        items.forEach(item => {
          const text = item.replace(/<[^>]*>/g, '').trim();
          lines.push({ type: 'item', text: `• ${text}` });
        });
      }
      
      // Extract paragraphs
      const paras = section.match(/<p[^>]*>(.*?)<\/p>/gi);
      if (paras) {
        paras.forEach(para => {
          const text = para.replace(/<[^>]*>/g, '').trim();
          if (text && !text.includes('Email:') && !text.includes('Telefone:')) {
            lines.push({ type: 'text', text });
          }
        });
      }
    });
  }
  
  const fullText = lines.map(l => l.text).join('\n');
  return { text: fullText, structure: lines };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { html, area } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Generating PDF for user:', user.id);

    // Convert HTML to structured text
    const { structure } = htmlToText(html);
    
    // Create PDF with pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;
    
    // Area colors
    const colors: any = {
      'Tecnologia': { r: 0.15, g: 0.39, b: 0.92 },
      'Saúde': { r: 0.02, g: 0.59, b: 0.41 },
      'Administrativo': { r: 0.49, g: 0.23, b: 0.93 }
    };
    const primaryColor = colors[area as keyof typeof colors] || { r: 0.15, g: 0.39, b: 0.92 };
    
    // Draw content
    for (const line of structure) {
      if (yPosition < margin + 40) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = height - margin;
      }
      
      switch (line.type) {
        case 'title':
          page.drawText(line.text, {
            x: margin,
            y: yPosition,
            size: 24,
            font: boldFont,
            color: rgb(primaryColor.r, primaryColor.g, primaryColor.b)
          });
          yPosition -= 35;
          break;
          
        case 'contact':
          page.drawText(line.text, {
            x: margin,
            y: yPosition,
            size: 11,
            font: font,
            color: rgb(0.3, 0.3, 0.3)
          });
          yPosition -= 18;
          break;
          
        case 'section':
          yPosition -= 10;
          page.drawText(line.text, {
            x: margin,
            y: yPosition,
            size: 16,
            font: boldFont,
            color: rgb(primaryColor.r, primaryColor.g, primaryColor.b)
          });
          yPosition -= 25;
          break;
          
        case 'item':
          // Wrap long text
          const maxWidth = width - (margin * 2);
          const words = line.text.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = font.widthOfTextAtSize(testLine, 10);
            
            if (textWidth > maxWidth && currentLine) {
              page.drawText(currentLine, {
                x: margin + 10,
                y: yPosition,
                size: 10,
                font: font,
                color: rgb(0.2, 0.2, 0.2)
              });
              yPosition -= 15;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          
          if (currentLine) {
            page.drawText(currentLine, {
              x: margin + 10,
              y: yPosition,
              size: 10,
              font: font,
              color: rgb(0.2, 0.2, 0.2)
            });
            yPosition -= 15;
          }
          break;
          
        case 'text':
          page.drawText(line.text, {
            x: margin,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0.2, 0.2, 0.2)
          });
          yPosition -= 18;
          break;
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}-${area.toLowerCase()}.pdf`;

    console.log('Uploading PDF to storage:', filename);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('curriculos')
      .upload(filename, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('curriculos')
      .getPublicUrl(filename);

    console.log('PDF generated and uploaded successfully');

    return new Response(
      JSON.stringify({
        pdfUrl: urlData.publicUrl,
        storagePath: filename,
        createdAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-pdf:', error);
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
