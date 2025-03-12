import { Routes, BrowserRouter, Route } from "react-router"
import { Homepage, Songpage } from "./pages"
import { AudioContextProvider } from "./context"
import Pages from "./pages/Pages"
function App() {
  return (
    <div className="flex justify-center w-100dvw h-100-dvh">
      <AudioContextProvider >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/main" element={<Pages />}/>
          </Routes>
        </BrowserRouter>
      </AudioContextProvider>
      </div>
  )
}

export default App
