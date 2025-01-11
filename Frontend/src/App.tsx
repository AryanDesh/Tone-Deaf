import { Routes, BrowserRouter, Route } from "react-router"
import { Homepage, Songpage } from "./pages"

function App() {
  return (
    <div className="flex justify-center">
      <div className="bg-primary-blue w-full h-full text-primary-white">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/songs" element={<Songpage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
