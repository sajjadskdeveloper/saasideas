"use client";

import { useState } from "react";
import { Lightbulb, Rocket, Search, Loader } from "lucide-react";
import { getRedditPostLinks, RedditPost } from "@/lib/reddit";

interface CardData {
  title: string;
  description: string;
}

const Card = ({ title, description, icon: Icon, index }: { title: string; description: string; icon: React.ElementType; index: number }) => (
  <div
    className="glass-card p-6 animate-slideInUp"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 mr-4 text-blue-400" />
      <h3 className="text-2xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default function Home() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<CardData[]>([]);
  const [mvps, setMvps] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || loading) return;

    setLoading(true);
    setHasGenerated(true);
    setIdeas([]);
    setMvps([]);
    setError('');

    try {
      // Step 1: Search for reddit posts
      setLoadingStep('Searching for relevant Reddit posts...');
      const searchResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to search for posts.');
      }

      const searchData = await searchResponse.json();
      
      const redditPosts = getRedditPostLinks(searchData);

      if (redditPosts.length === 0) {
        setError('No relevant Reddit posts found. Please try a different topic.');
        setLoading(false);
        return;
      }
      
      // Step 2: Generate ideas from posts
      setLoadingStep('Analyzing posts and generating ideas...');
      const ideasResponse = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redditPosts }),
      });

      if (!ideasResponse.ok) {
        throw new Error('Failed to generate ideas.');
      }

      const data = await ideasResponse.json();
      
      // Simulate network delay for effect
      setTimeout(() => {
        setIdeas(data.ideas);
        setMvps(data.mvps);
        setLoading(false);
        setLoadingStep('');
      }, 1500);

    } catch (error) {
      console.error("Failed to fetch ideas:", error);
      setError('An error occurred. Please try again.');
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-16">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="z-10 w-full max-w-6xl animate-fadeIn">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
            AI Idea Generator
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            Turn your topic into a list of startup ideas and MVPs in seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-12 form-container glass-card p-4">
          <div className="flex items-center">
            <Search className="w-6 h-6 mr-3 text-gray-400" />
            <input
              className="appearance-none bg-transparent border-none w-full text-white placeholder-gray-400 py-2 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="e.g., AI in Healthcare, Sustainable Tech"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button
              className="submit-button flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" />
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center text-white animate-fadeIn">
            <p>{loadingStep}</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 animate-fadeIn">
            <p>{error}</p>
          </div>
        )}

        {hasGenerated && !loading && !error && ideas.length === 0 && mvps.length === 0 && (
          <div className="text-center text-gray-400 animate-fadeIn">
            <p>No ideas generated. Try a different topic!</p>
          </div>
        )}

        {!error && (ideas.length > 0 || mvps.length > 0) && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
            {ideas.length > 0 && (
              <div className="flex flex-col gap-8">
                <h2 className="text-4xl font-bold text-center text-white flex items-center justify-center gap-3">
                  <Lightbulb className="w-8 h-8"/> Startup Ideas
                </h2>
                {ideas.map((idea, index) => (
                  <Card
                    key={`idea-${index}`}
                    {...idea}
                    icon={Lightbulb}
                    index={index}
                  />
                ))}
              </div>
            )}

            {mvps.length > 0 && (
              <div className="flex flex-col gap-8">
                <h2 className="text-4xl font-bold text-center text-white flex items-center justify-center gap-3">
                  <Rocket className="w-8 h-8"/> MVP Suggestions
                </h2>
                {mvps.map((mvp, index) => (
                  <Card
                    key={`mvp-${index}`}
                    {...mvp}
                    icon={Rocket}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
