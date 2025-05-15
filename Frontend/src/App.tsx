import { Routes, BrowserRouter, Route } from "react-router"
import { Homepage } from "./pages"
import { AudioContextProvider, CollabProvider, FriendsProvider, OfflineProvider } from "./context"
import { ProtectedRoute } from "./components"
import Pages from "./pages/Pages"
import CollabRoom from "./sections/Rooms"
function App() {
  return (
    <div className="flex justify-center w-100dvw h-100-dvh">
      <OfflineProvider>

      <AudioContextProvider >
      <CollabProvider> 
      <FriendsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/main" element={ <ProtectedRoute ><Pages /></ProtectedRoute> }/>
            <Route path="/collab" element={<ProtectedRoute ><CollabRoom/></ProtectedRoute>}/>
          </Routes>
        </BrowserRouter>
      </FriendsProvider>
      </CollabProvider>
      </AudioContextProvider>
      </OfflineProvider>
      </div>
  )
}

export default App
