import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import BookInput from './components/BookInput';

import TrendingSection from './components/TrendingSection';
import FeatureSection from './components/FeatureSection';
import RecommendationModal from './components/RecommendationModal';
import Footer from './components/Footer';
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
      // Use the error message from the service if available, otherwise default message
      const errorMessage = err.message || "Couldn't get a recommendation. Please try again.";
      setError(errorMessage);
      console.error("Recommendation error:", err);
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

  const handleTrendingBookClick = (book) => {
    // Create a recommendation object from the trending book
    const trendingRecommendation = {
      title: book.title,
      author: book.author,
      reasoning: "This book is trending right now and highly popular among readers!",
      isTrending: true
    };
    setRecommendation(trendingRecommendation);
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

      <main data-book-input className="w-full max-w-3xl flex flex-col gap-8 mt-8 md:mt-16 pb-20">
        <Header />

        <div className="flex flex-col gap-6">
          <BookInput
            selectedBooks={selectedBooks}
            setSelectedBooks={setSelectedBooks}
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            onSubmit={handleGetRecommendation}
            isLoading={isLoading}
          />

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        <TrendingSection onBookClick={handleTrendingBookClick} />
      </main>

      <FeatureSection />

      <Footer />

      <RecommendationModal
        recommendation={recommendation}
        onClose={useCallback(() => setRecommendation(null), [])}
        onReset={handleReset}
        onRetry={handleGetRecommendation}
      />
    </div>
  );
}

export default App;
