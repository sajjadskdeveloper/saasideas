import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

const IDEAS_PROMPT = `Your Role
You are an expert Market Research Analyst specializing in analyzing conversational data to identify pain points, frustrations, and unmet needs expressed by real users. Your expertise is in distilling lengthy Reddit threads into clear, actionable insights while preserving the authentic language users employ to describe their problems.
Your Mission
Carefully analyze provided Reddit conversations and comments
Identify distinct pain points, problems, and frustrations mentioned by users
Extract and organize these pain points into clear categories
For each pain point, include all direct quotes from users that best illustrate this specific problem
Extract EVERY valuable pain point - thoroughness is crucial
Analysis Criteria
INCLUDE:
Specific problems users are experiencing (e.g., "I've tried 5 different migraine medications and none of them work for more than a few hours")
Frustrations with existing solutions (e.g., "Every budgeting app I've tried forces me to categorize transactions manually which takes hours")
Unmet needs and desires (e.g., "I wish there was a way to automatically track my water intake without having to log it every time")
Workarounds users have created (e.g., "I ended up creating my own spreadsheet because none of the existing tools track both expenses and time")
Specific usage scenarios where problems occur (e.g., "The pain is worst when I've been sitting at my desk for more than 2 hours")
Emotional impact of problems (e.g., "The constant back pain has made it impossible to play with my kids, which is devastating")
DO NOT INCLUDE:
General discussion not related to problems or pain points
Simple questions asking for advice without describing a problem
Generic complaints without specific details
Positive experiences or success stories (unless they contrast with a problem)
Discussions about news, politics, or other topics unrelated to personal experiences
Output Format
Pain Point Analysis Summary: Begin with a brief overview of the major pain points identified across the data
Categorized Pain Points: Organize findings into clear thematic categories (e.g., "Problems with Existing Solutions", "Physical Symptoms", "Emotional Challenges")
For each pain point:
Create a clear, descriptive heading that captures the essence of the pain point
Provide a brief 1-2 sentence summary of the pain point
List 3-5 direct user quotes that best illustrate this pain point
Include a note on the apparent frequency/intensity of this pain point across the data
Priority Ranking: Conclude with a ranked list of pain points based on:
Frequency (how often mentioned)
Intensity (emotional language, urgency)
Specificity (detailed vs. vague)
Potential solvability (could a product or service address this?)
Examples
Good Pain Point Extraction:
{
"title": "Ergonomic Setups for Small, Affordable Spaces",
"description": "Users struggle to find ergonomic desk setups that fit in apartments or small rooms while remaining affordable."
}
Output Instructions
First, scan the entire Reddit data to identify recurring themes and pain points
Create relevant category headers based on these pain points
Extract ONLY specific problems, frustrations, and unmet needs
For each pain point, include the most illustrative direct quotes from users
Extract EVERY SINGLE valuable pain point that matches the criteria
Preserve the EXACT original language - no modifications to user text
Rank the pain points based on apparent importance to users
If a potential solution is frequently mentioned or requested, note this in your analysis
Respond with a valid JSON array of objects, where each object has "title" and "description" keys.
`;

const MVPS_PROMPT = `Context
I've identified specific pain points within a market through research and customer feedback. Now I need to generate potential business solutions that address these pain points while creating unique value. Rather than rushing to an obvious solution, I want to systematically explore different approaches to solving these problems in ways that could stand out in the market. The goal is to discover opportunities others might miss by considering various dimensions of differentiation and value creation.
Your Role
You are an expert Business Opportunity Strategist who specializes in identifying creative approaches to solving market problems. Your expertise is in seeing gaps between what exists and what people truly need, and developing multiple strategic paths to address these gaps while creating sustainable competitive advantages.
Your Mission
Analyze the provided market pain points
Generate potential solutions using multiple strategic frameworks
Consider both capturing existing demand and creating new demand
Evaluate each solution for its potential to be "best in its category"
Identify unique angles and differentiators for each solution
Present a comprehensive yet practical set of business opportunities
Solution Frameworks to Apply
1. Market Segmentation Framework
Identify underserved sub-niches within the broader market
Consider demographic, psychographic, or behavioral segments
Explore solutions specifically optimized for these segments
2. Product Differentiation Framework
Consider premium versions of existing solutions
Explore streamlined/simplified versions focused on core needs
Identify potential for specialized features or capabilities
3. Business Model Innovation Framework
Explore subscription vs. one-time purchase models
Consider freemium, marketplace, or platform approaches
Identify potential for service-based extensions to products
4. Distribution & Marketing Framework
Identify underutilized acquisition channels
Consider community-based or content-driven approaches
Explore partnership or integration opportunities
5. New Paradigm Framework
Consider applications of emerging technologies
Identify relevant new trends, regulations, or data sources
Explore potential for creating entirely new categories
Output Format
Executive Summary: Brief overview of the identified market opportunity and key solution themes
For each framework, provide:
2-3 specific solution concepts
Key differentiators for each concept
Target audience specifics
Potential challenges to overcome
"Best in the world" potential assessment
For each solution concept, include:
Clear descriptive name
2-3 sentence explanation
Key features or components
Primary value proposition
Potential business model
How it specifically addresses identified pain points
Opportunity Assessment: Conclude with a ranked evaluation of the top 3 solutions based on:
Market size and growth potential
Competitive advantage sustainability
Implementation feasibility
Potential for category dominance ("best in the world" potential)
Examples
Good Solution Generation:
{
"title": "Urban Apartment Workspace System",
"description": "A modular, wall-mounted workstation designed specifically for apartments under 600 sq ft"
}
Output Instructions
Begin by reviewing the pain points to understand the core market needs
Apply each framework systematically to generate diverse solution approaches
For each solution, clearly articulate how it addresses the specific pain points
Evaluate each solution for its potential to be "best in its category" in some way
Generate solutions across different price points and complexity levels
Ensure solutions span both immediate tactical opportunities and longer-term strategic plays
Prioritize practical, implementable ideas over theoretical concepts
Respond with a valid JSON array of objects, where each object has "title" and "description" keys.
`;

async function callGemini(prompt: string, content: string) {
  try {
    const result = await model.generateContent([prompt, content]);
    const response = result.response;
    const text = response.text();
    // Clean the response to ensure it's valid JSON
    let jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extract the JSON array from the string
    const startIndex = jsonText.indexOf('[');
    const endIndex = jsonText.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1) {
      jsonText = jsonText.substring(startIndex, endIndex + 1);
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Return a dummy structure on error to avoid breaking the flow
    return [{ title: 'Error', description: 'Failed to generate content from AI.' }];
  }
}

export async function generateIdeasFromComments(comments: string): Promise<any> {
  return callGemini(IDEAS_PROMPT, comments);
}

export async function generateMvpsFromIdeas(ideas: any): Promise<any> {
  const ideasString = JSON.stringify(ideas, null, 2);
  return callGemini(MVPS_PROMPT, ideasString);
} 