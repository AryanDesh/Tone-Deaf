import { Routes, BrowserRouter, Route } from "react-router"
import { Homepage, Songpage } from "./pages"
import { AudioContextProvider } from "./context"
import Collab from "./pages/CollabPage"

function App() {
  return (
    <div className="flex justify-center">
      <AudioContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/room" element={<Collab />}/>
            <Route path="/songs" element={<Songpage />} />
          </Routes>
        </BrowserRouter>
      </AudioContextProvider>
    </div>
  )
}

export default App
