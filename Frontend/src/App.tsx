import { Routes, BrowserRouter, Route } from "react-router"
import { Homepage } from "./pages"

function App() {
  return (
    <main className="flex justify-center">
      <div className="bg-primary-blue w-full h-full text-primary-white">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </main>
  )
}

export default App
