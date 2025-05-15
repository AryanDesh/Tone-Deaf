import { openDB, IDBPDatabase } from 'idb';
import { Song } from '../types/songTypes';

const DB_NAME = 'musifyOfflineDB';
const DB_VERSION = 1;
const SONGS_STORE = 'songs';
const HLS_STORE = 'hlsData';
const RECENT_SONGS_LIMIT = 5;

interface HlsDataRecord {
  id: string;
  songId: string;
  url: string;
  data: ArrayBuffer;
  timestamp: number;
}

export const indexDBUtils = {
  db: null as IDBPDatabase | null,

  async initDB() {
    if (this.db) return this.db;

    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create a store for songs
          if (!db.objectStoreNames.contains(SONGS_STORE)) {
            const songsStore = db.createObjectStore(SONGS_STORE, { keyPath: 'id' });
            songsStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // Create a store for HLS data (m3u8 manifests and ts segments)
          if (!db.objectStoreNames.contains(HLS_STORE)) {
            const hlsStore = db.createObjectStore(HLS_STORE, { keyPath: 'id' });
            hlsStore.createIndex('songId', 'songId', { unique: false });
            hlsStore.createIndex('url', 'url', { unique: false });
            hlsStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        },
      });
      return this.db;
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      return null;
    }
  },

  async addRecentSong(song: Song) {
    if (!this.db) await this.initDB();
    if (!this.db) return;

    // Add timestamp to track recency
    const songWithTimestamp = {
      ...song,
      timestamp: Date.now()
    };

    // Store the song
    await this.db.put(SONGS_STORE, songWithTimestamp);

    // Maintain only the most recent songs
    await this.pruneOldSongs();
  },

  async pruneOldSongs() {
    if (!this.db) return;

    // Get all songs sorted by timestamp
    const allSongs = await this.db.getAllFromIndex(SONGS_STORE, 'timestamp');
    
    // Sort by timestamp descending (newest first)
    allSongs.sort((a, b) => b.timestamp - a.timestamp);
    
    // Keep only the most recent songs based on the limit
    if (allSongs.length > RECENT_SONGS_LIMIT) {
      const songsToDelete = allSongs.slice(RECENT_SONGS_LIMIT);
      const tx = this.db.transaction(SONGS_STORE, 'readwrite');
      
      // Delete old songs
      for (const song of songsToDelete) {
        await tx.store.delete(song.id);
        
        // Also delete associated HLS data
        await this.deleteHlsDataForSong(song.id);
      }
      
      await tx.done;
    }
  },

  async deleteHlsDataForSong(songId: string) {
    if (!this.db) return;
    
    // Get all HLS data for this song
    const hlsData = await this.db.getAllFromIndex(HLS_STORE, 'songId', songId);
    
    // Delete each HLS data record
    const tx = this.db.transaction(HLS_STORE, 'readwrite');
    for (const record of hlsData) {
      await tx.store.delete(record.id);
    }
    
    await tx.done;
  },

  async getSong(songId: string): Promise<Song | null> {
    if (!this.db) await this.initDB();
    if (!this.db) return null;

    try {
      return await this.db.get(SONGS_STORE, songId);
    } catch (error) {
      console.error('Error getting song from IndexedDB:', error);
      return null;
    }
  },

  async getRecentSongs(): Promise<Song[]> {
    if (!this.db) await this.initDB();
    if (!this.db) return [];

    try {
      const songs = await this.db.getAllFromIndex(SONGS_STORE, 'timestamp');
      // Sort by timestamp descending (newest first) and limit to recent count
      return songs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, RECENT_SONGS_LIMIT);
    } catch (error) {
      console.error('Error getting recent songs from IndexedDB:', error);
      return [];
    }
  },

  // In indexedDB.tsx
// Update the cache related functions and add proper verification

async cacheHlsData(songId: string, url: string, data: ArrayBuffer): Promise<void> {
  if (!this.db) await this.initDB();
  if (!this.db) return;

  try {
    // Validate that we have valid data
    if (!data || data.byteLength === 0) {
      console.warn('Attempted to cache empty data for:', url);
      return;
    }

    // Clean the URL to ensure it's a valid key
    const cleanedUrl = decodeURIComponent(url).replace(/^(https?:)?\/\/[^/]+\//, '');
    
    // Use a composite key that combines songId and url
    const id = `${songId}:${encodeURIComponent(cleanedUrl)}`;
    
    const record: HlsDataRecord = {
      id,
      songId,
      url: cleanedUrl,
      data,
      timestamp: Date.now()
    };
    
    console.log(`Storing ${cleanedUrl} in IndexedDB, size: ${data.byteLength} bytes`);
    await this.db.put(HLS_STORE, record);
    
    // Verify cache by reading it back
    const verification = await this.db.get(HLS_STORE, id);
    if (verification) {
      console.log(`Successfully cached: ${cleanedUrl} (${verification.data.byteLength} bytes)`);
    } else {
      console.warn(`Failed to verify cache for: ${cleanedUrl}`);
    }
  } catch (error) {
    console.error('Error caching HLS data in IndexedDB:', error);
  }
},

async getHlsData(songId: string, url: string): Promise<ArrayBuffer | null> {
  if (!this.db) await this.initDB();
  if (!this.db) return null;

  try {
    // Clean the URL to match what we stored
    const cleanedUrl = decodeURIComponent(url).replace(/^(https?:)?\/\/[^/]+\//, '');
    
    // Use the same composite key format
    const id = `${songId}:${encodeURIComponent(cleanedUrl)}`;
    
    console.log(`Looking for cached file: ${cleanedUrl}`);
    const record = await this.db.get(HLS_STORE, id);
    
    if (record) {
      console.log(`Found cached data for ${cleanedUrl}, size: ${record.data.byteLength} bytes`);
      return record.data;
    } else {
      console.log(`No cached data for ${cleanedUrl}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting HLS data from IndexedDB:', error);
    return null;
  }
},

async isSongCached(songId: string): Promise<boolean> {
  if (!this.db) await this.initDB();
  if (!this.db) return false;

  try {
    // Check if song exists
    const song = await this.db.get(SONGS_STORE, songId);
    if (!song) {
      console.log(`Song ${songId} not in cache`);
      return false;
    }
    
    // Get all HLS data for this song to check cache completeness
    const hlsData = await this.db.getAllFromIndex(HLS_STORE, 'songId', songId);
    
    // We should at least have the m3u8 file
    const hasMasterPlaylist = hlsData.some(item => 
      item.url.endsWith('.m3u8')
    );
    
    // We should also have some segment files (.ts)
    const hasSegments = hlsData.some(item => 
      item.url.endsWith('.ts')
    );
    
    const isCached = hasMasterPlaylist && hasSegments && hlsData.length > 1;
    console.log(`Song ${songId} cache status:`, isCached ? 'Complete' : 'Incomplete', 
                `(${hlsData.length} files, master: ${hasMasterPlaylist}, segments: ${hasSegments})`);
    
    return isCached;
  } catch (error) {
    console.error('Error checking if song is cached in IndexedDB:', error);
    return false;
  }
}
};