import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import QuizPage from "./QuizPage";
import DictionaryPage from "./DictionaryPage";

function App() {
  return (
    <Router>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Quiz</Link>
        <Link to="/dictionary">Dictionary</Link>
        </nav>

        <div class="bg-red-500 text-white p-4 text-xl font-bold">
  If you see this red box, Tailwind is working!
</div>



        <Routes>
          <Route path="/" element={<QuizPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
        </Routes>

    </Router>
  );
}

export default App;
