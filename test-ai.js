
require("dotenv").config();

async function main() {

    // Step 1: Import Gemini SDK
    const { GoogleGenAI } = await import("@google/genai");

    // Step 2: Create Gemini client
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    // Step 3: Text to analyze
    const text = `
        I really enjoy learning programming.
        However, debugging sometimes takes too much time.
    `;

    console.log("Sending text to Gemini...");

    // Step 4: Send request
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Analyze this text and return its sentiment,
        summary and keywords.

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

    console.log("Gemini response received!");

    // Step 5: Convert JSON string into JavaScript object
    const data = JSON.parse(response.text);

    console.log("\nSentiment:", data.sentiment);
    console.log("Summary:", data.summary);
    console.log("Keywords:", data.keywords);
}

// Step 6: Execute main function
main().catch(error => {
    console.error("Error:", error);
});
