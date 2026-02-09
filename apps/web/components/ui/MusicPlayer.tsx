import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Background music component with glassmorphism design
interface MusicPlayerProps {
  autoPlay?: boolean;
}

export function MusicPlayer({ autoPlay = false }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with a romantic piano track
    // Using a royalty-free placeholder - replace with actual audio file
    audioRef.current = new Audio(
      'https://cdn.pixabay.com/download/audio/2022/02/10/audio_d0a13f69d2.mp3?filename=piano-moment-111154.mp3'
    );
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch((err) => {
          console.log('Audio autoplay blocked:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'flex items-center gap-2',
        'bg-white/20 backdrop-blur-xl',
        'border border-white/30',
        'rounded-full px-4 py-2',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]',
        'transition-all duration-300'
      )}
    >
      {/* Music note icon */}
      <button
        onClick={togglePlay}
        className={cn(
          'w-10 h-10 rounded-full',
          'flex items-center justify-center',
          'bg-white/30 hover:bg-white/40',
          'transition-all duration-300',
          'text-rose-500'
        )}
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Volume control */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          className={cn(
            'w-8 h-8 rounded-full',
            'flex items-center justify-center',
            'bg-white/20 hover:bg-white/30',
            'transition-all duration-300',
            'text-gray-600'
          )}
        >
          {isMuted || volume === 0 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Volume slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (parseFloat(e.target.value) > 0) setIsMuted(false);
          }}
          className={cn(
            'w-16 h-1',
            'appearance-none',
            'bg-white/30 rounded-full',
            'cursor-pointer',
            'slider-thumb'
          )}
          style={{
            background: `linear-gradient(to right, #ff6b9d ${isMuted ? 0 : volume * 100}%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume * 100}%)`
          }}
        />
      </div>

      {/* Romantic pulse animation when playing */}
      {isPlaying && !isMuted && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Compact version for smaller screens
export function CompactMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(
      'https://cdn.pixabay.com/download/audio/2022/02/10/audio_d0a13f69d2.mp3?filename=piano-moment-111154.mp3'
    );
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <button
      onClick={togglePlay}
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'w-12 h-12 rounded-full',
        'bg-white/20 backdrop-blur-xl',
        'border border-white/30',
        'flex items-center justify-center',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]',
        'transition-all duration-300',
        'hover:scale-110',
        'text-rose-500'
      )}
      title={isPlaying ? 'Pause music' : 'Play music'}
    >
      {isPlaying ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}

      {isPlaying && !isMuted && (
        <div className="absolute -top-0.5 -right-0.5">
          <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-pulse" />
        </div>
      )}
    </button>
  );
}

// Wrapper component for day pages
interface DayPageWrapperProps {
  children: ReactNode;
  day: number;
  showMusic?: boolean;
}

export function DayPageWrapper({ children, day, showMusic = true }: DayPageWrapperProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient background based on day */}
      <DayGradientBackground day={day} />

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        <canvas id={`particles-${day}`} className="w-full h-full" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Music player */}
      {showMusic && <MusicPlayer autoPlay={true} />}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}

// Day-specific gradient backgrounds
function DayGradientBackground({ day }: { day: number }) {
  const gradients: Record<number, string> = {
    1: 'from-rose-100 via-pink-50 to-rose-50',
    2: 'from-orange-50 via-amber-50 to-orange-100',
    3: 'from-amber-100 via-yellow-50 to-amber-50',
    4: 'from-pink-50 via-rose-50 to-pink-100',
    5: 'from-yellow-50 via-amber-50 to-yellow-100',
    6: 'from-red-100 via-pink-100 to-rose-100',
    7: 'from-orange-100 via-pink-100 to-rose-100',
    8: 'from-rose-200 via-pink-200 to-red-200',
  };

  return (
    <>
      {/* Base gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[day] || gradients[1]}`}
      />

      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,107,157,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,140,105,0.3),transparent_50%)]" />
      </div>

      {/* Floating orbs animation */}
      <FloatingOrbs day={day} />
    </>
  );
}

// Animated floating orbs
function FloatingOrbs({ day }: { day: number }) {
  const colors: Record<number, string> = {
    1: 'bg-rose-300/30',
    2: 'bg-orange-300/30',
    3: 'bg-amber-300/30',
    4: 'bg-pink-300/30',
    5: 'bg-yellow-300/30',
    6: 'bg-red-300/30',
    7: 'bg-rose-300/30',
    8: 'bg-pink-400/30',
  };

  return (
    <>
      <div
        className={`absolute top-20 left-20 w-64 h-64 ${colors[day] || colors[1]} rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]`}
      />
      <div
        className={`absolute bottom-20 right-20 w-80 h-80 ${colors[day] || colors[1]} rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_2s]`}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${colors[day] || colors[1]} rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite_4s]`}
      />
    </>
  );
}
