
const express = require("express");
require("dotenv").config();

const app = express();

// Allow the deployed frontend and the local Vite development server to call the API.
const configuredFrontendUrls = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);
const allowedOrigins = new Set([
    ...configuredFrontendUrls,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

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
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
