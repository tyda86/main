'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Star, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimeCard from '@/components/ui/AnimeCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { searchAnime, AnimeData } from '@/lib/anilist';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<AnimeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'RELEASING', label: 'Currently Airing' },
    { value: 'FINISHED', label: 'Completed' },
    { value: 'NOT_YET_RELEASED', label: 'Upcoming' },
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'score', label: 'Score' },
    { value: 'trending', label: 'Trending' },
    { value: 'title', label: 'Title' },
    { value: 'start_date', label: 'Release Date' },
  ];

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string = query, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchAnime(searchQuery, page, 20);
      if (page === 1) {
        setSearchResults(response.data.Page.media);
      } else {
        setSearchResults(prev => [...prev, ...response.data.Page.media]);
      }
      setHasNextPage(response.data.Page.pageInfo.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to search anime. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    handleSearch(query, 1);
  };

  const loadMore = () => {
    if (hasNextPage && !loading) {
      handleSearch(query, currentPage + 1);
    }
  };

  const filteredResults = searchResults.filter(anime => {
    if (genreFilter.length > 0) {
      const hasGenre = genreFilter.some(genre => anime.genres.includes(genre));
      if (!hasGenre) return false;
    }

    if (yearFilter) {
      if (anime.startDate?.year !== parseInt(yearFilter)) return false;
    }

    if (statusFilter) {
      if (anime.status !== statusFilter) return false;
    }

    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.averageScore || 0) - (a.averageScore || 0);
      case 'title':
        return (a.title.english || a.title.romaji).localeCompare(
          b.title.english || b.title.romaji
        );
      case 'start_date':
        return (b.startDate?.year || 0) - (a.startDate?.year || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anime..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : 'Search'}
            </button>
          </form>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-purple-600 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genres
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {genres.map(genre => (
                        <label key={genre} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={genreFilter.includes(genre)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGenreFilter(prev => [...prev, genre]);
                              } else {
                                setGenreFilter(prev => prev.filter(g => g !== genre));
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Release Year
                    </label>
                    <input
                      type="number"
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      placeholder="e.g., 2024"
                      min="1960"
                      max={new Date().getFullYear() + 2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setGenreFilter([]);
                    setYearFilter('');
                    setStatusFilter('');
                  }}
                  className="mt-4 text-sm text-purple-600 hover:text-purple-700"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        {query && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results for "{query}"
            </h2>
            <p className="text-gray-600 mt-1">
              {sortedResults.length} anime found
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {sortedResults.length > 0 && (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
              : 'space-y-4'
          }>
            {sortedResults.map((anime, index) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <AnimeCard anime={anime} />
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                    <img
                      src={anime.coverImage.medium}
                      alt={anime.title.english || anime.title.romaji}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {anime.title.english || anime.title.romaji}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        {anime.averageScore && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{(anime.averageScore / 10).toFixed(1)}</span>
                          </div>
                        )}
                        {anime.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{anime.startDate.year}</span>
                          </div>
                        )}
                        {anime.episodes && (
                          <span>{anime.episodes} episodes</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {anime.genres.slice(0, 3).map(genre => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && sortedResults.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" color="white" />
                  Loading...
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {/* No Results */}
        {query && sortedResults.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No anime found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setQuery('');
                setGenreFilter([]);
                setYearFilter('');
                setStatusFilter('');
                setSearchResults([]);
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}