// src/lib/reddit.ts

export interface RedditPost {
  subreddit_id: string;
  post_id: string;
  full_url: string;
}

export function getRedditPostLinks(googleResults: any): RedditPost[] {
  const links: RedditPost[] = [];
  if (googleResults && googleResults.items) {
    for (const item of googleResults.items) {
      if (item.link) {
        const matches = item.link.match(/reddit\.com\/r\/([^\/]+)\/comments\/([^\/]+)/);
        if (matches && matches.length >= 3) {
          links.push({
            subreddit_id: matches[1],
            post_id: matches[2],
            full_url: item.link,
          });
        }
      }
    }
  }
  return links;
}

export async function getRedditComments(subreddit: string, postId: string): Promise<any[]> {
  const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
  console.log(url);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      // It's possible for posts to be deleted or removed, so we can return empty array
      console.warn(`Failed to fetch Reddit comments for ${url}, status: ${response.status}`);
      return [];
    }
    const data = await response.json();
    // The comments are the second element in the response array
    return data[1]?.data?.children.map((c: any) => c.data) || [];
  } catch (error) {
    console.error(`Error fetching Reddit comments from ${url}:`, error);
    return []; // Return empty array on error to not fail the whole process
  }
}

export function aggregateComments(comments: any[]): string {
    return comments.map(comment => comment.body).filter(Boolean).join('\n\n');
} 