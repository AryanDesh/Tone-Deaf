import { useEffect, useState } from "react"
import SongsPage from "./Songpage"
import CollaborationPage from "./CollabPage"
import { AudioContextProvider } from "../context"
import Player from "../components/Player"
import Header from "../components/Header"
import SearchBar from "../components/SearchBar"
import StarryBackground from "../components/Background"

export default function Pages() {
  const [activeTab, setActiveTab] = useState<"songs" | "collaborate">("songs")
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const toggleSearch = () => setSearchOpen(!searchOpen)
  const togglePlaylistModal = () => setShowPlaylistModal(!showPlaylistModal)
  const toggleCollaborationModal = () => setShowCollaborationModal(!showCollaborationModal)

  return (
    <AudioContextProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <StarryBackground />
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleMenu={toggleMenu}
          toggleSearch={toggleSearch}
          togglePlaylistModal={togglePlaylistModal}
          toggleCollaborationModal={toggleCollaborationModal}
        />

        {/* <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} activeTab={activeTab} setActiveTab={setActiveTab} /> */}
        <SearchBar
          searchOpen={searchOpen}
          toggleSearch={toggleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="pt-16 pb-28">
          {activeTab === "songs" ? (
            <SongsPage showPlaylistModal={showPlaylistModal} togglePlaylistModal={togglePlaylistModal} />
          ) : (
            <CollaborationPage 
            showCollaborationModal={showCollaborationModal}
            toggleCollaborationModal={toggleCollaborationModal}
          />
          )}
        </main>

        <Player />
      </div>
    </AudioContextProvider>
  )
}

