import { useState } from "react"
import { AudioContextProvider, CollabProvider, useCollabContext } from "../context"
import { SearchBar, StarryBackground , Header, Player } from "../components"
import { ContactPage, FriendsPage, AboutPage, CollaborationPage, SongPage, PlaylistsPage  } from "./"

export default function Pages() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const [activePage, setActivePage] = useState<string>("songs")
  const {isHost, isInCollab }= useCollabContext();

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const toggleSearch = () => setSearchOpen(!searchOpen)
  const togglePlaylistModal = () => setShowPlaylistModal(!showPlaylistModal)
  const toggleCollaborationModal = () => setShowCollaborationModal(!showCollaborationModal)

  const renderPage = () => {
    if(!isInCollab || (isInCollab && isHost)){
      switch (activePage) {
        case "songs":
          return (
            <SongPage
              showPlaylistModal={showPlaylistModal}
              togglePlaylistModal={togglePlaylistModal}
              showCollaborationModal={showCollaborationModal}
              toggleCollaborationModal={toggleCollaborationModal}
            /> 
          )
        case "collaborate":
          return (
            <CollaborationPage
              showCollaborationModal={showCollaborationModal}
              toggleCollaborationModal={toggleCollaborationModal}
              showPlaylistModal={showPlaylistModal}
              togglePlaylistModal={togglePlaylistModal}
            />
          )
        case "friends":
          return <FriendsPage />
        case "playlists":

          return <PlaylistsPage showPlaylistModal={showPlaylistModal} togglePlaylistModal={togglePlaylistModal}/>
        case "about":
          return <AboutPage />
        case "contact":
          return <ContactPage />
        default:
          return (
            <SongPage
              showPlaylistModal={showPlaylistModal}
              togglePlaylistModal={togglePlaylistModal}
              showCollaborationModal={showCollaborationModal}
              toggleCollaborationModal={toggleCollaborationModal}
            />
          )
      }
    }
    else{
      return (
        <CollaborationPage
          showCollaborationModal={showCollaborationModal}
          toggleCollaborationModal={toggleCollaborationModal}
          showPlaylistModal={showPlaylistModal}
          togglePlaylistModal={togglePlaylistModal}
        />
      )
    }
  }

  return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <StarryBackground />
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          toggleMenu={toggleMenu}
          toggleSearch={toggleSearch}
          togglePlaylistModal={togglePlaylistModal}
          toggleCollaborationModal={toggleCollaborationModal}
          />

        <SearchBar
          searchOpen={searchOpen}
          toggleSearch={toggleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          />

        <main className="pt-16 pb-28 relative">{renderPage()}</main>
        <Player />
      </div>
    )
}