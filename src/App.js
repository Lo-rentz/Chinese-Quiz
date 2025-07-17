import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import QuizPage from "./QuizPage";
import DictionaryPage from "./DictionaryPage";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const [ttsSpeed, setTtsSpeed] = useState(1.0); // TTS speed in global state

  return (
    <Router>
      <div className="p-4 font-sans">
        {/* Header/Nav */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Quiz
            </Link>
            <Link
              to="/dictionary"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Dictionary
            </Link>
          </div>

          <div className="flex justify-end p-2">
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="border px-3 py-1 rounded text-sm"
  >
    {darkMode ? "🌙 Dark" : "🌞 Light"}
  </button>
</div>


          {/* 🔊 TTS Speed UI */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">TTS Speed:</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={ttsSpeed}
              onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">{ttsSpeed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<QuizPage ttsSpeed={ttsSpeed} />} />
          <Route path="/dictionary" element={<DictionaryPage ttsSpeed={ttsSpeed} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
