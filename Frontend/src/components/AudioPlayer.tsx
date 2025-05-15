import { useState, useRef, useCallback, useEffect, FC } from "react";
import IconButton from "./IconButton";
import Hls from "hls.js";
import { supabase } from "../utils/supe";
import { Song } from "../types/songTypes";
import { useAudioContext, useCollabContext, useOfflineContext } from "../context";
import { useSocketManager } from "../context/socket";

interface AudioPlayerProps {
  src: Song,
  setSrc: (Song: Song) => void
}

// Define CustomHlsLoader outside the component to prevent recreating on each render
class CustomHlsLoader extends Hls.DefaultConfig.loader {
  constructor(config: any) {
    super(config);
    const load = this.load.bind(this);
    
    this.load = async function(context: any, config: any, callbacks: any) {
      // Get offline context from the HLS instance
      const hlsContext = (context.frag?.hls || context.hls)?.offlineContext;
      
      if (hlsContext?.isOffline) {
        console.log("Offline mode: trying to load from cache:", context.url);
        try {
          // Try to get from IndexedDB
          const cachedData = await hlsContext.getHlsData(hlsContext.songId, context.url);
          
          if (cachedData) {
            console.log("Found cached data for", context.url);
            // Simulate successful load
            const stats = {
              aborted: false,
              loaded: cachedData.byteLength,
              total: cachedData.byteLength,
              trequest: performance.now(),
              tfirst: performance.now(),
              tload: performance.now(),
            };
            
            callbacks.onSuccess({ 
              data: cachedData, 
              url: context.url,
              stats: stats
            }, stats, context);
            return;
          } else {
            console.log("No cached data found for:", context.url);
            callbacks.onError({ 
              code: 404, 
              text: "Not found in offline cache" 
            }, context);
          }
        } catch (error) {
          console.error("Error loading from cache:", error);
          callbacks.onError({ 
            code: 500, 
            text: "Error loading from cache" 
          }, context);
        }
      } else {
        // Online mode: use default loader
        load(context, config, callbacks);
      }
    };
  }
}

