
declare interface AudioContextType {
  currSong: Song;
  setCurrSong: React.Dispatch<React.SetStateAction<Song>>;
  songQueue: Song[],
  setSongQueue: React.Dispatch<React.SetStateAction<Song[]>>;
}
