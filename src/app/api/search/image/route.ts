import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

  // Convert image to base64 (for non-OpenAI fallbacks) and keep original file for OpenAI
  const bytes = await imageFile.arrayBuffer();
  const base64Image = Buffer.from(bytes).toString('base64');

  // Analyze image using AI vision (OpenAI preferred)
  const { keywords: imageAnalysis, object: detectedObject, source, debug } = await analyzeImageWithAI(imageFile, base64Image);
    
    // Search assets based on analysis
    const searchResults = await searchAssetsByDescription(imageAnalysis);

    return NextResponse.json({
      analysis: imageAnalysis,
      object: detectedObject,
      source,
      debug,
      results: searchResults,
      totalResults: searchResults.length
    });

  } catch (error) {
    console.error('Error in image search:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

type AnalysisResult = { keywords: string; object: string; source: 'openai' | 'google' | 'fallback'; debug?: Record<string, unknown> };

async function analyzeImageWithAI(imageFile: File, base64Image: string): Promise<AnalysisResult> {
  try {
    // 1) OpenAI Responses API with file upload (most accurate)
  if (process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Convert Web File to a Node-compatible file for upload
      const uploadable = await toFile(Buffer.from(await imageFile.arrayBuffer()), imageFile.name || 'uploaded-image', {
        type: imageFile.type || 'application/octet-stream',
      });

  const uploadedFile = await client.files.create({ file: uploadable, purpose: 'user_data' });

  // Primary prompt: return strict JSON with object + keywords
  const prompt = [
        {
          role: 'user' as const,
          content: [
            {
              type: 'input_file' as const,
              file_id: uploadedFile.id,
            },
            {
              type: 'input_text' as const,
              text:
        'You are an expert 3D/CAD object identifier for a 3D asset library. Analyze the image and return STRICT JSON with fields: {"object": string, "keywords": string[]}. Rules: 1) object is the most specific common name (e.g., "spur gear", "bottle", "office chair"). 2) keywords array has 10-15 short search terms in English, starting with the object and its synonyms. 3) If the object is a toothed circular mechanical component (external teeth around circumference), classify as "gear"/"spur gear"/"sprocket" (NOT car wheel). Avoid vehicle-related terms unless a car is clearly visible without gear teeth. Output JSON only.',
            },
          ],
        },
      ];

  const response = await client.responses.create({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
        input: prompt,
      });

      // Prefer the SDK's aggregated text field
      const primaryText = (response as { output_text?: string }).output_text ?? '';
      let text = primaryText;
      // Fallback: attempt to read from output.content structure without using 'any'
      if (!text) {
        type ResponsesOutput = { output?: Array<{ content?: Array<{ text?: string }> }> };
        const alt = (response as unknown as ResponsesOutput).output?.[0]?.content?.[0]?.text;
        if (typeof alt === 'string') text = alt;
      }

      // Try parse strict JSON; fallback to CSV
      let parsedObject = '';
      let parsedKeywords: string[] = [];
      try {
        const parsed = JSON.parse(text);
        parsedObject = (parsed.object ? String(parsed.object) : '').toLowerCase();
        parsedKeywords = Array.isArray(parsed.keywords) ? parsed.keywords.map((k: string) => String(k).toLowerCase()) : [];
      } catch {
        // Not JSON; attempt to split CSV
        if (text.includes(',')) {
          parsedKeywords = text
            .split(',')
            .map((k: string) => k.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 15);
        }
      }

      // Second pass: force a gear/non-gear classification if initial is empty/generic
      const generic = (!parsedObject || /^(object|model|item|thing)$/.test(parsedObject)) && parsedKeywords.length < 3;
      if (generic) {
        const refine = await client.responses.create({
          model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
          input: [
            {
              role: 'user',
              content: [
                { type: 'input_file', file_id: uploadedFile.id },
                { type: 'input_text', text: 'Strictly classify this image as {"class": "gear"|"wheel"|"other"}. Treat toothed circular mechanical components as "gear" (spur/helical/sprocket). Output JSON only.' }
              ]
            }
          ]
        });
        const refineText = (refine as { output_text?: string }).output_text ?? '';
        try {
          const r = JSON.parse(refineText);
          if (r?.class === 'gear') {
            parsedObject = 'gear';
            parsedKeywords = enforceObjectAndSynonyms(parsedObject, parsedKeywords);
          }
        } catch {}
      }

      // Finalize keywords
      const merged = enforceObjectAndSynonyms(parsedObject, parsedKeywords);
      if (merged.length) {
        return { keywords: merged.join(', '), object: parsedObject || (merged[0] ?? ''), source: 'openai', debug: { primaryText: text } };
      }
    }

    // Try Google Cloud Vision API as second option
    if (process.env.GOOGLE_CLOUD_API_KEY) {
      const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
              ]
            }
          ]
        })
      });

      if (visionResponse.ok) {
        const visionResult = await visionResponse.json();
        const labels = visionResult.responses[0]?.labelAnnotations || [];
        const objects = visionResult.responses[0]?.localizedObjectAnnotations || [];
        
        const keywords = [
          ...labels.map((label: { description: string }) => label.description.toLowerCase()),
          ...objects.map((obj: { name: string }) => obj.name.toLowerCase())
        ].slice(0, 8).join(', ');

        if (keywords) {
          const merged = enforceObjectAndSynonyms('', keywords.split(',').map((s: string) => s.trim()));
          return { keywords: merged.join(', '), object: '', source: 'google', debug: { labels: labels.slice(0, 5) } };
        }
      }
    }
    
    // Deterministic fallback
    return { keywords: await fallbackImageAnalysis(), object: '', source: 'fallback' };
    
  } catch (error) {
    console.error('Error in AI analysis:', error);
  return { keywords: 'object, 3d, model', object: '', source: 'fallback', debug: { error: String(error) } };
  }
}

