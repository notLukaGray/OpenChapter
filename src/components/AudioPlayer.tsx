'use client';

import { useState, useRef, useEffect } from 'react';
import {
  trackAudioPlay,
  trackAudioPause,
  trackAudioComplete,
  trackPlaybackSpeedChange,
  trackAudioSeek,
  trackAudioLoadPerformance,
  trackListeningDuration,
} from '../lib/analytics';
import { logError, logWarning } from '../lib/error-handling';
// CSS now imported via components.css

interface AudioPlayerProps {
  src?: string;
  className?: string;
  chapterTitle?: string; // Add chapter title for better tracking
}

export default function AudioPlayer({
  src,
  className = '',
  chapterTitle,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Listening duration tracking state
  const [listeningStartTime, setListeningStartTime] = useState<number | null>(
    null
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const eventListenersRef = useRef<{
    updateTime: () => void;
    updateDuration: () => void;
    handleEnded: () => void;
    handleError: (e: Event) => void;
    handleLoadStart: () => void;
  } | null>(null);

  // Speed options in order
  const speedOptions = [0.75, 1, 1.5, 2];

  // Listening duration tracking functions
  // Simple listening duration tracking
  const startListeningSession = () => {
    if (!src || !chapterTitle) return;
    setListeningStartTime(Date.now());
  };

  const endListeningSession = () => {
    if (!src || !chapterTitle || !listeningStartTime || !duration) return;

    const listeningTime = (Date.now() - listeningStartTime) / 1000;
    trackListeningDuration(src, chapterTitle, listeningTime, duration);
    setListeningStartTime(null);
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Cleanup function to properly dispose of audio element
  const cleanupAudio = () => {
    if (audioRef.current) {
      try {
        // Pause and reset audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.load(); // Force cleanup

        // Remove event listeners
        if (eventListenersRef.current) {
          audioRef.current.removeEventListener(
            'timeupdate',
            eventListenersRef.current.updateTime
          );
          audioRef.current.removeEventListener(
            'loadedmetadata',
            eventListenersRef.current.updateDuration
          );
          audioRef.current.removeEventListener(
            'ended',
            eventListenersRef.current.handleEnded
          );
          audioRef.current.removeEventListener(
            'error',
            eventListenersRef.current.handleError
          );
          audioRef.current.removeEventListener(
            'loadstart',
            eventListenersRef.current.handleLoadStart
          );
        }

        // Reset refs
        audioRef.current = null;
        eventListenersRef.current = null;
      } catch (err) {
        logWarning('Error during audio cleanup', {
          component: 'AudioPlayer',
          action: 'cleanup',
          data: { error: err },
        });
      }
    }
  };

  // Cleanup effect to pause audio and remove event listeners when component unmounts
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []); // Remove isPlaying dependency to ensure cleanup always runs

  // Reset state when src changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setExpanded(false);
    setError(null);
    setPlaybackRate(1); // Reset playback rate

    // Clean up existing audio element
    cleanupAudio();
  }, [src]);

  // Create audio element only when first needed
  const ensureAudioElement = () => {
    if (!audioRef.current && src) {
      try {
        audioRef.current = new Audio(src);
        audioRef.current.preload = 'metadata';
        audioRef.current.playbackRate = playbackRate;

        const updateTime = () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        };

        const updateDuration = () => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setError(null);
          }
        };

        const handleEnded = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          // Track audio completion and listening duration
          if (src) {
            trackAudioComplete(src, chapterTitle);
            endListeningSession();
          }
        };

        const handleError = (e: Event) => {
          logError('Audio error', e, {
            component: 'AudioPlayer',
            action: 'audio_error',
            data: { src, chapterTitle },
          });
          setError('Failed to load audio');
          setIsPlaying(false);
        };

        const handleLoadStart = () => {
          setError(null);
          // Track audio load start time
          const loadStartTime = Date.now();

          // Add load end listener
          const handleLoadEnd = () => {
            const loadEndTime = Date.now();
            const loadTime = loadEndTime - loadStartTime;
            trackAudioLoadPerformance(src!, chapterTitle || '', loadTime, true);
          };

          const handleLoadError = () => {
            const loadEndTime = Date.now();
            const loadTime = loadEndTime - loadStartTime;
            trackAudioLoadPerformance(
              src!,
              chapterTitle || '',
              loadTime,
              false
            );
          };

          audioRef.current!.addEventListener('canplaythrough', handleLoadEnd, {
            once: true,
          });
          audioRef.current!.addEventListener('error', handleLoadError, {
            once: true,
          });
        };

        // Store event listeners for cleanup
        eventListenersRef.current = {
          updateTime,
          updateDuration,
          handleEnded,
          handleError,
          handleLoadStart,
        };

        audioRef.current.addEventListener('timeupdate', updateTime);
        audioRef.current.addEventListener('loadedmetadata', updateDuration);
        audioRef.current.addEventListener('ended', handleEnded);
        audioRef.current.addEventListener('error', handleError);
        audioRef.current.addEventListener('loadstart', handleLoadStart);
      } catch (err) {
        logError('Error creating audio element', err, {
          component: 'AudioPlayer',
          action: 'create_audio_element',
          data: { src, chapterTitle },
        });
        setError('Failed to create audio player');
      }
    }
  };

  // Expand only after mount and when playing
  useEffect(() => {
    if (!hasMounted) return;
    setExpanded(isPlaying);
  }, [hasMounted, isPlaying]);

  const handlePlayClick = async () => {
    if (!src) return;

    try {
      // Create audio element on first play
      ensureAudioElement();

      if (!audioRef.current) {
        setError('Audio player not available');
        return;
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        // Track pause event and listening duration
        trackAudioPause(src, chapterTitle);
        endListeningSession();
      } else {
        // Reset error state when attempting to play
        setError(null);

        // Try to play audio
        await audioRef.current.play();
        setIsPlaying(true);
        // Track play event and start listening session
        trackAudioPlay(src, chapterTitle);
        startListeningSession();
      }
    } catch (err) {
      logError('Error playing audio', err, {
        component: 'AudioPlayer',
        action: 'play_audio',
        data: { src, chapterTitle, isPlaying },
      });
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(time)) {
      try {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
        // Track seek event
        if (src) {
          trackAudioSeek(src, time, chapterTitle);
        }
      } catch (error) {
        logWarning('Error seeking audio', {
          component: 'AudioPlayer',
          action: 'seek_audio',
          data: { src, chapterTitle, time, error: error?.toString() },
        });
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = () => {
    const currentIndex = speedOptions.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    const newSpeed = speedOptions[nextIndex];
    setPlaybackRate(newSpeed);

    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }

    // Track speed change event
    if (src) {
      trackPlaybackSpeedChange(src, newSpeed, chapterTitle);
    }
  };

  if (!src) {
    return (
      <div
        className={`bg-gray-100 rounded-lg p-4 text-center text-gray-500 ${className}`}
      >
        No audio file provided
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600 ${className}`}
      >
        <div className="text-sm font-medium">{error}</div>
        <button
          onClick={handlePlayClick}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`audio-player-container ${className}`}>
      <div className={`audio-player-circle ${expanded ? 'expanded' : ''}`}>
        <button
          onClick={handlePlayClick}
          className={`audio-player-button ${expanded ? 'expanded' : ''}`}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          disabled={!src}
        >
          {isPlaying ? (
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="4" width="3.5" height="12" rx="1" />
              <rect x="11.5" y="4" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
              <polygon points="6,4 16,10 6,16" />
            </svg>
          )}
        </button>
        {expanded && (
          <>
            <span className="audio-player-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              id="audio-seek-slider"
              name="audio-seek"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="audio-player-slider"
            />
            <span className="audio-player-time">{formatTime(duration)}</span>
            <button
              onClick={handleSpeedChange}
              className="audio-player-speed-button"
              aria-label={`Playback speed: ${playbackRate}x`}
            >
              {playbackRate === 0.75 ? '.75x' : `${playbackRate}x`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
