import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultTopic = searchParams.get("topic") || "Budgeting";
  const [selectedTopic, setSelectedTopic] = useState(defaultTopic);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Beginner");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: optionIndex }
  
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [error, setError] = useState("");
  const [isMockData, setIsMockData] = useState(false);

  const topics = [
    { id: "Budgeting", label: "Budgeting & 50/30/20", icon: "📊" },
    { id: "Taxes", label: "Indian Taxation & 80C", icon: "📑" },
    { id: "Savings", label: "Emergency Funds & Savings", icon: "💰" },
    { id: "Loans", label: "Loans, EMIs & CIBIL", icon: "💳" },
    { id: "Investments", label: "SIPs & Mutual Funds", icon: "📈" },
    { id: "Retirement", label: "NPS, EPF & FIRE", icon: "👵" },
  ];

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchQuiz = async (topic, difficulty) => {
    setIsLoading(true);
    setError("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsQuizCompleted(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ai/quiz",
        { topic, difficulty },
        getAuthConfig()
      );

      if (response.data.success && Array.isArray(response.data.quiz)) {
        setQuestions(response.data.quiz);
        setIsMockData(!!response.data.isMock);
      } else {
        throw new Error("Failed to load quiz data");
      }
    } catch (err) {
      console.error("Failed to generate AI quiz:", err);
      setError("Unable to generate AI quiz. Please verify the backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz(selectedTopic, selectedDifficulty);
  }, []);

  const handleSelectOption = (questionIndex, optionIndex) => {
    // Only allow selecting once per question
    if (userAnswers[questionIndex] !== undefined) return;

    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const currentQ = questions[currentQuestionIndex];
  const hasAnsweredCurrent = currentQ && userAnswers[currentQuestionIndex] !== undefined;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🎯</span> FinNova AI Quiz Master
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Test your financial knowledge with dynamic AI-generated quizzes and instant explanations.
          </p>
        </div>

        <button
          onClick={() => navigate("/learning")}
          className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition shadow-xxs cursor-pointer flex items-center gap-1.5"
        >
          <span>📚</span> Back to Learning Hub
        </button>
      </div>

      {/* Topic & Difficulty Selector Panel */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Topics Chips */}
          <div className="space-y-2 flex-1">
            <span className="block text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Select Topic</span>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTopic(t.id);
                    fetchQuiz(t.id, selectedDifficulty);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedTopic === t.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Dropdown / Selector */}
          <div className="space-y-2">
            <span className="block text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Difficulty Level</span>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    fetchQuiz(selectedTopic, diff);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedDifficulty === diff
                      ? "bg-white text-indigo-600 shadow-xxs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-rose-600 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Main Quiz Area */}
      {isLoading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl animate-spin">
            ⚙️
          </div>
          <h3 className="text-lg font-bold text-slate-800">Generating AI Quiz...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gemini is crafting 5 scenario-based questions for <span className="font-bold text-slate-700">{selectedTopic} ({selectedDifficulty})</span>.
          </p>
        </div>
      ) : isQuizCompleted ? (
        /* Results Screen */
        <div className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-10 shadow-sm space-y-8">
          
          {/* Result Header */}
          <div className="text-center space-y-3 border-b border-slate-100 pb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white text-4xl font-black flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
              {calculateScore() >= 4 ? "🏆" : calculateScore() >= 3 ? "🌟" : "📖"}
            </div>
            
            <h2 className="text-3xl font-black text-slate-900">
              {calculateScore() === 5
                ? "Perfect Score! Financial Genius! 🎉"
                : calculateScore() >= 3
                ? "Great Job! Solid Financial Literacy! 👏"
                : "Good Effort! Keep Learning! 💡"}
            </h2>

            <p className="text-sm font-semibold text-slate-500">
              You scored <span className="text-indigo-600 font-extrabold text-lg">{calculateScore()} / {questions.length}</span> ({Math.round((calculateScore() / questions.length) * 100)}%) in <span className="text-slate-800 font-bold">{selectedTopic} ({selectedDifficulty})</span>.
            </p>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Detailed Answer Review</h3>
            
            {questions.map((q, idx) => {
              const isCorrect = userAnswers[idx] === q.correctAnswer;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${
                    isCorrect ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                  } space-y-3`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-xs font-bold text-slate-900 leading-relaxed">
                      {idx + 1}. {q.question}
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold ${
                      isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                    }`}>
                      {isCorrect ? "Correct (+1)" : "Incorrect"}
                    </span>
                  </div>

                  {/* Options review */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xxs font-medium">
                    {q.options.map((opt, optIdx) => {
                      const wasSelected = userAnswers[idx] === optIdx;
                      const isTargetCorrect = q.correctAnswer === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isTargetCorrect
                              ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                              : wasSelected
                              ? "bg-rose-100 border-rose-300 text-rose-900"
                              : "bg-white border-slate-200 text-slate-600 opacity-75"
                          }`}
                        >
                          <span>{opt}</span>
                          {isTargetCorrect && <span className="text-emerald-700 font-bold">✓ Answer</span>}
                          {wasSelected && !isTargetCorrect && <span className="text-rose-700 font-bold">✕ Picked</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <p className="text-xxs text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Result Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => fetchQuiz(selectedTopic, selectedDifficulty)}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow cursor-pointer"
            >
              🔄 Generate New Quiz on {selectedTopic}
            </button>
            <button
              onClick={() => navigate("/learning")}
              className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              📚 Return to Masterclass Learning Hub
            </button>
          </div>

        </div>
      ) : questions.length > 0 && currentQ ? (
        /* Quiz Question Player */
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Player Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-indigo-600 uppercase text-xxs font-extrabold tracking-wider">{selectedTopic} • {selectedDifficulty}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Box */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((optionText, optIdx) => {
              const selectedOpt = userAnswers[currentQuestionIndex];
              const isSelected = selectedOpt === optIdx;
              const isCorrectOpt = currentQ.correctAnswer === optIdx;

              let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30";
              if (hasAnsweredCurrent) {
                if (isCorrectOpt) {
                  btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20";
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = "bg-rose-50 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-500/20";
                } else {
                  btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                  disabled={hasAnsweredCurrent}
                  className={`p-4 sm:p-5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition duration-200 flex justify-between items-center cursor-pointer disabled:cursor-default ${btnStyle}`}
                >
                  <span className="leading-snug">{optionText}</span>
                  {hasAnsweredCurrent && isCorrectOpt && (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 font-bold">✓</span>
                  )}
                  {hasAnsweredCurrent && isSelected && !isCorrectOpt && (
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shrink-0 font-bold">✕</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Appears after user answers) */}
          {hasAnsweredCurrent && (
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-extrabold text-xs text-indigo-900">
                <span>💡</span>
                <span>AI Concept Explanation</span>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next / Finish Navigation Button */}
          {hasAnsweredCurrent && (
            <div className="flex justify-end pt-4 border-t border-slate-50">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow cursor-pointer flex items-center gap-2"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? "Next Question →" : "See Final Results →"}</span>
              </button>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
}

export default Quiz;
