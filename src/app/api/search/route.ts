import { NextResponse } from 'next/server';
import { searchGoogle } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    console.log('Received topic for search:', topic);

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const searchResults = await searchGoogle(topic);
    // We are not doing this here anymore, it will be done on the client
    // console.log('Google Search Results:', JSON.stringify(searchResults, null, 2));

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Error in search endpoint:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 