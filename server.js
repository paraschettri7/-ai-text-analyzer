
const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("AI Text Analyzer is running!");
});

// AI Text Analysis endpoint
app.post("/analyze", async (req, res) => {
    try {
        // Get text from the request body
        const text = req.body.text;

        // Validate input
        if (!text) {
            return res.status(400).json({
                error: "Please provide text to analyze"
            });
        }

        // Import Gemini SDK
        const { GoogleGenAI } = await import("@google/genai");

        // Create Gemini client
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        console.log("Analyzing text...");

        // Send text to Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Analyze this text.

            Return:
            1. Sentiment (Positive, Negative, or Neutral)
            2. A short summary
            3. Important keywords

            Text: ${text}`,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: {
                    type: "object",
                    properties: {
                        sentiment: {
                            type: "string",
                            enum: ["Positive", "Negative", "Neutral"]
                        },
                        summary: {
                            type: "string"
                        },
                        keywords: {
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: ["sentiment", "summary", "keywords"]
                }
            }
        });

        // Convert JSON string into JavaScript object
        const data = JSON.parse(response.text);

        // Send result to user
        res.json(data);

    } catch (error) {
        console.error("Analysis error:", error);

        res.status(500).json({
            error: "Something went wrong while analyzing the text"
        });
    }
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
