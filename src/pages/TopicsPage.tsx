import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, BookOpen, GraduationCap } from 'lucide-react';
import { apiService, Topic } from '../services/api';
import { TopicCard } from '../components/TopicCard';

export const TopicsPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTopics = async () => {
    if (!batchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTopics(batchId);
      if (data.length === 0) {
        setError("No topics found for this batch.");
      }
      setTopics(data);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      setError("Failed to load topics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [batchId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Batches</span>
          </button>
          
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-500" />
            <span className="font-bold tracking-tight">CAREERWILL</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold">Course Topics</h1>
          </div>
          <p className="text-zinc-500 text-lg">Select a topic to start learning. Each topic contains video lectures and study notes.</p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-400 mb-6">{error}</p>
            <button 
              onClick={fetchTopics}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {topics.map((topic) => (
              <TopicCard 
                key={topic.topic_id} 
                topic={topic} 
                onClick={(topicId) => navigate(`/learn/${batchId}/${topicId}`)} 
              />
            ))}
            
            {topics.length === 0 && (
              <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                <p className="text-zinc-500">No topics available for this batch yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};
