import type React from "react"
import { X, Music, List, Users, UserPlus, Heart, Radio, Headphones, BarChart2 } from "lucide-react"
import type { Playlist, Friend } from "../utils/types"

interface SidebarProps {
  menuOpen: boolean
  toggleMenu: () => void
  activeTab: string
  changeTab: (tab: string) => void
  playlists: Playlist[]
  friends: Friend[]
}

const Sidebar: React.FC<SidebarProps> = ({ menuOpen, toggleMenu, activeTab, changeTab, playlists, friends }) => {
  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm" onClick={toggleMenu}></div>
      )}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-background-light z-40 p-4 flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-color">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-color to-secondary-color bg-clip-text text-transparent">
            ToneDeaf
          </h2>
          <button className="icon-button" onClick={toggleMenu}>
            <X size={24} />
          </button>
        </div>
        <nav className="mb-6">
          <ul className="space-y-2">
            <li className={`sidebar-item ${activeTab === "songs" ? "active" : ""}`} onClick={() => changeTab("songs")}>
              <Music size={18} /> Songs
            </li>
            <li
              className={`sidebar-item ${activeTab === "playlists" ? "active" : ""}`}
              onClick={() => changeTab("playlists")}
            >
              <List size={18} /> Playlists
            </li>
            <li
              className={`sidebar-item ${activeTab === "collaborate" ? "active" : ""}`}
              onClick={() => changeTab("collaborate")}
            >
              <Users size={18} /> Collaborate
            </li>
            <li
              className={`sidebar-item ${activeTab === "friends" ? "active" : ""}`}
              onClick={() => changeTab("friends")}
            >
              <UserPlus size={18} /> Friends
            </li>
            <li className="sidebar-item">
              <Heart size={18} /> Favorites
            </li>
            <li className="sidebar-item">
              <Radio size={18} /> Radio
            </li>
            <li className="sidebar-item">
              <Headphones size={18} /> Discover
            </li>
            <li className="sidebar-item">
              <BarChart2 size={18} /> Stats
            </li>
          </ul>
        </nav>
        <div className="mb-6">
          <h3 className="text-sm uppercase text-text-tertiary mb-2">Your Playlists</h3>
          <ul className="space-y-2">
            {playlists.map((playlist) => (
              <li
                key={playlist.id}
                className="flex justify-between items-center text-text-secondary hover:text-text-primary cursor-pointer"
              >
                {playlist.name}
                {playlist.collaborative && (
                  <span className="text-xs bg-primary-color text-white px-1 py-0.5 rounded">Collab</span>
                )}
                <span className="text-xs text-text-tertiary">{playlist.songCount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto">
          <h3 className="text-sm uppercase text-text-tertiary mb-2">Online Friends</h3>
          <ul className="space-y-2">
            {friends
              .filter((friend) => friend.online)
              .map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={friend.avatar || "/placeholder.svg"}
                      alt={friend.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-online-color rounded-full"></span>
                  </div>
                  <span>{friend.name}</span>
                  {friend.currentlyPlaying && (
                    <span className="text-xs text-text-tertiary truncate">
                      Listening to {friend.currentlyPlaying.song}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default Sidebar

