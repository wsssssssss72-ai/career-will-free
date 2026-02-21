import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Topic } from '../services/api';

interface TopicCardProps {
  topic: Topic;
  onClick: (id: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(topic.topic_id)}
      className="group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 hover:border-emerald-500/30 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
          <BookOpen className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500" />
        </div>
        <div>
          <h4 className="text-zinc-100 font-medium">{topic.topic_name}</h4>
          <p className="text-zinc-500 text-xs mt-0.5">Chapter Content • Videos & PDFs</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
    </motion.div>
  );
};
