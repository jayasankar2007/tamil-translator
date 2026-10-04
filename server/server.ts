import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import axios from "axios"
import {
  initializeDatabase,
  saveTranslation,
  getTranslations,
  clearTranslations
} from "./database"


dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/history", (req, res) => {
  try {
    const history = getTranslations()

    res.json(history)
  } catch (error) {
    console.log("History error:", error)

    res.status(500).json({
      error: "Could not load translation history"
    })
  }
})


app.post("/translate", async (req, res) => {
  const { text, direction = "en-ta" } = req.body

  if (!text || !text.trim()) {
    return res.status(400).json({
      error: "Text is required"
    })
  }

  if (text.length > 4000) {
    return res.status(400).json({
      error: "Text must be 4000 characters or less."
    })
  }

  try {
    console.log("Translating:", text)

    const response = await axios.post(
  "https://api.murf.ai/v1/text/translate",
  {
    targetLanguage: direction === "ta-en" ? "en-US" : "ta-IN",
    texts: [text]
  },
  {
    headers: {
      "api-key": process.env.MURF_API_KEY,
      "Content-Type": "application/json"
    }
  }
)

    const translation =
      response.data?.translations?.[0]?.translated_text

    if (!translation) {
      console.log("Unexpected Murf response:", response.data)
      throw new Error("No translation returned by Murf")
    }

    console.log("Translation:", translation)

    saveTranslation(text, translation)

    res.json({
      translation
    })
  } catch (error: any) {
    console.log("Translation error:")

    if (error.response) {
      console.log("Status:", error.response.status)
      console.log("Data:", error.response.data)
    } else {
      console.log(error.message)
    }

    res.status(500).json({
      error: "Translation service failed"
    })
  }
})

app.delete("/history", (req, res) => {
  try {
    clearTranslations()

    res.json({
      message: "Translation history cleared"
    })
  } catch (error) {
    console.log("Clear history error:", error)

    res.status(500).json({
      error: "Could not clear translation history"
    })
  }
})

initializeDatabase().then(() => {
  app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000")
  })
})