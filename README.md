# AI-Powered Interview Preparation & Answer Evaluation System

An interactive interview-practice application for candidates preparing for technology and business roles. Configure a mock interview, answer role-focused questions, and review transparent, estimated feedback across several scoring dimensions.

> **Project status:** This is a portfolio/demo application. Evaluation uses local heuristics and concept-keyword matching; it does not call an external AI service or provide professional hiring advice.

## Project Overview

The system simulates a structured interview practice session. It supports seven initial job roles, four interview formats, three difficulty levels, and sessions of 5, 10, or 15 questions. After each submitted answer, it displays estimated scores, concepts found or missed, strengths, areas to improve, and an example answer.

Completed sessions can be reviewed in a performance report and interview history. Session history is stored in the browser on the current device.

## Problem Statement

Interview preparation can be difficult to structure: candidates may not know which questions to practice, how to assess the completeness of an answer, or which concepts to revisit. This project provides a repeatable practice workflow and immediate, clearly labeled feedback for self-study.

## Solution

Candidates choose a role and session settings, respond to a sequence of questions, then review an estimated evaluation after each answer. A final report summarizes the session and highlights concepts to practice. The application works without an API key by using its included question data and local evaluation logic.

## Key Features

- **Job role selection:** Data Analyst, Data Scientist, Machine Learning Engineer, AI Engineer, Software Developer, Web Developer, and Business Analyst.
- **Interview formats:** Technical, HR, Behavioral, and Mixed.
- **Difficulty selection:** Easy, Medium, or Hard.
- **Multiple questions:** Choose a 5-, 10-, or 15-question session.
- **Text answers:** Enter and submit an answer for each question.
- **Optional speech-to-text:** Use browser speech recognition where supported and permitted.
- **Estimated answer evaluation:** Local heuristic scoring based on answer length and matching question concepts.
- **Score dimensions:** Technical, relevance, completeness, clarity, concept coverage, and overall score.
- **Detailed feedback:** Review matched and missing concepts, strengths, improvement suggestions, and an example answer.
- **Performance report:** Review session scores and summary metrics.
- **Recommended learning areas:** Revisit concepts missed in answers.
- **Interview history:** Review current-device completed sessions alongside sample demo entries.

## How the System Works

```text
Role Selection
      → Interview Configuration
      → Question Generation / Selection
      → User Answer
      → Speech-to-Text (optional)
      → Answer Analysis
      → Scoring
      → Feedback
      → Final Performance Report
```

Questions are selected from role-specific question data and topic-based templates. Speech-to-text is an optional browser feature; typing remains available. Answers are evaluated locally, and the resulting feedback is displayed immediately.

## AI/NLP Approach

The current version does **not** use a large language model, an external AI API, embeddings, or a trained machine-learning model. Its answer analysis is a lightweight, NLP-inspired concept-matching heuristic: it checks whether configured keywords for a question's concepts appear in the answer, then combines concept coverage and answer length into estimated score dimensions. Feedback is generated from the matched and missing concepts and predefined guidance.

This approach makes the demo self-contained and easy to run, but it does not understand meaning, context, correctness, or paraphrases as a language model would. Scores are illustrative practice signals, not objective measurements.

## Technology Stack

- **TypeScript** and **React 19** — application UI and typed interview data.
- **TanStack Start** and **TanStack Router** — application framework and routing.
- **Tailwind CSS v4** — styling.
- **Lucide React** — interface icons.
- **Browser Web Speech API** — optional speech recognition when available.
- **Browser `localStorage`** — stores completed session history on the current device.

## Project Architecture

```text
src/
├── components/ui/       # Shared interface primitives
├── lib/
│   └── interview-data.ts # Roles, topics, question creation and local scoring
├── routes/
│   ├── __root.tsx       # Shared application shell
│   └── index.tsx        # Dashboard, interview, reports and history views
└── styles.css           # Global theme and styling
```

The role and topic data is kept separate from the page UI to make it straightforward to add more roles and question content.

## Installation and Local Setup

### Requirements

- Node.js with npm
- A modern browser; speech recognition availability depends on the browser and its permissions

### Install dependencies

```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

## How to Run the Project

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal. No AI API key or account is required for the current demo experience.

## Example Interview Flow

1. Select **Data Analyst** as the target role.
2. Choose **Technical**, **Medium**, and **5 questions**.
3. Start the interview and read the role-focused prompt.
4. Type an answer, or use speech input if the browser supports it and microphone access is allowed.
5. Submit the answer to see estimated scores, matched concepts, and suggestions.
6. Continue through the questions and finish the session.
7. Review the performance report and find the completed session in history.

## Screenshots

Screenshots can be added here as the project evolves:

| Dashboard | Interview and feedback | Performance report |
| --- | --- | --- |
| `![Dashboard](screenshots/dashboard.png)` | `![Interview](screenshots/interview.png)` | `![Report](screenshots/report.png)` |

## Limitations

- Scores and feedback are local, heuristic estimates based on keyword/concept matches and answer length.
- The evaluator does not verify factual accuracy or understand semantic equivalence, nuance, or context.
- Questions and example answers come from the included local data and templates; no live question-generation service is connected.
- Speech recognition depends on browser support, device permissions, and browser behavior.
- History is stored in the browser's local storage and is not synchronized across devices or accounts.
- Results are for practice only and must not be treated as a hiring decision or a reliable measure of candidate ability.

## Future Enhancements

- LLM-powered evaluation with transparent criteria and safeguards.
- More job roles and a larger curated question bank.
- Advanced speech analysis, beyond speech-to-text transcription.
- Adaptive interview difficulty based on practice results.
- Resume-based interview questions.
- Personalized learning recommendations.
- Cloud database for synchronized session history.
- Authentication improvements.

## Project Author

**Mohammed Aman Pasha**  
B.E. Artificial Intelligence & Machine Learning  
PES Institute of Technology and Management, Shivamogga