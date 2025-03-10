import type React from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  searchOpen: boolean
  toggleSearch: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ searchOpen, toggleSearch, searchQuery, setSearchQuery }) => {
  if (!searchOpen) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg z-30 p-4">
      <div className="max-w-3xl mx-auto flex items-center">
        <Search size={24} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none"
          autoFocus
        />
        <button onClick={toggleSearch} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
    </div>
  )
}

export default SearchBar

