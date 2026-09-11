import { NextResponse } from 'next/server';
import { getOllamaStatus } from '../../../../lib/ai/ollama';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getOllamaStatus();
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve AI service status',
      },
      { status: 500 }
    );
  }
}
