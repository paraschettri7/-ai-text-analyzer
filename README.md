# AI Text Analyzer

A full-stack text analysis application with a React interface and an Express API. Submit a passage to receive its overall sentiment, a short summary, and a list of important keywords generated with Google Gemini.

## Features

- Analyze text for positive, negative, or neutral sentiment.
- Generate a short summary and extract important keywords.
- Display analysis results in a responsive React interface.
- Show a loading state while analysis is running and readable error messages when a request fails.
- Reject blank input in the frontend and validate that text was provided in the API.
- Keep the Gemini API key on the backend in an environment variable.

## Technology stack

- **Frontend:** React, Vite, and plain CSS
- **Backend:** Node.js and Express
- **AI:** Google Gemini through `@google/genai` (model: `gemini-3.1-flash-lite`)
- **Configuration:** `dotenv`

## Architecture and request flow

1. The user enters text in the React frontend and selects **Analyze text**.
2. The frontend sends a JSON `POST` request to `/analyze` using `fetch()`.
3. During local development, Vite proxies `/analyze` to the Express server at `http://localhost:3000`.
4. Express reads `GEMINI_API_KEY` from the backend environment and asks Gemini to return JSON containing sentiment, summary, and keywords.
5. Express returns that JSON to the frontend, which displays the result.

The API key is configured only for the backend. It should not be added to frontend code or frontend environment variables.

## Project structure

```text
text_analyser/
|-- .env.example            # Environment variable template
|-- .gitignore
|-- package.json            # Backend dependencies
|-- server.js               # Express API and Gemini integration
|-- test-ai.js              # Existing AI experiment script
`-- frontend/
    |-- index.html
    |-- package.json        # React and Vite dependencies/scripts
    |-- vite.config.js      # Development server and API proxy
    `-- src/
        |-- App.jsx         # Analyzer interface and API interaction
        |-- main.jsx        # React entry point
        `-- styles.css      # Responsive application styles
```

## Prerequisites

- Node.js and npm
- A Google Gemini API key

## Installation

From the project root, install the backend dependencies:

```bash
npm install
```

Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Environment configuration

Create a local `.env` file by copying `.env.example` in the project root:

```bash
cp .env.example .env
```

On Windows Command Prompt, use:

```bat
copy .env.example .env
```

Open `.env` and replace the placeholder with your own Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Keep `.env` private. It is excluded from Git by `.gitignore`. Do not put the key in the frontend.

## Run the application

Start the backend from the project root:

```bash
node server.js
```

The API listens on `http://localhost:3000`.

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`). Keep both servers running while using the application. The Vite development server forwards `/analyze` requests to the backend on port 3000.

## API

### `GET /`

Health-style response indicating the Express server is running.

```text
AI Text Analyzer is running!
```

### `POST /analyze`

Analyzes the submitted text and returns a JSON object.

**Request URL:** `http://localhost:3000/analyze`  
**Content-Type:** `application/json`

Request body:

```json
{
  "text": "The team delivered an excellent update ahead of schedule. Customers praised the new design and faster workflow."
}
```

Successful response (`200 OK`):

```json
{
  "sentiment": "Positive",
  "summary": "The team released a well-received design and workflow update ahead of schedule.",
  "keywords": ["team", "new design", "faster workflow", "customers"]
}
```

If text is missing or empty, the API responds with `400 Bad Request`:

```json
{
  "error": "Please provide text to analyze"
}
```

If analysis fails, the API responds with `500 Internal Server Error`:

```json
{
  "error": "Something went wrong while analyzing the text"
}
```

The sentiment and analysis content depend on the submitted text and Gemini's response.

## Future improvements

- Add automated backend and frontend tests.
- Add request size limits and more detailed input validation.
- Add persistent analysis history or export options.
- Add deployment configuration and production frontend-to-API hosting guidance.
- Improve API error reporting and operational logging.
