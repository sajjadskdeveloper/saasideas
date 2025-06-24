import { NextResponse } from 'next/server';
import { searchGoogle } from '@/lib/google';
import { getRedditPostLinks, getRedditComments, aggregateComments, RedditPost } from '@/lib/reddit';
import { generateIdeasFromComments, generateMvpsFromIdeas } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    console.log('Received topic:', topic);

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // 1. Search Google for Reddit posts
    const searchResults = await searchGoogle(topic);
    console.log('Google Search Results:', JSON.stringify(searchResults, null, 2));

    // 2. Extract Reddit post links from search results
    const redditPosts = getRedditPostLinks(searchResults);
    console.log('Extracted Reddit Posts:', redditPosts);

    if (redditPosts.length === 0) {
      return NextResponse.json({ error: 'No Reddit posts found for this topic.' }, { status: 404 });
    }

    // 3. Fetch comments from each Reddit post
    const allComments = await Promise.all(
      // Limiting to first 5 posts to avoid excessive API calls and long wait times
      redditPosts.slice(0, 5).map(post => getRedditComments(post.subreddit_id, post.post_id))
    );
    console.log('Fetched Reddit Comments (flat array length):', allComments.flat().length);

    // 4. Aggregate all comments into a single text block
    const aggregatedComments = aggregateComments(allComments.flat());
    console.log('Aggregated Comments (first 500 chars):', aggregatedComments.substring(0, 500));

    if (!aggregatedComments.trim()) {
        return NextResponse.json({ error: 'Could not retrieve any comments from the Reddit posts.' }, { status: 404 });
    }

    // 5. Generate ideas from comments using AI
    const ideas = await generateIdeasFromComments(aggregatedComments);
    console.log('Generated Ideas:', ideas);

    // 6. Generate MVPs from the ideas using AI
    const mvps = await generateMvpsFromIdeas(ideas);
    console.log('Generated MVPs:', mvps);

    // 7. Return the final response
    return NextResponse.json({ ideas, mvps });

  } catch (error) {
    console.error('Error in generate-ideas endpoint:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 