import React from "react";
import { Music, X, Play } from "lucide-react";
import { CustomButton } from "./ui/custom-button";
import type { Song } from "../types/songTypes";

interface PlaylistSongModalProps {
  toggleModal: () => void;
  playlist: {
    id: number;
    name: string;
    songs: Song[];
  } | null;
  onSelectSong: (song: Song) => void;
  currentSongId?: string;
}

const PlaylistSongModal: React.FC<PlaylistSongModalProps> = ({
  toggleModal,
  playlist,
  onSelectSong,
  currentSongId,
}) => {
  if (!playlist) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-purple-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Music className="mr-2 h-5 w-5" />
            {playlist.name}
          </h2>
          <button
            onClick={toggleModal}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Songs List */}
        <div className="p-4">
          {playlist.songs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No songs in this playlist yet
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {playlist.songs.map((song) => (
                <div
                  key={song.id}
                  className={`p-3 mb-2 rounded-lg ${
                    currentSongId === song.id
                      ? "bg-purple-800"
                      : "bg-gray-700 hover:bg-gray-600"
                  } transition cursor-pointer`}
                  onClick={() => onSelectSong(song)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-xs text-gray-400">by {song.artist}</p>
                    </div>
                    <div className="flex items-center">
                      <Play className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-900 flex justify-end">
          <CustomButton onClick={toggleModal} variant="outline">
            Close
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSongModal;