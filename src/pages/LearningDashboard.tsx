import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Play, FileText, Download, Share2, Info, ListVideo, FileStack } from 'lucide-react';
import { apiService, TopicContent, VideoContent, NoteContent } from '../services/api';
import { VideoPlayer } from '../components/VideoPlayer';
import { PDFViewer } from '../components/PDFViewer';
import { cn } from '../utils';

export const LearningDashboard: React.FC = () => {
  const { batchId, topicId } = useParams<{ batchId: string; topicId: string }>();
  const [content, setContent] = useState<TopicContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoContent | null>(null);
  const [activeNote, setActiveNote] = useState<NoteContent | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'notes'>('videos');
  
  const navigate = useNavigate();

  const fetchContent = async () => {
    if (!batchId || !topicId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getContent(batchId, topicId);
      setContent(data);
      if (data.videos && data.videos.length > 0) {
        handleVideoSelect(data.videos[0]);
      } else if (data.notes && data.notes.length > 0) {
        setActiveNote(data.notes[0]);
        setActiveTab('notes');
      } else {
        setError("No content found for this topic.");
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [batchId, topicId]);

  const handleVideoSelect = async (video: VideoContent) => {
    if (video.url) {
      window.open(video.url, '_blank');
      return;
    }
    
    setActiveVideo(video);
    setActiveNote(null);
    setStreamUrl(null);
    
    if (video.video_id) {
      try {
        const url = await apiService.getVideoStream(video.video_id);
        setStreamUrl(url);
      } catch (error) {
        console.error("Failed to fetch stream url:", error);
      }
    }
  };

  const handleNoteSelect = (note: NoteContent) => {
    setActiveNote(note);
    setActiveVideo(null);
    setStreamUrl(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
          <Info className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Content Unavailable</h2>
        <p className="text-zinc-500 text-center max-w-md mb-8">{error}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(`/batch/${batchId}`)}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={fetchContent}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/batch/${batchId}`)}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="h-6 w-px bg-zinc-800" />
          <h1 className="font-semibold text-lg truncate max-w-[300px]">
            {activeVideo?.title || activeNote?.title || "Learning Dashboard"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Player Area */}
        <div className="flex-1 flex flex-col bg-black overflow-y-auto">
          <div className="w-full">
            {activeVideo && streamUrl ? (
              <VideoPlayer src={streamUrl} title={activeVideo.title} />
            ) : activeNote ? (
              <div className="h-[calc(100vh-4rem)]">
                <PDFViewer url={activeNote.file} title={activeNote.title} />
              </div>
            ) : (
              <div className="aspect-video bg-zinc-900 flex items-center justify-center">
                <p className="text-zinc-500">Select content to start learning</p>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{activeVideo?.title || activeNote?.title}</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
                  LIVE NOW
                </span>
                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-full">
                  HD 1080P
                </span>
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Welcome to this comprehensive session. In this lecture, we cover the core concepts and practical applications of the topic. 
              Make sure to download the PDF notes from the sidebar for your reference.
            </p>
          </div>
        </div>

        {/* Right Side: Content Sidebar */}
        <aside className="w-full lg:w-[400px] border-l border-zinc-900 bg-zinc-950 flex flex-col">
          <div className="flex border-b border-zinc-900">
            <button 
              onClick={() => setActiveTab('videos')}
              className={cn(
                "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all relative",
                activeTab === 'videos' ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <ListVideo className="w-4 h-4" />
              Videos
              {activeTab === 'videos' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={cn(
                "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all relative",
                activeTab === 'notes' ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <FileStack className="w-4 h-4" />
              Notes
              {activeTab === 'notes' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence mode="wait">
              {activeTab === 'videos' ? (
                <motion.div 
                  key="videos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2"
                >
                  {content?.videos?.map((video, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVideoSelect(video)}
                      className={cn(
                        "w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left group",
                        activeVideo?.title === video.title ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-zinc-900 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        activeVideo?.title === video.title ? "bg-emerald-500 text-white" : "bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800"
                      )}>
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          activeVideo?.title === video.title ? "text-emerald-500" : "text-zinc-300"
                        )}>
                          {video.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Video Lecture • 45:00</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="notes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2"
                >
                  {content?.notes?.map((note, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNoteSelect(note)}
                      className={cn(
                        "w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left group",
                        activeNote?.title === note.title ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-zinc-900 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        activeNote?.title === note.title ? "bg-emerald-500 text-white" : "bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800"
                      )}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          activeNote?.title === note.title ? "text-emerald-500" : "text-zinc-300"
                        )}>
                          {note.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">PDF Document • 2.4 MB</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </main>
    </div>
  );
};
