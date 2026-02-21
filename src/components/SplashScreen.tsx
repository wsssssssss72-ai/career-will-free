import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-8">
          <GraduationCap className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">CAREERWILL</h1>
        <p className="text-zinc-500 font-medium tracking-widest text-xs uppercase">Premium Learning Experience</p>
      </motion.div>

      <div className="absolute bottom-20 w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
