
import { useState } from "react"
import "./App.css"

type HistoryItem = {
  id: number
  english: string
  tamil: string
  created_at: string
}

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
      console.error("Copy failed:", error)
    }
  }

  async function translateText() {
    if (!text.trim()) {
      setError(
        direction === "en-ta"
          ? "Please enter some English text."
          : "தயவுசெய்து தமிழில் உரையை உள்ளிடவும்."
      )
      return
    }

    setLoading(true)
    setError("")
    setTranslation("")
    setCopied(false)

    try {
      const response = await fetch(
        "https://tamil-translator-k3bb.onrender.com/translate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            direction: direction,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Translation failed"
        )
      }

      setTranslation(data.translation)
    } catch (error) {
      console.error(error)
      setError(
        "Translation failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    try {
      const response = await fetch(
        "https://tamil-translator-k3bb.onrender.com/history"
      )

      if (!response.ok) {
        throw new Error(
          "Failed to load history"
        )
      }

      const data = await response.json()

      setHistory(data)
      setShowHistory(true)
    } catch (error) {
      console.error(error)
      setError(
        "Could not load translation history."
      )
    }
  }

  async function clearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all translation history?"
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        "http://localhost:5000/history",
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error(
          "Failed to clear history"
        )
      }

      setHistory([])
      setShowHistory(true)
    } catch (error) {
      console.error(error)
      setError(
        "Could not clear translation history."
      )
    }
  }

  function swapDirection() {
    setDirection(
      direction === "en-ta"
        ? "ta-en"
        : "en-ta"
    )

    setText("")
    setTranslation("")
    setError("")
    setCopied(false)
  }

  const sourceLanguage =
    direction === "en-ta"
      ? "English"
      : "தமிழ்"

  const targetLanguage =
    direction === "en-ta"
      ? "Tamil"
      : "English"

  const translatorTitle =
    direction === "en-ta"
      ? "English → தமிழ்"
      : "தமிழ் → English"

  const inputPlaceholder =
    direction === "en-ta"
      ? "Type your English text here..."
      : "தமிழில் உரையை உள்ளிடவும்..."

  const outputPlaceholder =
    direction === "en-ta"
      ? "Your Tamil translation will appear here..."
      : "Your English translation will appear here..."

  return (
    <div className="app">

      {/* HERO SECTION */}
      <section className="hero">

        <p className="badge">
          ENGLISH ⇄ தமிழ்
        </p>

        <h1>
          Translate English and Tamil
        </h1>

        <p className="subtitle">
          A simple and fast English ↔ Tamil
          translation tool.
        </p>

        <button
          className="start-button"
          onClick={() => {
            document
              .querySelector(".translator")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }}
        >
          Start Translating
        </button>

      </section>

      {/* TRANSLATOR SECTION */}
      <section className="translator">

        <h2>
          {translatorTitle}
        </h2>

        {/* INPUT LANGUAGE */}
        <label>
          {sourceLanguage}
        </label>

        <textarea
          value={text}
          maxLength={4000}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder={inputPlaceholder}
        />

        <p className="character-count">
          {text.length}/4000 characters
        </p>

        {/* BUTTONS */}
        <div className="actions">

          {/* SWAP */}
          <button
            className="swap-button"
            onClick={swapDirection}
            type="button"
          >
            ⇄ Swap
          </button>

          {/* TRANSLATE */}
          <button
            className="translate-button"
            onClick={translateText}
            disabled={loading}
            type="button"
          >
            {loading
              ? "Translating..."
              : "Translate"}
          </button>

          {/* HISTORY */}
          <button
            className="history-button"
            onClick={loadHistory}
            type="button"
          >
            History
          </button>

        </div>

        {/* OUTPUT LANGUAGE */}
        <label>
          {targetLanguage}
        </label>

        <div className="translation-box">

          <div className="translation-result">

            {error
              ? error
              : translation ||
                outputPlaceholder}

          </div>

          {/* COPY */}
          {translation && !error && (
            <button
              className="copy-button"
              onClick={copyTranslation}
              type="button"
            >
              {copied
                ? "Copied ✓"
                : "Copy Translation"}
            </button>
          )}

        </div>

        {/* HISTORY */}
        {showHistory && (
          <div className="history-panel">

            <div className="history-header">

              <h3>
                Translation History
              </h3>

              <div className="history-actions">

                {history.length > 0 && (
                  <button
                    className="clear-history"
                    onClick={clearHistory}
                    type="button"
                  >
                    Clear History
                  </button>
                )}

                <button
                  className="close-history"
                  onClick={() =>
                    setShowHistory(false)
                  }
                  type="button"
                >
                  Close
                </button>

              </div>

            </div>

            {/* EMPTY HISTORY */}
            {history.length === 0 ? (

              <p>
                No translations yet.
              </p>

            ) : (

              /* HISTORY LIST */
              <div className="history-list">

                {history.map((item) => (

                  <div
                    className="history-item"
                    key={item.id}
                  >

                    <div>
                      <strong>
                        English
                      </strong>

                      <p>
                        {item.english}
                      </p>
                    </div>

                    <div>
                      <strong>
                        Tamil
                      </strong>

                      <p>
                        {item.tamil}
                      </p>
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