function enforceObjectAndSynonyms(objectTerm: string, keywords: string[]): string[] {
  const out = new Set<string>();
  const push = (v: string) => {
    const s = v.trim().toLowerCase();
    if (s) out.add(s);
  };

  if (objectTerm) push(objectTerm);
  keywords.forEach(push);

  // Explicit gear detection and correction: if object looks like a gear but keywords skew automotive
  const hasAutomotiveBias = Array.from(out).some(k => /\b(car|vehicle|automotive|sedan|truck|engine|chassis|wheel)\b/.test(k));
  const hasGear = Array.from(out).some(k => /\b(gear|sprocket|cog|spur gear)\b/.test(k));

  // If object term already indicates a gear
  if (/\b(gear|sprocket|cog|spur gear)\b/.test(objectTerm)) {
    addGearSynonyms(out);
  }

  // If automotive bias but no car context, prefer gear when circular mechanical is likely
  if (!hasGear && hasAutomotiveBias) {
    // Heuristic correction: add gear family terms
    addGearSynonyms(out);
  }

  // Always ensure we limit and keep uniqueness
  return Array.from(out).slice(0, 20);
}

function addGearSynonyms(set: Set<string>) {
  ['gear', 'spur gear', 'cog', 'sprocket', 'teeth', 'mechanical', 'industrial', 'machinery', 'transmission'].forEach(k => set.add(k));
}

async function fallbackImageAnalysis(): Promise<string> {
  // Deterministic, neutral fallback to avoid misleading results when AI is unavailable.
  // We intentionally avoid random guessing. Encourage the client to show a hint to retry.
  return 'object, 3d, model';
}

function expandKeywords(raw: string): string[] {
  const base = raw
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(Boolean);
  const add = new Set<string>();
  for (const k of base) {
    // Stemming-lite
    if (k.endsWith('s')) add.add(k.slice(0, -1));
    if (k.endsWith('ing')) add.add(k.slice(0, -3));
    if (k.endsWith('ed')) add.add(k.slice(0, -2));
    // Synonyms for common objects
    if (k.includes('gear')) ['cog', 'sprocket', 'teeth', 'mechanical', 'industrial'].forEach(w => add.add(w));
    if (k.includes('bottle')) ['container', 'cylindrical', 'plastic', 'glass'].forEach(w => add.add(w));
    if (k.includes('chair')) ['seat', 'furniture'].forEach(w => add.add(w));
    if (k.includes('car')) ['vehicle', 'automotive'].forEach(w => add.add(w));
  }
  return Array.from(new Set([...base, ...Array.from(add)])).slice(0, 30);
}

async function searchAssetsByDescription(keywords: string) {
  const keywordArray = expandKeywords(keywords);
  
  try {
    // Search in GalleryItems based on keywords with better scoring
    const assets = await prisma.galleryItem.findMany({
      where: {
        isApproved: true,
        OR: [
          // Direct matches in title (highest priority)
          ...keywordArray.map(keyword => ({
            title: { contains: keyword, mode: 'insensitive' as const }
          })),
          // Matches in description (medium priority)
          ...keywordArray.map(keyword => ({
            description: { contains: keyword, mode: 'insensitive' as const }
          })),
          // Matches in category (lower priority)
          ...keywordArray.map(keyword => ({
            category: { contains: keyword, mode: 'insensitive' as const }
          })),
          // Fuzzy matches for better results
          ...keywordArray.flatMap(keyword => {
            const stem = keyword.length > 3 ? keyword.slice(0, -1) : '';
            return stem ? [
              { title: { contains: stem, mode: 'insensitive' as const } },
              { description: { contains: stem, mode: 'insensitive' as const } }
            ] : [];
          })
        ]
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        description: true,
        category: true,
        price: true,
        posterUrl: true,
        fileUrl: true,
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 20
    });

    // Score and sort results based on keyword relevance
  const scoredAssets = assets.map(asset => {
      let score = 0;
      const titleLower = (asset.title || '').toLowerCase();
      const descLower = (asset.description || '').toLowerCase();
      const categoryLower = asset.category.toLowerCase();
      
      keywordArray.forEach(keyword => {
        // Title matches get highest score
        if (titleLower.includes(keyword)) score += 10;
        // Category matches get medium score  
        if (categoryLower.includes(keyword)) score += 7;
        // Description matches get lower score
        if (descLower.includes(keyword)) score += 3;
        // Partial matches get minimal score
        if (titleLower.includes(keyword.slice(0, -1))) score += 2;
      });
      
      return { ...asset, score };
    });

    // Sort by score (highest first) then by creation date
    const sortedAssets = scoredAssets
      .filter(asset => asset.score > 0) // Only return assets with some relevance
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newer first if same score
      });

    return sortedAssets.map(asset => ({
      id: asset.id,
      name: asset.title,
      description: asset.description,
      category: asset.category,
      price: asset.price.toString(),
      posterUrl: asset.posterUrl,
      fileUrl: asset.fileUrl,
      author: {
        name: asset.author?.name || 'Unknown'
      }
    }));
  } catch (error) {
    console.error('Error searching assets:', error);
    return [];
  }
}
