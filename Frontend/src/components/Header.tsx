import type React from "react"
import { Music, Users, Search, Share2, List } from "lucide-react"
import Menu from "./Menu"

interface HeaderProps {
  activeTab: "songs" | "collaborate"
  setActiveTab: (tab: "songs" | "collaborate") => void
  toggleMenu: () => void
  toggleSearch: () => void
  togglePlaylistModal: () => void
  toggleCollaborationModal: () => void
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  toggleMenu,
  toggleSearch,
  togglePlaylistModal,
  toggleCollaborationModal,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
           <Menu></Menu>
          </div>

          <nav className="hidden md:flex space-x-4">
            <button
              onClick={() => setActiveTab("songs")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                activeTab === "songs" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Music className="mr-2" size={18} />
              Songs
            </button>

            <button
              onClick={() => setActiveTab("collaborate")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                activeTab === "collaborate"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Users className="mr-2" size={18} />
              Collaborate
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white" onClick={toggleSearch}>
              <Search size={24} />
            </button>
            <button className="text-gray-300 hover:text-white" onClick={toggleCollaborationModal}>
              <Share2 size={24} />
            </button>
            <button className="text-gray-300 hover:text-white" onClick={togglePlaylistModal}>
              <List size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

