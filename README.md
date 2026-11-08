# Time Capsule

Write letters to your future self. They stay locked until the unlock date, then an AI analyses the mood and themes and emails the letter to you.

## Tech Stack
- Frontend: React (Vite), React Router
- Backend: Node.js, Express
- Databases: PostgreSQL (users, capsules, tags), MongoDB (letters, AI analysis)
- AI: LLM API with structured JSON output
- Other: JWT auth, node-cron, email API

## Project Structure
- `client/`: React app
- `server/`: Express API
- `docs/`: PRD, HLD, LLD

## Setup
1. Clone the repo
2. `cd server && npm install`, copy `.env.example` to `.env`, fill in values, then `npm run dev`
3. `cd client && npm install && npm run dev`

## Docs
- [PRD](docs/PRD.md)
- [HLD](docs/HLD.md)
- [LLD](docs/LLD.md)