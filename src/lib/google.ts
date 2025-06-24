// src/lib/google.ts

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

const SEARCH_QUERY_TEMPLATE = '"{topic}" (site:reddit.com inurl:comments|inurl:thread | intext:"I think"|"I feel"|"I was"|"I have been"|"I experienced"|"my experience"|"in my opinion"|"IMO"| "my biggest struggle"|"my biggest fear"|"I found that"|"I learned"|"I realized"|"my advice"| "struggles"|"problems"|"issues"|"challenge"|"difficulties"|"hardships"|"pain point"| "barriers"|"obstacles"|"concerns"|"frustrations"|"worries"|"hesitations"|"what I wish I knew"|"what I regret")';

export async function searchGoogle(topic: string): Promise<any> {
  const q = SEARCH_QUERY_TEMPLATE.replace('{topic}', topic);
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(q)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Search API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Google:', error);
    throw error;
  }
} 