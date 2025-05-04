import { useState, useCallback, useEffect } from "react";

interface UseSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchOpen: boolean;
  toggleSearch: () => void;
  closeSearch: () => void;
}

export function useSearch(): UseSearchResult {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Toggle search modal visibility
  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
    
    // Clear search when closing
    if (searchOpen) {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Close search modal
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      
      // Close search with Escape key
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  return {
    searchQuery,
    setSearchQuery,
    searchOpen,
    toggleSearch,
    closeSearch
  };
}