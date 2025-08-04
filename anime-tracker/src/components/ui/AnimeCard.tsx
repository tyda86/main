'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, Plus, Calendar, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimeData } from '@/lib/anilist';

interface AnimeCardProps {
  anime: AnimeData;
  showAddToWatchlist?: boolean;
  onAddToWatchlist?: (anime: AnimeData) => void;
  className?: string;
}

export default function AnimeCard({ 
  anime, 
  showAddToWatchlist = true, 
  onAddToWatchlist,
  className = ''
}: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWatchlist(!isInWatchlist);
    if (onAddToWatchlist) {
      onAddToWatchlist(anime);
    }
  };

  const getTitle = () => {
    return anime.title.english || anime.title.romaji || anime.title.native;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASING':
        return 'bg-green-500';
      case 'FINISHED':
        return 'bg-blue-500';
      case 'NOT_YET_RELEASED':
        return 'bg-orange-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RELEASING':
        return 'Airing';
      case 'FINISHED':
        return 'Completed';
      case 'NOT_YET_RELEASED':
        return 'Upcoming';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (date: { year: number; month: number; day: number }) => {
    if (!date.year) return 'TBA';
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[date.month - 1]} ${date.year}`;
  };

  const cleanDescription = (description: string) => {
    if (!description) return '';
    return description.replace(/<[^>]*>/g, '').substring(0, 120) + '...';
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/anime/${anime.id}`}>
        <div className="relative">
          {/* Cover Image */}
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={anime.coverImage.large || anime.coverImage.medium}
              alt={getTitle()}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(anime.status)}`}>
              {getStatusText(anime.status)}
            </span>
          </div>

          {/* Score Badge */}
          {anime.averageScore && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded-full">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">
                  {(anime.averageScore / 10).toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Watchlist Button */}
          {showAddToWatchlist && (
            <motion.button
              onClick={handleAddToWatchlist}
              className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-200 ${
                isInWatchlist
                  ? 'bg-purple-600 text-white'
                  : 'bg-white bg-opacity-90 text-gray-700 hover:bg-purple-600 hover:text-white'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              {isInWatchlist ? (
                <Heart className="h-4 w-4 fill-current" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </motion.button>
          )}

          {/* Episode Info Overlay */}
          {anime.nextAiringEpisode && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center text-white text-xs">
                <Play className="h-3 w-3 mr-1" />
                <span>Ep {anime.nextAiringEpisode.episode}</span>
                <span className="mx-1">•</span>
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
            {getTitle()}
          </h3>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-2">
            {anime.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {genre}
              </span>
            ))}
            {anime.genres.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{anime.genres.length - 2}
              </span>
            )}
          </div>

          {/* Description */}
          {anime.description && (
            <p className="text-gray-600 text-xs leading-relaxed mb-3">
              {cleanDescription(anime.description)}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {anime.episodes && (
                <span>{anime.episodes} episodes</span>
              )}
              {anime.startDate && (
                <span>{formatDate(anime.startDate)}</span>
              )}
            </div>
            
            {anime.format && (
              <span className="font-medium">{anime.format}</span>
            )}
          </div>

          {/* Studio */}
          {anime.studios.nodes.length > 0 && (
            <div className="mt-2 text-xs text-purple-600 font-medium">
              {anime.studios.nodes[0].name}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}