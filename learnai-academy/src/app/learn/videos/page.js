'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Play, Clock, Star, BookOpen } from 'lucide-react';
import VideoPlayer from '@/components/video/VideoPlayer';
import Link from 'next/link';

/**
 * Video Library Page
 * 
 * Features:
 * - Grid view of video lessons
 * - Filters: Subject, Grade, Topic, Difficulty, Duration
 * - Search by keyword
 * - Sort by: Recent, Popular, Recommended
 * - Continue watching section
 * - Recommended for you (based on progress)
 */
export default function VideoLibraryPage() {
  const [videos, setVideos] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filters, setFilters] = useState({
    subjectId: '',
    gradeLevel: '',
    difficulty: '',
  });

  useEffect(() => {
    loadVideos();
    loadRecommended();
  }, [filters, searchQuery]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchQuery && { q: searchQuery }),
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...(filters.gradeLevel && { gradeLevel: filters.gradeLevel }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
      });

      const response = await fetch(`/api/videos?${params}`);
      if (!response.ok) throw new Error('Failed to load videos');
      
      const data = await response.json();
      setVideos(data.videoLessons || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommended = async () => {
    try {
      const response = await fetch('/api/videos/recommended?limit=6');
      if (!response.ok) throw new Error('Failed to load recommendations');
      
      const data = await response.json();
      setRecommended(data.recommendations || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleProgress = async (videoId, progressData) => {
    try {
      await fetch(`/api/videos/${videoId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (selectedVideo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedVideo(null)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to Library
        </button>
        <VideoPlayer
          videoLesson={selectedVideo}
          onProgress={(data) => handleProgress(selectedVideo.id, data)}
          onComplete={() => {
            handleProgress(selectedVideo.id, { completed: true });
            setSelectedVideo(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Lessons</h1>
        <p className="text-gray-600">Learn at your own pace with interactive video lessons</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            <option value="math">Math</option>
            <option value="english">English</option>
            <option value="science">Science</option>
          </select>

          <select
            value={filters.gradeLevel}
            onChange={(e) => setFilters({ ...filters, gradeLevel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Grades</option>
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Recommended Section */}
      {recommended.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((video) => (
              <VideoCard key={video.id} video={video} onClick={() => handleVideoClick(video)} />
            ))}
          </div>
        </div>
      )}

      {/* All Videos */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Videos</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No videos found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onClick={() => handleVideoClick(video)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Video Card Component
 */
function VideoCard({ video, onClick }) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
            <Play className="text-white" size={48} />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Clock size={12} />
          {formatDuration(video.durationSeconds)}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{video.subject?.name || 'General'}</span>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-gray-600">
              {video.averageRating ? video.averageRating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

