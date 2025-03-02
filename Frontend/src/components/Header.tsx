import type React from "react"
import { Menu, Search, Share2, List, Music, Users, UserPlus } from "lucide-react"

interface HeaderProps {
  activeTab: string
  toggleMenu: () => void
  toggleSearch: () => void
  toggleCollaborationModal: () => void
  togglePlaylistModal: () => void
  changeTab: (tab: string) => void
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  toggleMenu,
  toggleSearch,
  toggleCollaborationModal,
  togglePlaylistModal,
  changeTab,
}) => {
  return (
    <header className="flex justify-between items-center p-4 bg-background-dark border-b border-border-color z-10">
      <div className="flex items-center gap-4">
        <button className="icon-button menu-button" onClick={toggleMenu}>
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-color to-secondary-color bg-clip-text text-transparent">
          ToneDeaf
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <a
        href="/"
        className={`tab-button ${activeTab === "songs" ? "active" : ""}`}
        onClick={(e) => {
            e.preventDefault(); // Prevent default anchor behavior for client-side navigation
            changeTab("songs");
        }}
        >
        <Music size={18} />
        <span className="hidden md:inline">Songs</span>
        </a>

        <a
        href="/collaboration"
        className={`tab-button ${activeTab === "collaborate" ? "active" : ""}`}
        onClick={(e) => {
            e.preventDefault(); // Prevent default anchor behavior for client-side navigation
            changeTab("collaborate");
        }}
        >
        <Users size={18} />
        <span className="hidden md:inline">Collaborate</span>
        </a>

        <a
        href="/friends"
        className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
        onClick={(e) => {
            e.preventDefault(); // Prevent default anchor behavior for client-side navigation
            changeTab("friends");
        }}
        >
        <UserPlus size={18} />
        <span className="hidden md:inline">Friends</span>
        </a>
      </div>
      <div className="flex items-center gap-4">
        <button className="icon-button" onClick={toggleSearch}>
          <Search size={24} />
        </button>
        <button className="icon-button" onClick={toggleCollaborationModal}>
          <Share2 size={24} />
        </button>
        <button className="icon-button" onClick={togglePlaylistModal}>
          <List size={24} />
        </button>
      </div>
    </header>
  )
}

export default Header

