import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Bell, User, LayoutGrid, GraduationCap } from 'lucide-react';
import { apiService, Batch } from '../services/api';
import { BatchCard } from '../components/BatchCard';

export const HomePage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getBatches();
      if (data.length === 0) {
        setError("No batches found. The API might be temporarily unavailable.");
      }
      setBatches(data);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      setError("Failed to load batches. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(b => 
    b.batch_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">CAREERWILL</span>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="w-5 h-5 text-emerald-500" />
            <h2 className="text-2xl font-bold">My Batches</h2>
          </div>
          <p className="text-zinc-500">Continue your learning journey with your enrolled courses.</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-400 mb-6">{error}</p>
            <button 
              onClick={fetchBatches}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredBatches.map((batch) => (
              <BatchCard 
                key={batch.batch_id} 
                batch={batch} 
                onClick={(id) => navigate(`/batch/${id}`)} 
              />
            ))}
          </motion.div>
        )}

        {!loading && !error && filteredBatches.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500">No batches found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
};
