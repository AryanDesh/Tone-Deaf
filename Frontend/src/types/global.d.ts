declare interface Song {
    id: string;
    title: string;
    artist: string;
    album: string | null;
    duration: number | null;
  }

declare interface AudioContextType {
  currSong: Song;
  setCurrSong: React.Dispatch<React.SetStateAction<Song>>;
  songQueue: Song[],
  setSongQueue: React.Dispatch<React.SetStateAction<Song[]>>;
}
