import { useState } from 'react'
import './App.css'

interface QuizAnswer {
  questionId: number
  answer: string
}

interface ApiResponse {
  response: string
  error?: string
}

function App() {
  const [screen, setScreen] = useState<'intro' | 'quiz' | 'loading' | 'results'>('intro')
  const [age, setAge] = useState<number | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [recommendation, setRecommendation] = useState<string>('')
  const [error, setError] = useState<string>('')

  const quizQuestions = [
    {
      id: 0,
      question: "What subjects do you enjoy most in school?",
      type: "multiple",
      options: ["Math & Science", "English & Writing", "Arts & Creative", "Social Studies & History", "Technology & Computers"]
    },
    {
      id: 1,
      question: "What are your main strengths? (Choose all that apply)",
      type: "multiple",
      options: ["Problem-solving", "Communication", "Creativity", "Leadership", "Analytical thinking", "Teamwork"]
    },
    {
      id: 2,
      question: "What activities are you passionate about?",
      type: "free",
      placeholder: "e.g., coding, painting, sports, helping others..."
    },
    {
      id: 3,
      question: "Describe a project or achievement you're proud of:",
      type: "free",
      placeholder: "e.g., built a website, led a team, created an art piece..."
    },
    {
      id: 4,
      question: "What kind of work environment appeals to you most?",
      type: "multiple",
      options: ["Independent & focused work", "Collaborative team settings", "Outdoor/hands-on work", "Creative & innovative", "Helping/serving others"]
    },
    {
      id: 5,
      question: "What are your career interests or goals?",
      type: "free",
      placeholder: "e.g., make a difference, earn well, be creative, work with people..."
    }
  ]

  const handleAgeSubmit = (selectedAge: number) => {
    setAge(selectedAge)
    setScreen('quiz')
  }

  const handleAnswerSelect = (answer: string) => {
    const existing = answers.find(a => a.questionId === currentQuestion)
    if (existing) {
      setAnswers(answers.map(a => a.questionId === currentQuestion ? { ...a, answer } : a))
    } else {
      setAnswers([...answers, { questionId: currentQuestion, answer }])
    }
  }

  const handleAnswerMultiple = (option: string) => {
    const existing = answers.find(a => a.questionId === currentQuestion)
    const current = existing?.answer || ""
    const selectedOptions = current ? current.split(" | ") : []
    
    if (selectedOptions.includes(option)) {
      const updated = selectedOptions.filter(o => o !== option).join(" | ")
      handleAnswerSelect(updated)
    } else {
      const updated = current ? `${current} | ${option}` : option
      handleAnswerSelect(updated)
    }
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuiz()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitQuiz = async () => {
    setScreen('loading')
    setError('')

    const answersText = quizQuestions
      .map(q => {
        const answer = answers.find(a => a.questionId === q.id)?.answer || "Not answered"
        return `${q.question}: ${answer}`
      })
      .join("\n")

    const ageGroup = age && age <= 17 ? "high school student" : "adult"
    const recommendationType = age && age <= 17 ? "college majors" : "career pathways"

    const prompt = `You are advising me personally. I am a ${ageGroup}.

  Based on my quiz responses below, recommend 2-3 ${recommendationType} that would suit me. For each recommendation:
  - Use first-person / direct advice addressing me (e.g., "You might consider...").
  - Give 1-2 short sentences explaining why it's a good fit and what to expect.
  - Keep the entire response concise (aim for under 250 words) to avoid token cutoff.
  - Format the output with short headings or bullets. Use bold for key phrases when helpful.
  - Give examples of majors if age is 17 or under, or job roles if adult.

  Quiz Responses:
  ${answersText}

  Please be practical, encouraging, and concise.`

    try {
      const response = await fetch('https://find-your-future-me-b.vercel.app/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data: ApiResponse = await response.json()
      
      if (data.error) {
        setError('Could not generate recommendations. Please try again.')
        setScreen('quiz')
      } else {
        setRecommendation(data.response)
        setScreen('results')
      }
    } catch (err) {
      setError('Something went wrong. Please check your backend connection.')
      setScreen('quiz')
    }
  }

  const handleReset = () => {
    setScreen('intro')
    setAge(null)
    setAnswers([])
    setCurrentQuestion(0)
    setRecommendation('')
    setError('')
  }

  const currentQ = quizQuestions[currentQuestion]
  const currentAnswer = answers.find(a => a.questionId === currentQuestion)?.answer || ""
  const selectedOptions = currentAnswer ? currentAnswer.split(" | ").filter(o => o) : []

  // Simple markdown-like parser for AI responses - Generated using ChatGPT
  const parseAIResponse = (text: string) => {
    if (!text) return ''
    const lines = text.split('\n')
    let html = ''
    let inList = false
    for (let rawLine of lines) {
      const line = rawLine.trim()
      if (!line) {
        if (inList) {
          html += '</ul>'
          inList = false
        }
        continue
      }

      // headings
      const hMatch = line.match(/^(#{1,6})\s*(.*)$/)
      if (hMatch) {
        if (inList) { html += '</ul>'; inList = false }
        const level = Math.min(3, hMatch[1].length)
        html += `<h${level}>${formatInline(escapeHtml(hMatch[2]))}</h${level}>`
        continue
      }

      // bullet
      if (/^[\-*]\s+/.test(line)) {
        if (!inList) { html += '<ul>'; inList = true }
        html += `<li>${formatInline(escapeHtml(line.replace(/^[\-*]\s+/, '')))}</li>`
        continue
      }

      // normal paragraph
      if (inList) { html += '</ul>'; inList = false }
      html += `<p>${formatInline(escapeHtml(line))}</p>`
    }
    if (inList) html += '</ul>'
    return html
  }

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const formatInline = (s: string) => {
    // bold **text**
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // italic *text*
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code `code`
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
    return s
  }

  return (
    <div className="app-container">
      {screen === 'intro' && (
        <div className="screen intro-screen">
          <div className="intro-content">
            <h1>Find Your Future</h1>
            <p className="subtitle">Discover the perfect career or college major for you</p>
            
            <div className="intro-card">
              <p className="intro-text">Before we begin, tell us your age range:</p>
              
              <div className="age-buttons">
                <button 
                  className="age-btn"
                  onClick={() => handleAgeSubmit(14)}
                >
                  <span className="age-label">13-17</span>
                  <span className="age-desc">High School Student</span>
                </button>
                
                <button 
                  className="age-btn"
                  onClick={() => handleAgeSubmit(22)}
                >
                  <span className="age-label">18-25</span>
                  <span className="age-desc">College/Young Adult</span>
                </button>
                
                <button 
                  className="age-btn"
                  onClick={() => handleAgeSubmit(35)}
                >
                  <span className="age-label">26+</span>
                  <span className="age-desc">Career Professional</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 'quiz' && (
        <div className="screen quiz-screen">
          <div className="quiz-container">
            <div className="quiz-header">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>
              <p className="question-number">Question {currentQuestion + 1} of {quizQuestions.length}</p>
            </div>

            <div className="quiz-content">
              <h2>{currentQ.question}</h2>

              {currentQ.type === 'multiple' && (
                <div className="options-container">
                  {currentQ.options?.map((option) => (
                    <button
                      key={option}
                      className={`option-btn ${selectedOptions.includes(option) ? 'selected' : ''}`}
                      onClick={() => handleAnswerMultiple(option)}
                    >
                      <span className="checkbox">{selectedOptions.includes(option) ? '✓' : ''}</span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'free' && (
                <textarea
                  className="free-response"
                  placeholder={currentQ.placeholder}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                />
              )}

              {error && <p className="error-message">{error}</p>}
            </div>

            <div className="quiz-footer">
              <button 
                className="nav-btn prev-btn"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>

              <button 
                className={`nav-btn next-btn ${currentQuestion === quizQuestions.length - 1 ? 'submit' : ''}`}
                onClick={handleNext}
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Get Recommendations 🎯' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === 'loading' && (
        <div className="screen loading-screen">
          <div className="loading-content">
            <div className="spinner"></div>
            <h2>Analyzing your responses...</h2>
            <p>Getting personalized recommendations from AI</p>
          </div>
        </div>
      )}

      {screen === 'results' && (
        <div className="screen results-screen">
          <div className="results-container">
            <h1>Your Recommendations</h1>
            
            <div className="recommendations-card">
              <div className="recommendation-text" dangerouslySetInnerHTML={{ __html: parseAIResponse(recommendation) }} />
            </div>

            <div className="results-actions">
              <button className="restart-btn" onClick={handleReset}>
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
