# 🧠 NeuraTrack AI Backend

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-orange.svg)](https://deepmind.google/technologies/gemini/)

> **AI-Powered Epilepsy Tracking API** | Convert natural language notes to structured data, predict seizure risks, and provide personalized medication insights.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [AI Features](#ai-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Hackathon Submission](#hackathon-submission)

---

## 🎯 Overview

NeuraTrack is a comprehensive healthcare API designed for epilepsy patients and caregivers. It leverages **Google's Gemini AI** to transform how seizure data is captured, analyzed, and understood.

**The Problem:** Patients often struggle to log detailed seizure information during post-ictal states, leading to incomplete records.

**The Solution:** Natural language logging + AI-powered structured data extraction + intelligent insights.

---

## ✨ Features

### Core Features

- **🔐 JWT Authentication** – Secure user management
- **📊 Seizure Tracking** – Log and retrieve seizure events
- **💊 Medication Management** – Track prescriptions and adherence
- **🚨 Emergency Alerts** – Log emergency events (ethical design)

### AI-Powered Features (Powered by Gemini 2.5 Flash)

- **📝 Seizure Note Parser** – Convert natural language to structured data with confidence scores
- **📈 Training Data API** – Formatted seizure data for ML visualization
- **⚠️ Risk Predictor** – 7-day seizure risk forecasts based on historical patterns
- **💡 Medication Insights** – AI-powered adherence analysis and personalized tips
- **⏰ Smart Reminders** – Optimal medication timing based on seizure patterns
- **💬 AI Chat Assistant** – Natural language Q&A about personal health data
- **📜 Conversation History** – Persistent chat context across sessions

---

## 🛠 Tech Stack

| Category           | Technology                          |
| ------------------ | ----------------------------------- |
| **Runtime**        | Node.js 22.x                        |
| **Framework**      | Express 5.x                         |
| **Database**       | PostgreSQL 16.x                     |
| **ORM**            | Prisma 5.x                          |
| **Authentication** | JWT + bcrypt                        |
| **AI Model**       | Google Gemini 2.5 Flash (free tier) |
| **Deployment**     | Render.com                          |

---

## 📚 API Documentation

### Base URL

```
https://neuratrack-backend.onrender.com
```

### Authentication

All protected endpoints require a JWT token:

```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints Overview

| Method | Endpoint                      | Description             | Auth |
| ------ | ----------------------------- | ----------------------- | ---- |
| `POST` | `/api/auth/register`          | Register new user       | ❌   |
| `POST` | `/api/auth/login`             | Login and get token     | ❌   |
| `GET`  | `/api/protected`              | Test auth               | ✅   |
| `POST` | `/api/seizures`               | Log a seizure           | ✅   |
| `GET`  | `/api/seizures`               | Get all seizures        | ✅   |
| `GET`  | `/api/seizures/summary`       | Get seizure summary     | ✅   |
| `POST` | `/api/medications`            | Add medication          | ✅   |
| `GET`  | `/api/medications`            | Get medications         | ✅   |
| `POST` | `/api/emergency/alert`        | Trigger emergency event | ✅   |
| `POST` | `/api/ai/parse-seizure-note`  | AI note parser          | ✅   |
| `GET`  | `/api/ai/training-data`       | ML training data        | ✅   |
| `GET`  | `/api/ai/predict-risk`        | 7-day risk prediction   | ✅   |
| `GET`  | `/api/ai/medication-insights` | AI medication analysis  | ✅   |
| `GET`  | `/api/ai/smart-reminder`      | Optimal reminder times  | ✅   |
| `POST` | `/api/ai/chat`                | AI chat assistant       | ✅   |
| `GET`  | `/api/ai/conversations`       | Chat history            | ✅   |

### 📖 Detailed Examples

#### AI Note Parser

```bash
curl -X POST https://neuratrack-backend.onrender.com/api/ai/parse-seizure-note \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "noteText": "Had a seizure this morning around 10am, lasted about 2 minutes, felt confused afterwards. I missed my medication yesterday."
  }'
```

#### Risk Prediction

```bash
curl -X GET "https://neuratrack-backend.onrender.com/api/ai/predict-risk?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### AI Chat

```bash
curl -X POST https://neuratrack-backend.onrender.com/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What triggers my seizures?"}'
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or higher
- PostgreSQL 16.x
- Google Gemini API key (free)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/slate299/neuratrack-backend.git
cd neuratrack-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your values
```

4. **Set up database**

```bash
# Create PostgreSQL database
createdb neuratrack_dev

# Run migrations
npx prisma migrate dev --name init
```

5. **Start the server**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/neuratrack_dev

# Authentication
JWT_SECRET=your_super_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# AI - Gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Getting a Gemini API Key (Free)

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new project or use existing
5. Copy your key (no credit card required)

---

## 🗄 Database Schema

```prisma
model User {
  id                   Int      @id @default(autoincrement())
  email                String   @unique
  password             String
  name                 String?
  createdAt            DateTime @default(now())
  seizures             Seizure[]
  medications          Medication[]
  aiConversations      AIConversation[]
  medicationAdherence  MedicationAdherence[]
}

model Seizure {
  id                Int      @id @default(autoincrement())
  occurredAt        DateTime
  duration          Int?
  notes             String?
  createdAt         DateTime @default(now())

  // AI Fields
  originalNote      String?
  aiConfidence      Float?
  triggers          Json?
  symptoms          Json?
  postIctalSymptoms Json?

  user   User @relation(fields: [userId], references: [id])
  userId Int
}

model AIConversation {
  id        Int      @id @default(autoincrement())
  userId    Int
  query     String
  response  String
  context   Json?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model MedicationAdherence {
  id           Int      @id @default(autoincrement())
  userId       Int
  medicationId Int
  takenAt      DateTime
  scheduledFor DateTime
  status       String   // 'taken', 'missed', 'late'

  user       User       @relation(fields: [userId], references: [id])
  medication Medication @relation(fields: [medicationId], references: [id])
}
```

---

## 🤖 AI Features Deep Dive

### 1. Seizure Note Parser

- Uses Gemini 2.5 Flash with JSON mode
- Extracts: seizure type, duration, triggers, symptoms, timestamp
- Returns confidence score (0-1)
- Stores original note for future training

### 2. Risk Predictor

- Analyzes last 90 days of seizure data
- Calculates hourly and daily risk patterns
- Factors in recent trends
- Provides actionable recommendations

### 3. Medication Assistant

- Tracks adherence with status (taken/missed/late)
- Identifies patterns in missed doses
- Suggests optimal reminder times
- Generates personalized insights

### 4. Chat Assistant

- RAG (Retrieval-Augmented Generation) architecture
- Context includes: recent seizures, medications, adherence
- Stores conversations for continuity
- Includes medical disclaimers

---

## 🧪 Testing

### Using Hoppscotch (Recommended)

1. Open [Hoppscotch](https://hoppscotch.io)
2. Set method and URL
3. Add headers (Authorization, Content-Type)
4. Add body for POST requests
5. Send and inspect responses

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test AI parser
curl -X POST http://localhost:5000/api/ai/parse-seizure-note \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"noteText":"Had a seizure at 10am lasting 2 minutes"}'
```

---

## 🚢 Deployment

### Deploy to Render

1. Push code to GitHub
2. Connect repository to Render
3. Add environment variables
4. Render auto-deploys on push

### Environment Variables on Render

```env
DATABASE_URL=your_production_postgres_url
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
NODE_ENV=production
PORT=5000
```

---

## 🏆 JavaScript AI Build-a-thon 2026 Submission

This project was built for the **Microsoft JavaScript AI Build-a-thon Hack** (March 13-31, 2026).

### Judging Criteria Alignment

| Criteria                     | How We Addressed                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| **Depth of AI Integration**  | 4 distinct AI features: note parsing, risk prediction, medication insights, chat assistant |
| **Technical Implementation** | Full-stack Node.js + React architecture with Prisma ORM and PostgreSQL                     |
| **Responsible AI Patterns**  | Confidence scores, medical disclaimers, user override options, privacy-first design        |
| **Solution Value**           | Solves real problem for 50M+ epilepsy patients worldwide                                   |
| **Innovation & Creativity**  | Natural language seizure logging, AI-powered predictions, RAG chat assistant               |

### AI Builder Journey

- **Gemini 2.5 Flash** (free tier) used for all AI features
- **Prompt engineering**: Medical-specific prompts with JSON output
- **Local-first**: Option to run ML models in browser (future)

---

## 📁 Project Structure

```
neuratrack-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js
│   │   ├── seizure.controller.js
│   │   ├── medication.controller.js
│   │   ├── emergency.controller.js
│   │   └── ai.controller.js
│   ├── routes/                # API routes
│   │   ├── auth.routes.js
│   │   ├── seizure.routes.js
│   │   ├── medication.routes.js
│   │   ├── emergency.routes.js
│   │   └── ai.routes.js
│   ├── middleware/            # Auth & validation
│   │   └── auth.middleware.js
│   ├── services/              # Business logic
│   │   └── ai.service.js
│   ├── app.js                 # Express app
│   └── server.js              # Entry point
├── gemini.js                  # Gemini AI service
├── .env                       # Environment variables
├── package.json
└── README.md
```

---

## 🤝 Contributing

This project is part of a hackathon submission. For questions or collaboration:

- **GitHub Issues**: Open an issue
- **Email**: [your-email@example.com]

---

## 📄 License

ISC License

---

## 🙏 Acknowledgments

- **Google Gemini AI** for free-tier access
- **Microsoft JavaScript AI Build-a-thon** for the opportunity
- **Epilepsy Foundation** for inspiring real-world impact

---

## 📬 Contact

**Developer:** slate299  
**GitHub:** [@slate299](https://github.com/slate299)  
**Project Link:** [neuratrack-backend](https://github.com/slate299/neuratrack-backend)

---

_Built with ❤️ for epilepsy patients everywhere_
