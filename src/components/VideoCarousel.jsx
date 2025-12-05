import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { formatViewCount, formatDuration } from '../services/youtube';

export default function VideoCarousel({ videos, isLoading }) {
    if (isLoading) {
        return (
            <div className="w-full">
                <h3 className="text-xl font-serif text-white mb-4">
                    Trending reviews about the book on social media
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[160px]">
                            <div className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
                                <div className="w-[160px] h-[285px] bg-gray-700" />
                                <div className="p-2 space-y-2">
                                    <div className="h-3 bg-gray-700 rounded w-full" />
                                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return null; // Don't show section if no videos
    }

    return (
        <div className="w-full">
            <h3 className="text-xl font-serif text-white mb-4">
                Trending reviews about the book on social media
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                {videos.map((video) => (
                    <a
                        key={video.id}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-[160px] group"
                    >
                        <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:shadow-white/5 h-full flex flex-col">
                            {/* Vertical Thumbnail - Shorts style */}
                            <div className="relative w-[160px] h-[285px] bg-gray-900 overflow-hidden flex-shrink-0">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Play overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-white rounded-full p-2.5">
                                        <Play className="w-5 h-5 text-black fill-black" />
                                    </div>
                                </div>
                                {/* Duration badge - top right */}
                                {video.duration && (
                                    <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-medium">
                                        {formatDuration(video.duration)}
                                    </div>
                                )}
                                {/* View count badge - bottom */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                    <p className="text-xs text-white font-medium">
                                        {formatViewCount(video.viewCount)} views
                                    </p>
                                </div>
                            </div>

                            {/* Video Info - Compact */}
                            <div className="p-2 flex flex-col flex-1">
                                <h4 className="text-xs font-body text-white line-clamp-2 leading-tight group-hover:text-gray-200">
                                    {video.title}
                                </h4>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
