# NeuraTrack Backend API

The backend API for NeuraTrack - an AI-powered epilepsy management application. Built with Node.js, Express, PostgreSQL, and Prisma.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [AI Integration](#ai-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## 🧠 Overview

NeuraTrack Backend provides RESTful APIs for:

- User authentication and authorization (JWT)
- Seizure logging and tracking
- Medication management and adherence
- AI-powered seizure note parsing
- Risk prediction and insights
- Emergency SOS alerts with Twilio
- Shareable report links
- AI chat assistant

## 🛠️ Tech Stack

| Technology         | Purpose                             |
| ------------------ | ----------------------------------- |
| Node.js            | Runtime environment                 |
| Express            | Web framework                       |
| PostgreSQL         | Primary database                    |
| Prisma             | ORM and database client             |
| JWT                | Authentication                      |
| Google Gemini AI   | AI features (seizure parsing, chat) |
| Twilio             | SMS/WhatsApp emergency alerts       |
| Helmet             | Security headers                    |
| Express Rate Limit | API rate limiting                   |
| Sentry             | Error tracking                      |

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Google Gemini API key
- Twilio account (for SMS/WhatsApp alerts)
- Sentry account (optional, for error tracking)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/neuratrack-backend.git
cd neuratrack-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory (see [Environment Variables](#environment-variables))

4. Set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Start the development server:

```bash
npm run dev
```

## 🌍 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/neuratrack"

# Authentication
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development

# AI - Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=your_messaging_sid
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn
```

## 🗄️ Database Setup

### Run Migrations

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (visual database browser)
npx prisma studio
```

### Database Schema

The database includes the following models:

- **User** - User accounts and authentication
- **Seizure** - Seizure records with AI confidence
- **Medication** - User medications with schedules
- **MedicationAdherence** - Daily adherence tracking
- **EmergencyContact** - SOS contacts
- **EmergencyEvent** - SOS event history
- **AIConversation** - Chat history
- **ShareableLink** - Expiring report links

## 🚀 Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run at `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Create new user account |
| POST   | `/api/auth/login`    | Login and get JWT token |
| POST   | `/api/auth/refresh`  | Refresh expired token   |

### Seizures

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| GET    | `/api/seizures`         | Get all user seizures     |
| GET    | `/api/seizures/summary` | Get seizure statistics    |
| POST   | `/api/seizures`         | Create new seizure record |
| PUT    | `/api/seizures/:id`     | Update seizure            |
| DELETE | `/api/seizures/:id`     | Delete seizure            |

### Medications

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/medications`                | Get all user medications |
| POST   | `/api/medications`                | Add new medication       |
| PUT    | `/api/medications/:id`            | Update medication        |
| DELETE | `/api/medications/:id`            | Delete medication        |
| GET    | `/api/medications/adherence`      | Get adherence records    |
| POST   | `/api/medications/adherence/mark` | Mark dose as taken       |

### AI Features

| Method | Endpoint                      | Description                                |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/api/ai/parse-seizure-note`  | Parse natural language seizure description |
| GET    | `/api/ai/predict-risk`        | Get seizure risk prediction                |
| GET    | `/api/ai/medication-insights` | AI insights on medications                 |
| GET    | `/api/ai/smart-reminder`      | Smart reminder suggestions                 |
| POST   | `/api/ai/chat`                | Chat with AI assistant                     |
| GET    | `/api/ai/conversations`       | Get chat history                           |

### Emergency

| Method | Endpoint                              | Description            |
| ------ | ------------------------------------- | ---------------------- |
| GET    | `/api/emergency/contacts`             | Get emergency contacts |
| POST   | `/api/emergency/contacts`             | Add emergency contact  |
| PATCH  | `/api/emergency/contacts/:id/primary` | Set primary contact    |
| POST   | `/api/emergency/alert`                | Trigger SOS alert      |

### Reports

| Method | Endpoint                     | Description                    |
| ------ | ---------------------------- | ------------------------------ |
| POST   | `/api/reports/share`         | Generate shareable report link |
| GET    | `/api/reports/links`         | Get user's shareable links     |
| DELETE | `/api/reports/links/:id`     | Revoke shareable link          |
| GET    | `/api/reports/shared/:token` | Public report view             |
| POST   | `/api/reports/email`         | Send report via email          |

## 🔒 Security Features

| Feature                   | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| **JWT Authentication**    | Stateless authentication with token expiry                 |
| **Rate Limiting**         | 100 requests per 15 minutes (API), 5 per 15 minutes (auth) |
| **Helmet.js**             | Secure HTTP headers                                        |
| **CORS**                  | Restrict allowed origins                                   |
| **Input Validation**      | Request body validation                                    |
| **Request Size Limit**    | 10MB maximum payload                                       |
| **Sentry Error Tracking** | Production error monitoring                                |

## 🤖 AI Integration

### Seizure Note Parsing

The AI can extract structured data from natural language notes like:

> "Had a seizure at 3pm today. It lasted about 2 minutes. I was very tired afterward. I think lack of sleep triggered it."

### Risk Prediction

Predicts seizure risk for the next 7 days based on:

- Historical patterns by hour and day
- Recent seizure frequency trends
- Common triggers

### Smart Reminders

Suggests optimal medication timing based on:

- Current adherence patterns
- Seizure timing patterns
- Historical success rates

## 🧪 Testing

### Test Rate Limiting

```javascript
for (let i = 0; i < 110; i++) {
  fetch("http://localhost:5000/api/test-rate-limit").then((res) =>
    console.log(i, res.status),
  );
}
// After 100 requests, returns 429
```

### Test API with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get seizures (with auth token)
curl http://localhost:5000/api/seizures \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚢 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set environment variables
5. Use the following settings:
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
   - **Node Version:** 18

### Deploy to Railway

1. Install Railway CLI
2. Run `railway login`
3. Run `railway init`
4. Run `railway up`

### Production Database

Use managed PostgreSQL services:

- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Railway PostgreSQL](https://railway.app)

## 📄 License

MIT License

---

**Built with ❤️ by Natasha Hinga** | [GitHub](https://github.com/slate299)
