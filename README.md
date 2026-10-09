# IdeaGen

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**AI-powered infographic and educational content generator.** Enter any topic and get a beautifully designed, downloadable infographic in seconds — powered by HuggingFace and Google Generative AI.

---

## Features

- **AI infographic generation** — describe a topic and receive a structured, visual infographic
- **One-click PNG export** — download your infographic as a high-quality image via html2canvas
- **Quiz mode** — test your knowledge with AI-generated quizzes on any topic
- **3D visuals** — immersive Three.js elements on the landing page
- **Smooth animations** — Framer Motion transitions throughout the app
- **Graceful fallback** — works with mock data when no API key is provided

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_HF_TOKEN` | HuggingFace API token for AI generation |
| `VITE_GOOGLE_API_KEY` | Google Generative AI API key (optional) |

The app runs without API keys and uses mock data — useful for local development.

---

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Framework   | React 19 + Vite                                   |
| Language    | TypeScript                                        |
| AI          | HuggingFace Inference, Google Generative AI       |
| 3D          | Three.js, React Three Fiber, Drei                 |
| Animation   | Framer Motion, Lenis (smooth scroll)              |
| Routing     | React Router v7                                   |
| Export      | html2canvas                                       |

---

## Project Structure

```
src/
├── pages/
│   ├── LandingPage.tsx    # Home page with 3D visuals
│   ├── AppPage.tsx        # Infographic generator
│   └── QuizPage.tsx       # AI-powered quiz
├── components/
│   └── Infographic.tsx    # Infographic renderer
└── services/
    └── ai.ts              # AI generation logic
```

---

## Usage

1. Open the app and navigate to **Generate**
2. Enter any educational or informational topic
3. Click **Generate** and wait for the AI to produce your infographic
4. Click **Download** to save it as a PNG

---

Built by [Suraj Bayas](https://github.com/SurajsinghBayas)