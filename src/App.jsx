import React, { useState } from 'react';
import Header from './components/Header';
import BookInput from './components/BookInput';
import FilterPills from './components/FilterPills';
import SubmitButton from './components/SubmitButton';
import TrendingSection from './components/TrendingSection';
import RecommendationModal from './components/RecommendationModal';
import { getRecommendation } from './services/gemini';
import { Loader2 } from 'lucide-react';

function App() {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]); // Track recommended books
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFilter = (id) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(id)) {
      newFilters.delete(id);
    } else {
      newFilters.add(id);
    }
    setActiveFilters(newFilters);
  };

  const handleGetRecommendation = async () => {
    if (selectedBooks.length < 2) return;

    setIsLoading(true);
    setError(null);

    try {
      // Exclude books already selected AND books already recommended in this session
      const excludeList = [
        ...selectedBooks.map(b => b.title),
        ...history
      ];

      const result = await getRecommendation(selectedBooks, Array.from(activeFilters), excludeList);
      setRecommendation(result);
      setHistory(prev => [...prev, result.title]); // Add to history
    } catch (err) {
      setError("Couldn't get a recommendation. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedBooks([]);
    setActiveFilters(new Set());
    setRecommendation(null);
    setHistory([]);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 sm:p-8 bg-background text-white relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-xl font-serif animate-pulse">Finding your next favorite read...</p>
        </div>
      )}

      <main className="w-full max-w-3xl flex flex-col gap-8 mt-8 md:mt-16 pb-20">
        <Header />

        <div className="flex flex-col gap-6">
          <BookInput selectedBooks={selectedBooks} setSelectedBooks={setSelectedBooks} />
          <FilterPills activeFilters={activeFilters} toggleFilter={toggleFilter} />

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <SubmitButton
            disabled={selectedBooks.length < 2 || isLoading}
            onClick={handleGetRecommendation}
          />
        </div>

        <TrendingSection />
      </main>

      <RecommendationModal
        recommendation={recommendation}
        onClose={() => setRecommendation(null)}
        onReset={handleReset}
        onRetry={handleGetRecommendation}
      />
    </div>
  );
}

export default App;
