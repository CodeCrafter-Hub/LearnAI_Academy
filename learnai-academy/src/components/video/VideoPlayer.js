'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Bookmark, MessageCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * VideoPlayer - Interactive video player for video lessons
 * 
 * Features:
 * - Playback controls (play, pause, seek, speed, volume)
 * - Progress tracking (resume from last position)
 * - Captions/subtitles toggle
 * - Full-screen mode
 * - Note-taking sidebar (timestamp-linked notes)
 * - Ask tutor button (launches chat with context)
 * - Bookmarks
 * - Rating
 */
export default function VideoPlayer({ videoLesson, onProgress, onComplete }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [rating, setRating] = useState(0);
  const [lastSavedPosition, setLastSavedPosition] = useState(0);

  // Load saved progress
  useEffect(() => {
    if (videoLesson?.views?.[0]) {
      const view = videoLesson.views[0];
      setCurrentTime(view.lastPositionSeconds || 0);
      setRating(view.rating || 0);
      setBookmarks(view.bookmarks || []);
      setNotes(view.notes || []);
    }
  }, [videoLesson]);

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);

      // Auto-save progress every 5 seconds
      if (Math.abs(video.currentTime - lastSavedPosition) > 5) {
        saveProgress(video.currentTime);
        setLastSavedPosition(video.currentTime);
      }

      // Check if completed (90% watched)
      if (video.duration > 0 && video.currentTime >= video.duration * 0.9 && !videoLesson?.views?.[0]?.completed) {
        handleComplete();
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', () => {
      setDuration(video.duration);
      if (videoLesson?.views?.[0]?.lastPositionSeconds) {
        video.currentTime = videoLesson.views[0].lastPositionSeconds;
      }
    });

    return () => {
      video.removeEventListener('timeupdate', updateTime);
    };
  }, [videoLesson, lastSavedPosition]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !muted;
    setMuted(!muted);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handlePlaybackRateChange = (rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
    }
  };

  const saveProgress = async (position) => {
    if (!onProgress) return;

    try {
      await onProgress({
        watchedDurationSeconds: position,
        lastPositionSeconds: position,
        completed: position >= duration * 0.9,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleComplete = async () => {
    if (onComplete) {
      await onComplete();
    }
  };

  const addBookmark = () => {
    const newBookmark = {
      id: `bookmark_${Date.now()}`,
      timestamp: currentTime,
      note: '',
      createdAt: new Date().toISOString(),
    };
    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);
  };

  const addNote = () => {
    const newNote = {
      id: `note_${Date.now()}`,
      timestamp: currentTime,
      content: '',
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const saveBookmarks = async (bookmarksToSave) => {
    // TODO: Save to API
    console.log('Saving bookmarks:', bookmarksToSave);
  };

  const saveNotes = async (notesToSave) => {
    // TODO: Save to API
    console.log('Saving notes:', notesToSave);
  };

  const handleRating = async (newRating) => {
    setRating(newRating);
    // TODO: Save rating to API
    try {
      const response = await fetch(`/api/videos/${videoLesson.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });
      if (!response.ok) throw new Error('Failed to save rating');
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoLesson?.videoUrl}
          className="w-full h-full"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            handleComplete();
          }}
        >
          {showCaptions && videoLesson?.captionsUrl && (
            <track kind="captions" src={videoLesson.captionsUrl} srcLang="en" label="English" default />
          )}
          Your browser does not support the video tag.
        </video>

        {/* Progress Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar with Time */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-sm">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  {playing ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />

                <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                  className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  CC
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info and Actions */}
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{videoLesson?.title}</h2>
            <p className="text-gray-600 text-sm">{videoLesson?.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="text-yellow-400 hover:text-yellow-500 transition-colors"
              >
                <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={addBookmark}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Bookmark size={18} />
            <span>Bookmark</span>
          </button>

          <button
            onClick={addNote}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            <span>Add Note</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            <span>Ask Tutor</span>
          </button>
        </div>
      </div>

      {/* Notes Sidebar */}
      {showNotes && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l shadow-lg overflow-y-auto"
        >
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Notes & Bookmarks</h3>
            
            {/* Notes */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Notes</h4>
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm">No notes yet</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">{formatTime(note.timestamp)}</p>
                      <p className="text-sm">{note.content || 'Empty note'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bookmarks */}
            <div>
              <h4 className="font-semibold mb-2">Bookmarks</h4>
              {bookmarks.length === 0 ? (
                <p className="text-gray-500 text-sm">No bookmarks yet</p>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bookmark) => (
                    <button
                      key={bookmark.id}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = bookmark.timestamp;
                        }
                      }}
                      className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-xs text-gray-500">{formatTime(bookmark.timestamp)}</p>
                      <p className="text-sm">{bookmark.note || 'No note'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

