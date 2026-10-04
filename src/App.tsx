import { useState } from "react"
import "./App.css"

type HistoryItem = {
  id: number
  english: string
  tamil: string
  created_at: string
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://tamil-translator-k3bb.onrender.com"

function App() {
  const [text, setText] = useState("")
  const [translation, setTranslation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const [direction, setDirection] =
    useState<"en-ta" | "ta-en">("en-ta")

  async function copyTranslation() {
    if (!translation) return

    try {
      await navigator.clipboard.writeText(translation)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error(error)
      setError("Could not copy translation.")
    }
  }

  async function translateText() {
    if (!text.trim()) {
      setError(
        direction === "en-ta"
          ? "Please enter some English text."
          : "Please enter some Tamil text."
      )
      return
    }

    setLoading(true)
    setError("")
    setTranslation("")

    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          direction: direction,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      setTranslation(data.translation || "")
    } catch (error) {
      console.error(error)

      setError(
        "Translation failed. Please check your connection and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    setError("")

    try {
      const response = await fetch(`${API_URL}/history`)

      if (!response.ok) {
        throw new Error("Failed to load history")
      }

      const data = await response.json()

      setHistory(data)
      setShowHistory(true)
    } catch (error) {
      console.error(error)
      setError("Could not load translation history.")
    }
  }

  async function clearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all translation history?"
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${API_URL}/history`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to clear history")
      }

      setHistory([])
      setShowHistory(true)
      setError("")
    } catch (error) {
      console.error(error)
      setError("Could not clear translation history.")
    }
  }

  function swapDirection() {
    setDirection((current) =>
      current === "en-ta" ? "ta-en" : "en-ta"
    )

    setText("")
    setTranslation("")
    setError("")
    setCopied(false)
  }

  function scrollToTranslator() {
    document
      .querySelector(".translator")
      ?.scrollIntoView({
        behavior: "smooth",
      })
  }

  const inputLanguage =
    direction === "en-ta" ? "English" : "தமிழ்"

  const outputLanguage =
    direction === "en-ta" ? "Tamil" : "English"

  const inputPlaceholder =
    direction === "en-ta"
      ? "Type your English text here..."
      : "தமிழில் உங்கள் உரையை இங்கே உள்ளிடுங்கள்..."

  const outputPlaceholder =
    direction === "en-ta"
      ? "Your Tamil translation will appear here..."
      : "Your English translation will appear here..."

  return (
    <div className="app">

      {/* HERO SECTION */}
      <section className="hero">

        <p className="badge">
          {direction === "en-ta"
            ? "ENGLISH → தமிழ்"
            : "தமிழ் → ENGLISH"}
        </p>

        <h1>
          Translate
          <br />
          <span>
            {direction === "en-ta"
              ? "English into Tamil"
              : "Tamil into English"}
          </span>
        </h1>

        <p className="subtitle">
          A simple, fast and easy-to-use language translation
          tool with translation history.
        </p>

        <button
          className="start-button"
          onClick={scrollToTranslator}
        >
          Start Translating →
        </button>

      </section>

      {/* TRANSLATOR SECTION */}
      <section className="translator">

        <div className="translator-header">

          <div>
            <p className="section-label">
              TRANSLATION TOOL
            </p>

            <h2>
              {direction === "en-ta"
                ? "English → தமிழ்"
                : "தமிழ் → English"}
            </h2>

            <p className="section-description">
              Enter your text below and get your translation instantly.
            </p>
          </div>

          <button
            className="swap-button"
            onClick={swapDirection}
            title="Swap translation direction"
          >
            ⇄ Swap
          </button>

        </div>

        {/* INPUT */}
        <div className="language-card">

          <div className="language-header">

            <label>
              {inputLanguage}
            </label>

            <span>
              {text.length}/4000
            </span>

          </div>

          <textarea
            value={text}
            maxLength={4000}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder={inputPlaceholder}
          />

        </div>

        {/* ACTION BUTTONS */}
        <div className="actions">

          <button
            className="translate-button"
            onClick={translateText}
            disabled={loading}
          >
            {loading
              ? "Translating..."
              : "Translate →"}
          </button>

          <button
            className="history-button"
            onClick={loadHistory}
          >
            History
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* OUTPUT */}
        <div className="language-card output-card">

          <div className="language-header">

            <label>
              {outputLanguage}
            </label>

            {translation && !error && (
              <button
                className="copy-button"
                onClick={copyTranslation}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            )}

          </div>

          <div className="translation-result">

            {translation && !error
              ? translation
              : outputPlaceholder}

          </div>

        </div>

        {/* HISTORY */}
        {showHistory && (
          <div className="history-panel">

            <div className="history-header">

              <div>
                <p className="section-label">
                  SAVED TRANSLATIONS
                </p>

                <h3>
                  Translation History
                </h3>
              </div>

              <div className="history-actions">

                {history.length > 0 && (
                  <button
                    className="clear-history"
                    onClick={clearHistory}
                  >
                    Clear History
                  </button>
                )}

                <button
                  className="close-history"
                  onClick={() =>
                    setShowHistory(false)
                  }
                >
                  Close
                </button>

              </div>

            </div>

            {history.length === 0 ? (
              <div className="empty-history">
                <p>No translations yet.</p>
                <span>
                  Your previous translations will appear here.
                </span>
              </div>
            ) : (
              <div className="history-list">

                {history.map((item) => (
                  <div
                    className="history-item"
                    key={item.id}
                  >

                    <div className="history-language">
                      <strong>English</strong>
                      <p>{item.english}</p>
                    </div>

                    <div className="history-arrow">
                      →
                    </div>

                    <div className="history-language">
                      <strong>Tamil</strong>
                      <p>{item.tamil}</p>
                    </div>

                    <small>
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </small>

                  </div>
                ))}

              </div>
            )}

          </div>
        )}

      </section>

    </div>
  )
}

export default App
