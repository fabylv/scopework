import { NextResponse } from 'next/server';
import { analyzePhoto } from '@/lib/ai/analyzer';

/**
 * POST /api/analyze-photo
 * 
 * Body (multipart form data):
 *   - photo: File (image)
 *   - model: 'openai' | 'anthropic' | 'google' (optional, default: 'openai')
 * 
 * Returns: AnalysisResult JSON
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo');
    const model = formData.get('model') || 'openai';

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    const validModels = ['openai', 'anthropic', 'google'];
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Choose from: ${validModels.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = photo.type || 'image/jpeg';

    const result = await analyzePhoto(base64, mimeType, model);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Photo analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
