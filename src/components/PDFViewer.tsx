import React, { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PDFViewerProps {
  url: string;
  title: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, title }) => {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-bottom border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Download className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-zinc-100 font-medium text-sm truncate max-w-[200px]">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-800 rounded-lg p-1">
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-all"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-zinc-500 min-w-[45px] text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-all"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <a 
            href={url} 
            download 
            className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-950 p-8 flex justify-center">
        <motion.div 
          style={{ width: `${zoom}%` }}
          className="bg-white shadow-2xl min-h-[800px] w-full max-w-4xl flex items-center justify-center text-zinc-400"
        >
          <iframe
            src={url}
            className="w-full h-full min-h-[800px]"
            title={title}
          />
        </motion.div>
      </div>

      <div className="p-3 border-t border-zinc-800 flex justify-center gap-4 bg-zinc-900/50">
        <button className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Previous Page
        </button>
        <div className="h-4 w-px bg-zinc-800 self-center" />
        <button className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm">
          Next Page <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
