# 🤖 Responsible AI in NeuraTrack

**Project:** NeuraTrack AI Backend  
**Hackathon:** Microsoft JavaScript AI Build-a-thon 2026  
**Last Updated:** March 20, 2026

---

## 📋 Overview

NeuraTrack uses AI to help epilepsy patients log seizures and gain insights. This document outlines our commitment to building AI that is **transparent, fair, reliable, private, inclusive, and accountable**.

We follow Microsoft's Responsible AI principles:

- Fairness
- Reliability & Safety
- Privacy & Security
- Inclusiveness
- Transparency
- Accountability

---

## 🔍 Transparency

### Clear AI Disclosure

- Users are always told when interacting with AI features
- The AI chat assistant introduces itself as "NeuraTrack AI"
- Confidence scores are displayed for parsed notes

### Explainability

- **Risk Predictor**: Shows factors that influenced predictions (e.g., "Friday is a higher risk day")
- **Medication Insights**: Explains why a reminder time is suggested
- **Chat Assistant**: Citations show what data was used to answer

### Confidence Indicators

```json
{
  "parsed": {
    "seizureType": "Generalized Onset Motor",
    "confidence": 0.92 // User sees 92% confidence
  }
}
```

### Data Sources

- All insights are based on **user's own data** only
- No data from other users influences predictions
- Users can see exactly what data was used via `usedData` field

---

## ⚖️ Fairness

### Diverse Testing

- Tested with synthetic data representing:
  - Different ages (child, adult, elderly)
  - Various seizure types
  - Multiple languages (English primary, expansion planned)

### Bias Mitigation

- Gemini base model trained on diverse datasets
- No demographic information used in predictions
- Confidence scores consistent across user types

### Equal Access

- All features available to all users equally
- No premium tiers that limit AI functionality
- Free Gemini API ensures no cost barrier

---

## 🔒 Reliability & Safety

### Error Handling

```javascript
try {
  const result = await gemini.generateJsonResponse(prompt);
} catch (error) {
  // Graceful fallback - return editable empty form
  return { success: false, fallback: { seizureType: "Unknown" } };
}
```

### Confidence Thresholds

- **High confidence (>0.8)**: Auto-fill form
- **Medium confidence (0.5-0.8)**: Auto-fill with warning
- **Low confidence (<0.5)**: Suggest manual entry

### Medical Disclaimer

- Every AI response includes: _"Please consult your doctor for medical advice"_
- Emergency detection: If user mentions active seizure/injury → emergency services prompt

### Fallback Mechanisms

- All AI features allow manual override
- If AI fails, users can still log manually
- Chat assistant warns when data is insufficient

---

## 🔐 Privacy & Security

### Data Handling

| Data Type        | Storage                 | Sharing               | Training |
| ---------------- | ----------------------- | --------------------- | -------- |
| Seizure logs     | Encrypted PostgreSQL    | Never                 | Never    |
| Medication data  | Encrypted PostgreSQL    | Never                 | Never    |
| AI conversations | User's database only    | Never                 | Never    |
| Gemini API calls | Google (standard terms) | No training data used | Disabled |

### Google Gemini Privacy

- Using **free tier with data protection**
- Google does not use your prompts to train their models
- Data processed but not retained for model improvement

### User Control

- Users can delete their data at any time (planned)
- Export functionality (planned)
- Clear data usage disclosure in app

### Local Processing Options

- Risk predictions run in-browser with Brain.js (planned)
- Reduces need to send sensitive data to cloud

---

## 🌍 Inclusiveness

### Accessibility Features

- **Screen reader support**: All AI responses are text-based
- **Color-blind friendly**: Risk levels use both color AND text labels
- **Keyboard navigation**: All features accessible without mouse

### Language Support

- Currently English (Gemini supports 100+ languages)
- Future: Language detection + responses in user's language

### User Experience

- Simple language, no medical jargon
- Explanations for every AI suggestion
- Option to get more details on any insight

---

## 📊 Accountability

### Feedback Mechanisms

- Every AI feature has feedback buttons:
  - "Was this helpful?" for insights
  - "Correct" for parsed notes
  - "Edit" to override AI

### Audit Trail

- All AI interactions stored in `AIConversation` table
- Includes:
  - User query
  - AI response
  - Context data used
  - Timestamp

### Version Tracking

- Each AI response includes model version
- Gemini model version tracked: `modelVersion: "gemini-2.5-flash"`

---

## 🛡️ Safety Features

### Emergency Detection

```javascript
if (message.includes("seizure now") || message.includes("injured")) {
  return {
    response:
      "⚠️ If you are having a medical emergency, please call emergency services immediately.",
    emergency: true,
  };
}
```

### No Medical Advice

- AI explicitly states it is not a doctor
- Always encourages professional medical consultation
- Does not diagnose conditions

### Content Filtering

- Gemini's built-in safety filters active
- No harmful or dangerous advice generated

---

## 🧪 Testing & Validation

### Pre-release Testing

- 50+ test notes across different seizure types
- 100+ chat queries tested
- Edge cases: empty notes, malformed input, no data

### Continuous Monitoring

- Error rates tracked via console logs
- Confidence score distribution monitored
- User feedback collection planned

---

## 📈 Future Improvements

| Area                 | Planned Enhancement                          |
| -------------------- | -------------------------------------------- |
| **Bias**             | Expand test data to more diverse populations |
| **Privacy**          | Add full data export and deletion endpoints  |
| **Transparency**     | Model cards for each AI feature              |
| **Local Processing** | Move risk predictions fully to client-side   |
| **Accessibility**    | Add voice input for seizure logging          |

---

## 📚 References

- [Microsoft Responsible AI Principles](https://www.microsoft.com/en-us/ai/responsible-ai)
- [Google AI Principles](https://ai.google/principles/)
- [Gemini Safety & Responsibility](https://deepmind.google/technologies/gemini/safety/)

---

## 📝 Conclusion

NeuraTrack is built with responsible AI at its core. We prioritize:

- **User understanding** through transparency
- **Fair treatment** for all users
- **Reliable performance** with fallbacks
- **Privacy protection** for sensitive health data
- **Inclusive design** for diverse users
- **Clear accountability** through audit trails

**Responsible AI isn't an afterthought—it's built into every feature.**

---

_Last updated: March 20, 2026_  
_For questions about AI practices, contact: [natashahinga58@gmail.com]_
