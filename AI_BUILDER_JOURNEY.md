# 🤖 AI Builder Journey: NeuraTrack

**Author:** [Your Name]  
**Hackathon:** Microsoft JavaScript AI Build-a-thon 2026  
**AI Tools Used:** GitHub Copilot, Gemini 2.5 Flash

---

## 📋 Overview

This document shares how I used AI tools to build NeuraTrack—an AI-powered epilepsy tracking API. I'm sharing my prompts, workflows, and lessons learned to help others build better AI applications.

---

## 🛠 AI Tools I Used

| Tool                    | Purpose          | How I Used It                                              |
| ----------------------- | ---------------- | ---------------------------------------------------------- |
| **GitHub Copilot**      | Code generation  | Generated Express routes, Prisma schemas, React components |
| **GitHub Copilot Chat** | Debugging        | Helped fix Windows permission errors, JSON parsing issues  |
| **Gemini 2.5 Flash**    | Core AI features | Seizure parsing, risk prediction, chat assistant           |
| **Google AI Studio**    | Prompt testing   | Iterated on medical extraction prompts                     |

---

## 📝 My Best Prompts

### Prompt 1: Seizure Note Parser (Iteration 1 → Final)

**Initial Prompt (Didn't work well):**

```
Extract seizure data from this note: "${noteText}"
```

**Problem:** AI returned inconsistent JSON structure, sometimes added extra text.

**Refined Prompt (Worked great):**

```
You are a medical AI assistant specializing in epilepsy.
Extract structured seizure data from this patient note.

CURRENT DATE: ${new Date().toISOString().split("T")[0]}

PATIENT NOTE: "${noteText}"

Return ONLY valid JSON with these exact fields:
{
  "seizureType": "string (one of: Focal Onset Aware, Focal Onset Impaired Awareness, Generalized Onset Motor, Generalized Onset Non-Motor, Unknown)",
  "durationSeconds": number or null,
  "triggers": ["array of strings from: stress, missed medication, lack of sleep, flickering lights, alcohol, fever, exercise, other"],
  "symptoms": ["array of strings describing what happened"],
  "postIctalSymptoms": ["array of strings like confusion, headache, fatigue, sleepiness, nausea"],
  "timestamp": "ISO string (calculate if they mention time like 'yesterday 3pm') or null",
  "confidence": number between 0-1
}

ONLY return JSON. No other text.
```

**Why it improved:**

- Added role definition ("medical AI assistant")
- Provided explicit field options (reduces hallucinations)
- Added `confidence` field for transparency
- Used `responseMimeType: "application/json"` in API call

---

### Prompt 2: Risk Predictor Explanation

```
You are NeuraTrack AI. Based on this user's data:
- Seizures: ${JSON.stringify(seizures)}
- Common triggers: ${triggers}

User asks: "Why am I at higher risk tomorrow?"

Explain in 2-3 sentences, referencing their specific patterns.
```

**Lesson:** Providing structured data + specific instructions yields personalized, relevant responses.

---

## 💻 How I Used GitHub Copilot

### Code Generation

I typed comments, Copilot generated the code:

```javascript
// Create a Prisma model for AIConversation with userId, query, response, context, createdAt
```

→ Copilot generated the full model with relations.

### Debugging Windows Issues

When I got `EPERM` errors on Windows, I asked Copilot Chat:

```
I'm getting EPERM error when running npm uninstall openai on Windows. How to fix?
```

→ Copilot suggested running PowerShell as Admin and clearing npm cache.

### Test Generation

I used Copilot to create test scripts:

```javascript
// Write a test script to verify the Gemini API connection
```

→ Copilot generated a complete test script with error handling.

---

## 🧪 Prompt Engineering Iterations

### Challenge: Inconsistent JSON Responses

| Iteration | Approach                                    | Result                             |
| --------- | ------------------------------------------- | ---------------------------------- |
| 1         | Simple prompt                               | JSON sometimes wrapped in markdown |
| 2         | Added "Return ONLY JSON"                    | Still had markdown occasionally    |
| 3         | Used `responseMimeType: "application/json"` | Clean JSON always                  |
| 4         | Added few-shot examples                     | Even more consistent structure     |

### Challenge: Time Parsing

**Problem:** AI couldn't consistently parse "this morning" to an ISO timestamp.

**Solution:** Added current date context:

```
CURRENT DATE: ${new Date().toISOString().split("T")[0]}
```

Now AI calculates relative times correctly.

---

## 🚀 What Worked Well

| Strategy                           | Why It Worked                                       |
| ---------------------------------- | --------------------------------------------------- |
| **JSON mode with Gemini**          | Guaranteed clean, parseable output                  |
| **Medical role prompt**            | Reduced hallucinations, improved accuracy           |
| **Confidence scores**              | Users trust AI more when they see confidence levels |
| **RAG for chat**                   | Using user's actual data made responses relevant    |
| **GitHub Copilot for boilerplate** | Saved 10+ hours on routes, controllers, schemas     |

---

## 💡 What Didn't Work

| Attempt                       | Why It Failed                    | Lesson Learned                         |
| ----------------------------- | -------------------------------- | -------------------------------------- |
| Using OpenAI for parsing      | Required billing, more expensive | Gemini free tier is sufficient         |
| Complex ML model for risk     | Too complex for timeline         | Statistical patterns work well for MVP |
| Testing with Hoppscotch first | Blocked by API key restrictions  | Test with curl first, then Hoppscotch  |

---

## 📊 Time Savings with AI

| Task                 | Without AI    | With AI        | Saved                |
| -------------------- | ------------- | -------------- | -------------------- |
| Express route setup  | 2 hours       | 20 minutes     | 1h 40m               |
| Prisma schema design | 1.5 hours     | 15 minutes     | 1h 15m               |
| Gemini integration   | 2 hours       | 30 minutes     | 1h 30m               |
| Error handling       | 1 hour        | 10 minutes     | 50m                  |
| Documentation        | 2 hours       | 30 minutes     | 1h 30m               |
| **Total**            | **8.5 hours** | **1.75 hours** | **6.75 hours saved** |

---

## 🎯 Lessons for Future AI Builders

1. **Start with curl, then move to Hoppscotch** – Avoids referrer blocking issues
2. **Use JSON mode** – Saves hours of parsing markdown responses
3. **Add confidence scores** – Makes AI more trustworthy
4. **Iterate on prompts** – First prompt rarely works perfectly
5. **Document your prompts** – Helps debugging and sharing

---

## 📝 My Best Prompt Templates

### Seizure Note Parser

```
You are a medical AI assistant specializing in epilepsy.
Extract structured data from: "${noteText}"
Return JSON with: [fields]
Confidence score: [0-1]
```

### Chat Assistant

```
You are NeuraTrack AI. Answer based on user's data:
[user data here]

Question: "${message}"
Be concise (2-4 sentences), add medical disclaimer.
```

---

## 🔗 Resources I Used

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [GitHub Copilot Guide](https://github.com/features/copilot)
- [Prisma ORM Docs](https://www.prisma.io/docs)
- [Microsoft Responsible AI](https://www.microsoft.com/en-us/ai/responsible-ai)

---

## ✅ Final Thoughts

Using AI to build AI was a game-changer for this hackathon. GitHub Copilot accelerated development by 6+ hours, and Gemini made complex NLP tasks trivial.

**Key takeaway:** The best AI builders don't just use AI—they document how they use it. Share your prompts, your failures, and your wins. The community learns together.

---

_Built with ❤️ for the JavaScript AI Build-a-thon 2026_
