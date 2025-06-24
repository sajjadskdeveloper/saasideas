import { NextResponse } from 'next/server';
import { generateIdeasFromComments, generateMvpsFromIdeas } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { aggregatedComments } = await request.json();
    console.log('Received aggregatedComments (first 500 chars):', aggregatedComments.substring(0, 500));

    if (!aggregatedComments || !aggregatedComments.trim()) {
        return NextResponse.json({ error: 'Aggregated comments are required' }, { status: 400 });
    }

    // Generate ideas from comments using AI
    const ideas = await generateIdeasFromComments(aggregatedComments);
    console.log('Generated Ideas:', ideas);

    // Generate MVPs from the ideas using AI
    const mvps = await generateMvpsFromIdeas(ideas);
    console.log('Generated MVPs:', mvps);

    // Return the final response
    return NextResponse.json({ ideas, mvps });

  } catch (error) {
    console.error('Error in generate-ideas endpoint:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 