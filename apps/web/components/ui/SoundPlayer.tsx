import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SoundOption {
  id: string;
  name: string;
  emoji: string;
  url: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  { id: 'piano', name: 'Romantic Piano', emoji: '🎹', url: '/sound/freesound_community-chonology-of-love-6094.mp3' },
  { id: 'rain', name: 'Gentle Rain', emoji: '🌧️', url: '/sound/vem_click-rain-sound-188158.mp3' },
  { id: 'birds', name: 'Forest Birds', emoji: '🐦', url: '/sound/freesound_community-birds-19624.mp3' },
  { id: 'music', name: 'Emotive Music', emoji: '🎵', url: '/sound/freesound_community-emotive-film-music-28052.mp3' },
  { id: 'paino', name: 'Emotional Piano', emoji: '🎼', url: '/sound/coffeebagaudiolab-emotional-paino-238158.mp3' },
];

interface SoundPlayerProps {
  autoPlay?: boolean;
  defaultSoundId?: string;
}

export function SoundPlayer({ autoPlay = false, defaultSoundId }: SoundPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [currentSound, setCurrentSound] = useState(defaultSoundId 
    ? SOUND_OPTIONS.find(s => s.id === defaultSoundId) || SOUND_OPTIONS[0] 
    : SOUND_OPTIONS[0]);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(currentSound.url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle sound changes
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !isPlaying;
      audioRef.current.src = currentSound.url;
      audioRef.current.loop = true;
      audioRef.current.load(); // Reload the audio with new source
      
      // If was playing, restart with new sound
      if (wasPlaying && !isMuted) {
        audioRef.current.play().catch(() => {
          setNeedsUserInteraction(true);
        });
      }
    }
  }, [currentSound]);

  // Handle autoplay restrictions
  useEffect(() => {
    if (audioRef.current && isPlaying && !isMuted) {
      audioRef.current.play().catch((err) => {
        console.log('Autoplay blocked, user interaction needed');
        setIsPlaying(false);
        setNeedsUserInteraction(true);
      });
    }
  }, [isPlaying, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // If autoplay is blocked, require user interaction
          setNeedsUserInteraction(true);
        });
      }
    }
    setIsPlaying(!isPlaying);
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
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className={cn(
          'w-10 h-10 rounded-full',
          'flex items-center justify-center',
          'bg-white/30 hover:bg-white/40',
          'transition-all duration-300',
          'text-rose-500'
        )}
        title={isPlaying ? 'Pause' : 'Play'}
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

      {/* Sound selector */}
      <div className="relative">
        <button
          onClick={() => setShowSoundPicker(!showSoundPicker)}
          className={cn(
            'w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'bg-white/20 hover:bg-white/30',
            'transition-all duration-300',
            'text-gray-600'
          )}
          title="Choose sound"
        >
          <span className="text-lg">{currentSound.emoji}</span>
        </button>

        {showSoundPicker && (
          <div
            className={cn(
              'absolute bottom-full right-0 mb-2',
              'min-w-[200px]',
              'bg-white/95 backdrop-blur-xl',
              'border border-white/30',
              'rounded-2xl p-3',
              'shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]',
              'grid grid-cols-2 gap-2',
              'animate-[slideUp_0.2s_ease-out]',
              'z-50'
            )}
          >
            {SOUND_OPTIONS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => {
                  setCurrentSound(sound);
                  setShowSoundPicker(false);
                }}
                className={cn(
                  'flex flex-row items-center gap-2 px-3 py-2 rounded-xl',
                  'hover:bg-white/30 transition-all duration-200',
                  'whitespace-nowrap',
                  currentSound.id === sound.id && 'bg-white/40'
                )}
              >
                <span className="text-lg">{sound.emoji}</span>
                <span className="text-sm text-gray-700 truncate">{sound.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
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
          className="w-16 h-1 appearance-none bg-white/30 rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ff6b9d ${isMuted ? 0 : volume * 100}%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume * 100}%)`
          }}
        />
      </div>

      {/* Playing indicator */}
      {isPlaying && !isMuted && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse" />
        </div>
      )}

      {/* Autoplay blocked overlay */}
      {needsUserInteraction && (
        <div 
          className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer z-50"
          onClick={() => {
            setIsPlaying(true);
            setNeedsUserInteraction(false);
          }}
        >
          <div className="text-center">
            <div className="text-rose-500 text-2xl mb-1">🎵</div>
            <div className="text-xs text-gray-700 font-medium">Click to play</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Message slider component to show both players' messages
interface MessageSliderProps {
  player1Message: string;
  player2Message: string;
  player1Name: string;
  player2Name: string;
}

export function MessageSlider({
  player1Message,
  player2Message,
  player1Name,
  player2Name,
}: MessageSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      name: player1Name,
      message: player1Message,
      emoji: '👤',
    },
    {
      name: player2Name,
      message: player2Message,
      emoji: '💕',
    },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Slide container */}
      <div className="overflow-hidden rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 p-6">
              <div className="text-center">
                <div className="text-4xl mb-3">{slide.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {slide.name}'s Message
                </h3>
                <p className="text-gray-700 italic text-lg leading-relaxed">
                  "{slide.message}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentSlide(0)}
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2',
          'w-10 h-10 rounded-full',
          'bg-white/30 hover:bg-white/50',
          'backdrop-blur-md',
          'border border-white/40',
          'flex items-center justify-center',
          'transition-all duration-300',
          currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'
        )}
        disabled={currentSlide === 0}
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => setCurrentSlide(1)}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2',
          'w-10 h-10 rounded-full',
          'bg-white/30 hover:bg-white/50',
          'backdrop-blur-md',
          'border border-white/40',
          'flex items-center justify-center',
          'transition-all duration-300',
          currentSlide === 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'
        )}
        disabled={currentSlide === 1}
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              currentSlide === index
                ? 'bg-rose-400 scale-110'
                : 'bg-white/40 hover:bg-white/60'
            )}
          />
        ))}
      </div>

      {/* Swipe instruction */}
      <p className="text-center text-sm text-gray-500 mt-3">
        ← Slide to see {currentSlide === 0 ? player2Name : player1Name}'s message →
      </p>
    </div>
  );
}
