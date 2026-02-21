import React from 'react';
import { motion } from 'motion/react';
import { Play, FileText, ChevronRight } from 'lucide-react';
import { Batch } from '../services/api';
import { getBatchThumbnail } from '../utils';

interface BatchCardProps {
  batch: Batch;
  onClick: (id: string) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({ batch, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(batch.batch_id)}
      className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10"
    >
      <div className="aspect-video w-full overflow-hidden relative">
        <img
          src={getBatchThumbnail(batch.batch_id)}
          alt={batch.batch_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <span className="px-2 py-1 bg-emerald-500 text-[10px] font-bold text-white rounded uppercase tracking-wider">
            Premium
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-zinc-100 font-semibold text-lg leading-tight mb-4 line-clamp-2 min-h-[3.5rem]">
          {batch.batch_name}
        </h3>
        <div className="flex items-center justify-between text-zinc-500 text-sm">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> 120+
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 45+
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};
