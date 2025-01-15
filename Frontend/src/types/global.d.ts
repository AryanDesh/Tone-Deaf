declare interface Song {
    id: string;
    title: string;
    artist: string;
    album: string | null;
    duration: number | null;
  }

declare interface AudioContextType {
  currSong: string,
  setCurrSong: React.Dispatch<React.SetStateAction<string>>;
}
