import { useState, useEffect } from "react";
import Papa from "papaparse";
import { playChinese } from "./utils/tts";



function QuizPage() {
  const [started, setStarted] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [allData, setAllData] = useState([]); // raw unfiltered data
  const [questions, setQuestions] = useState([]);
  const [quizType, setQuizType] = useState("Hanzi");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const filterQuestionsByCategories = (selectedCats) => {
  if (selectedCats.length === 0) {
    setQuestions([]);
  } else {
    const filtered = allData.filter((q) => selectedCats.includes(q.Category));
    setQuestions(filtered);
  }
};


  // Fetch dictionary
useEffect(() => {
  fetch("/dictionary.csv")
    .then((response) => response.text())
    .then((csvText) => {
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      const data = parsed.data;
      setAllData(data);
      setQuestions(data);

      // Get unique categories
      const categorySet = new Set(data.map((item) => item.Category));
      setCategories(["All", ...Array.from(categorySet)]);
    });
}, []); // <-- don't forget to add dependency array here!

// Generate a new question when questions or quiz type change
useEffect(() => {
  if (selectedCategories.includes("All")) {
    setQuestions(allData);
  } else {
    const filtered = allData.filter(q => selectedCategories.includes(q.Category));
    setQuestions(filtered);
  }
}, [selectedCategories, allData]);




  //generateQuestion
  const generateQuestion = () => {
  if (questions.length === 0) return;

  const correct = questions[Math.floor(Math.random() * questions.length)];

  // Filter only questions from the same category as the correct answer
  const sameCategoryQuestions = questions.filter(
    q => q.Category === correct.Category
  );

  let options = new Set([correct[quizType]]);

  while (options.size < 4 && sameCategoryQuestions.length > 1) {
    const random = sameCategoryQuestions[Math.floor(Math.random() * sameCategoryQuestions.length)];
    options.add(random[quizType]);
  }

  setCurrentQuestion(correct);
  setChoices(Array.from(options).sort(() => Math.random() - 0.5));
  setSelected("");
  setFeedback("");
};

const reshuffleChoices = () => {
  if (!currentQuestion) return;

  const sameCategoryQuestions = questions.filter(
    q => q.Category === currentQuestion.Category
  );

  let options = new Set([currentQuestion[quizType]]);

  while (options.size < 4 && sameCategoryQuestions.length > 1) {
    const random = sameCategoryQuestions[Math.floor(Math.random() * sameCategoryQuestions.length)];
    options.add(random[quizType]);
  }

  setChoices(Array.from(options).sort(() => Math.random() - 0.5));
  setSelected("");
  setFeedback("");
};


  const checkAnswer = (choice) => {
    setSelected(choice);
    const correctAnswer = currentQuestion[quizType];
    if (choice === correctAnswer) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong. Correct answer: ${correctAnswer}`);
    }
  };

  const getQuestionPrompt = () => {
    if (!currentQuestion) return "";
    if (quizType === "Hanzi") return currentQuestion.English;
    if (quizType === "Pinyin") return currentQuestion.Hanzi;
    if (quizType === "English") return currentQuestion.Pinyin;
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Chinese Quiz App</h1>

      <div className="mb-4">
      <label className="block font-medium mb-2">Select Category (multiple allowed):</label>

  <div className="flex flex-wrap gap-3 mb-4">
  {categories
      .filter((cat) => cat !== "All")
      .map((cat) => (
        <label key={cat} className="flex items-center space-x-2">
        <input
        type="checkbox"
        value={cat}
        checked={selectedCategories.includes(cat)}
        onChange={(e) => {
          const value = e.target.value;
          const newSelection = e.target.checked
            ? [...selectedCategories, value]
            : selectedCategories.filter((c) => c !== value);
          setSelectedCategories(newSelection);

        }}
        />
        <span>{cat}</span>
        </label>
      ))}

  </div>

  <div className="mb-4 flex gap-2">
  <button
    className="bg-gray-200 px-3 py-1 rounded"
    onClick={() => {
      setSelectedCategories(categories.filter(cat => cat ));
      setQuestions(allData);
    }}
  >
    Select All
  </button>
  <button
    className="bg-gray-200 px-3 py-1 rounded"
    onClick={() => {
      setSelectedCategories([]);
      setQuestions([]);
    }}
  >
    Clear All
  </button>
</div>
</div>


      {/* Quiz Type Selector */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Select Quiz Type:</label>
        <div className="flex gap-4 flex-wrap">
          <label>
            <input
              type="radio"
              value="Hanzi"
              checked={quizType === "Hanzi"}
              onChange={(e) => setQuizType(e.target.value)}
            />
            English → Hanzi

          </label>
          <label>
            <input
              type="radio"
              value="Pinyin"
              checked={quizType === "Pinyin"}
              onChange={(e) => setQuizType(e.target.value)}
            />
            Hanzi → Pinyin
          </label>
          <label>
            <input
              type="radio"
              value="English"
              checked={quizType === "English"}
              onChange={(e) => setQuizType(e.target.value)}
            />
            Pinyin → English
          </label>
        </div>
      </div>

      {/* Quiz Card */}
      {currentQuestion && (
        <div className="border rounded-lg p-4 shadow-sm mb-4">
          <h2 className="text-lg font-semibold mb-2">
            What is:{" "}
            <span className="text-blue-600">{getQuestionPrompt()}</span>?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {choices.map((choice, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  className={`flex-1 py-2 px-4 border rounded text-center ${
                    selected === choice
                      ? "bg-gray-300"
                      : "hover:bg-blue-100 transition"
                  }`}
                  onClick={() => checkAnswer(choice)}
                  disabled={selected !== ""}
                >
                  {choice}
                </button>
                <button
                  onClick={() => playChinese(choice)}
              
                >
                  🔊
                </button>
              </div>
            ))}
          </div>

          {feedback && (
            <div className="mt-4 space-y-2">
              <p className="font-medium">{feedback}</p>
              <button
                className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                onClick={reshuffleChoices}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Next Button */}
      <div className="grid gap-4 mt-6">
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          onClick={generateQuestion}
          disabled={questions.length === 0}
        >
          Next Question
        </button>
      </div>
    </div>
  );
}

export default QuizPage;