const AudioPlayer: FC<AudioPlayerProps> = ({ src, setSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [songSrc, setSongSrc] = useState('');
  const [sliderMax, setSliderMax] = useState<number | undefined>(0);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [volume, setVolume] = useState(1); // Default volume (1 = 100%)
  const playRef = useRef<number | null>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const lastSongIdRef = useRef<string>(src.id);
  
  const { isPlaying, setIsPlaying, nextSong, prevSong, currSong } = useAudioContext();
  const { socket } = useSocketManager();
  const { isInCollab, roomId } = useCollabContext();
  const { 
    isOffline, 
    addRecentSong, 
    getOfflineSong, 
    cacheHlsData, 
    getHlsData,
    isSongCached 
  } = useOfflineContext();

  const getAudioFile = useCallback(async () => {
    // Prevent repeated calls for the same song
    if (lastSongIdRef.current !== src.id) {
      lastSongIdRef.current = src.id;
    } else {
      // If we already processed this song ID and have a source, return
      if (songSrc) return;
    }
    
    try {
      // First check if we're offline
      if (isOffline) {
        // Check if this song is available offline
        const isCached = await isSongCached(src.id);
        if (isCached) {
          console.log("Using cached song in offline mode");
          // Use a blob URL for offline playback
          const m3u8Url = `${src.id}/${src.id}.m3u8`;
          const cachedM3u8 = await getHlsData(src.id, m3u8Url);
          
          if (cachedM3u8) {
            const blob = new Blob([cachedM3u8], { type: 'application/vnd.apple.mpegurl' });
            const blobUrl = URL.createObjectURL(blob);
            setSongSrc(blobUrl);
            return;
          }
        } else {
          console.warn("Song not available offline and network is down");
          return;
        }
      }
      
      // Online mode - get from Supabase
      const { data } = supabase.storage.from('Songs-Chunks').getPublicUrl(`${src.id}/${src.id}.m3u8`);
      console.log("Online mode: loading from Supabase", data);
      setSongSrc(data.publicUrl);
      
      // Cache the song for offline use if it's not already cached
      addRecentSong(src);
      
    } catch (error) {
      console.error("Error getting audio file:", error);
    }
  }, [src.id, isOffline, isSongCached, getHlsData, addRecentSong, songSrc]);
  
  // Setup HLS for audio playback
  const setupHls = useCallback((url: string) => {
    // Clean up any existing HLS instance
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }
    
    if (!Hls.isSupported() || !audioRef.current) {
      console.error("HLS is not supported in this browser");
      return;
    }
    
    // Create new HLS instance with custom loader for offline support
    const hls = new Hls({
      maxBufferLength: 30, 
      maxMaxBufferLength: 60, 
      maxBufferHole: 0.1, 
      maxLoadingDelay: 2, 
      fragLoadingTimeOut: 4000,
      startFragPrefetch: true,
      lowLatencyMode: true,
      loader: CustomHlsLoader,
      xhrSetup: function(xhr, url) {
        // Store the original open method
        const originalOpen = xhr.open;
        
        // Override the open method
        xhr.open = function(method, urlToLoad) {
          // Save the URL for later use in onreadystatechange
          (xhr as any)._hlsUrl = urlToLoad;
          
          // Call the original open method with the appropriate arguments
          return originalOpen.call(xhr, method, urlToLoad, true);
        };
        
        // Add onreadystatechange handler to capture and cache responses
        const originalOnReadyStateChange = xhr.onreadystatechange;
        xhr.onreadystatechange = function(e) {
          // Call the original handler if it exists
          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.call(xhr, e);
          }
          
          // When response is complete and successful
          if (xhr.readyState === 4 && xhr.status === 200) {
            // Only cache if we're online - no need to cache our own cached data
            if (!isOffline) {
              try {
                // Get the response as ArrayBuffer
                const arrayBuffer = xhr.response;
                if (arrayBuffer && arrayBuffer instanceof ArrayBuffer) {
                  // Make sure responseType is set to arraybuffer
                  console.log("Caching:", (xhr as any)._hlsUrl, "Size:", arrayBuffer.byteLength);
                  // Store in IndexedDB cache
                  cacheHlsData(src.id, (xhr as any)._hlsUrl, arrayBuffer);
                } else {
                  console.warn("Response is not an ArrayBuffer:", typeof arrayBuffer);
                }
              } catch (error) {
                console.error("Error caching HLS data:", error);
              }
            }
          }
        };
        xhr.responseType = "arraybuffer";
      }
    });
    
    // Define custom context for HLS loader
    (hls as any).offlineContext = {
      isOffline,
      songId: src.id,
      getHlsData
    };
    
    hlsInstanceRef.current = hls;
    
    hls.loadSource(url);
    hls.attachMedia(audioRef.current);
    
    hls.on(Hls.Events.MANIFEST_PARSED, async () => {
      console.log("HLS manifest parsed");
      if (isPlaying) {
        try {
          const playPromise = audioRef.current?.play();
          if (playPromise) {
            playPromise.catch((err) => {
              console.log("Auto-play blocked", err);
              setIsPlaying(false);
            });
          }
        } catch (err) {
          console.log("Auto-play blocked", err);
          setIsPlaying(false);
        }
      }
    });
    
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log("Network error, trying to recover...");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("Media error, trying to recover...");
            hls.recoverMediaError();
            break;
          default:
            console.error("Fatal HLS error:", data);
            break;
        }
      }
    });
  }, [isOffline, isPlaying, src.id, getHlsData, cacheHlsData, setIsPlaying]);
  
  // Effect to fetch audio when src changes
  useEffect(() => {
    getAudioFile();
  }, [src.id, getAudioFile]);
  
  // Effect to set up HLS when songSrc changes
  useEffect(() => {
    if (!songSrc) return;
    
    setupHls(songSrc);
    
    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
      
      // Clean up blob URLs
      if (songSrc.startsWith('blob:')) {
        URL.revokeObjectURL(songSrc);
      }
    };
  }, [songSrc, setupHls]);
  
  const convertDuration = (secs: number | undefined) => {
    if(secs) {
      const minutes = Math.floor(secs / 60);
      const seconds = Math.floor(secs % 60);
      const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${minutes}:${returnedSeconds}`;
    }
    return "0:00";
  }
  
  const handleLoadedMetadata = () => {
    if (timeRef.current && audioRef.current) {
      timeRef.current.textContent = convertDuration(audioRef.current.duration);      
      setSliderMax(Math.floor(audioRef.current.duration));
    }
  }

  const updateProgress = useCallback(() => {
    if(audioRef.current && seekRef.current) {
      const currentTime = audioRef.current.currentTime;
      setTrackProgress(currentTime);

      seekRef.current.value = currentTime.toString();
      seekRef.current.style.setProperty(
        '--range-progress', 
        `${(currentTime / (audioRef.current.duration || 1)) * 100}%`
      );
    }
  }, []);
  
  // Set up animation frame for tracking playback progress
  const startAnimation = useCallback(() => {
    if(audioRef.current && seekRef.current) {
      const animate = () => {
        updateProgress();
        playRef.current = requestAnimationFrame(animate);
      }
      playRef.current = requestAnimationFrame(animate);
    }
  }, [updateProgress]);
  
  // Handle play/pause state changes
  useEffect(() => {
    if(isPlaying) {
      const playPromise = audioRef.current?.play();
      if (playPromise) {
        playPromise.catch(error => {
          console.error("Play failed:", error);
          setIsPlaying(false);
        });
      }
      startAnimation();
    } else {
      audioRef.current?.pause();
      if(playRef.current) {
        cancelAnimationFrame(playRef.current);
        playRef.current = null;
      }
      updateProgress();
    }
    
    return () => {
      if(playRef.current) {
        cancelAnimationFrame(playRef.current);
      }
    }
  }, [isPlaying, startAnimation, updateProgress, setIsPlaying]);
  
  // Handle end of track to automatically play next song
  useEffect(() => {
    const handleTrackEnd = () => {
      handlePlayNext();
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('ended', handleTrackEnd);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, []);
  
  const handleChange = () => {
    if(audioRef.current && seekRef.current) {
      const newTime = Number(seekRef.current.value);
      audioRef.current.currentTime = newTime;
      setTrackProgress(newTime);

      seekRef.current.style.setProperty(
        '--range-progress', 
        `${(newTime / (audioRef.current.duration || 1)) * 100}%`
      );
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  }
  
  const handlePlayNext = () => {
    nextSong();
    if(isInCollab && currSong) {
      socket.emit('stream-song', { roomCode: roomId!, songId: currSong.id });
    }
  }
  
  const handlePlayPrev = () => {
    prevSong();
    if(isInCollab && currSong) {
      socket.emit('stream-song', { roomCode: roomId!, songId: currSong.id });
    }
  }
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  return (  
    <div className="w-full flex flex-col items-center relative">
      <div className="w-full flex justify-between items-center py-4">
    
        {/* Player Controls & Volume Control in Same Flex Container */}
        <div className="w-full grid grid-cols-[2fr_auto] items-center">
          {/* Player Controls + Timer */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center w-2/5 mx-auto">
            <p>{convertDuration(trackProgress)}</p>

            {/* Playback Controls */}
            <div className="flex gap-8 justify-center">
              <IconButton clickFunction={handlePlayPrev} src="/icons/player-track-prev.svg" />
              <IconButton clickFunction={handlePlayPause} src={isPlaying ? "/icons/player-pause.svg" : "/icons/player-play.svg"} />
              <IconButton clickFunction={handlePlayNext} src="/icons/player-track-next.svg" />
            </div>

            <p ref={timeRef}>0:00</p>
          </div>

          {/* Volume Control on the Right */}
          <div className="grid grid-cols-[auto_auto_auto] items-center">
            <span>🔉</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16"
            />
            <span>🔊</span>
          </div>
        </div>
      </div>
    
      {/* Progress Bar */}
      <div className="absolute bottom-0 w-7/12">
        <input 
          type="range" 
          ref={seekRef} 
          min={0} 
          max={sliderMax || 1} 
          defaultValue={0} 
          onChange={handleChange} 
          className="w-full" 
        />
        <audio 
          ref={audioRef} 
          className="w-2/5 mx-auto mt-20" 
          onLoadedMetadata={handleLoadedMetadata} 
          preload="auto"
        />
      </div>
      
      {/* Offline indicator - subtle UI indicator */}
      {isOffline && (
        <div className="absolute top-0 right-0 px-2 py-1 bg-yellow-500 text-xs text-white rounded-bl-md">
          Offline Mode
        </div>
      )}
    </div>
  );
}

export default AudioPlayer;