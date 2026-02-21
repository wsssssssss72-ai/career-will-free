import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipForward, Settings, AlertCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isYoutube = src.includes('youtube.com') || src.includes('youtu.be');
  
  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  useEffect(() => {
    if (isYoutube) {
      setIsLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setIsLoading(true);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = src.toLowerCase().includes('.m3u8') || src.includes('m3u8') || !src.split('?')[0].includes('.');
    const isDirectVideo = src.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || src.includes('.mp4');

    const loadHls = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => setIsPlaying(false));
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("HLS Network Error:", data);
                if (data.response?.code === 403) {
                  setError("Access Denied (403). The video link might be expired or restricted.");
                } else {
                  setError("Network error. Retrying...");
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("HLS Media Error:", data);
                hls.recoverMediaError();
                break;
              default:
                console.error("HLS Fatal Error:", data);
                setError("This video format is not supported or the link is broken.");
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.load();
      } else {
        setError("Your browser does not support HLS video playback.");
      }
    };

    if (isHls && !isDirectVideo) {
      loadHls();
    } else {
      // Regular video file or fallback
      video.src = src;
      video.load();
      
      // If it's a direct video but fails, we might still want to try HLS as a last resort
      // because some HLS streams don't have extensions
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: any) => {
      const videoError = video.error;
      console.error("Video element error:", videoError, e);
      
      // If native playback fails and we haven't tried HLS yet, try HLS
      if (!hlsRef.current && !isYoutube) {
        console.log("Native playback failed, attempting HLS fallback...");
        loadHls();
      } else if (!hlsRef.current) {
        let msg = "Failed to load video source.";
        if (videoError?.code === 4) msg = "The video format is not supported by your browser.";
        if (videoError?.code === 3) msg = "Video playback was aborted.";
        if (videoError?.code === 2) msg = "Network error while loading video.";
        if (videoError?.code === 1) msg = "Video loading was interrupted.";
        setError(msg);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isYoutube]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isYoutube) return;
    
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(err => {
          console.error("Playback failed:", err);
          setError("Click to play (Autoplay blocked)");
        });
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  if (isYoutube) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={getYoutubeEmbedUrl(src)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group cursor-default"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 z-50 p-6 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Playback Error</h3>
            <p className="text-zinc-400 text-sm max-w-xs mb-6">{error}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setError(null);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play();
                  }
                }}
                className="px-6 py-2 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-colors"
              >
                Try Again
              </button>
              <a 
                href={src} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-2 bg-zinc-800 text-white rounded-full font-medium hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Direct
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-40"
          >
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big Play Button (when paused) */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !error && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20 hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-10 h-10 text-white fill-current ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 z-20 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <h3 className="text-white font-medium text-lg drop-shadow-lg truncate max-w-[80%]">{title}</h3>
          <button className="p-2 text-white/80 hover:text-white transition-colors bg-black/20 rounded-full backdrop-blur-md">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <div className="relative h-1.5 group/progress">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute inset-0 bg-white/20 rounded-full" />
            <div 
              className="absolute inset-0 bg-emerald-500 rounded-full" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors">
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 group/volume">
                <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 accent-emerald-500"
                />
              </div>
              <span className="text-white/80 text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
