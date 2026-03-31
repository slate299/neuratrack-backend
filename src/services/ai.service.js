// src/services/ai.service.js
const gemini = require("../../gemini");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AIService {
  async parseSeizureNote(noteText) {
    const prompt = `
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
    `;

    return await gemini.generateJsonResponse(prompt);
  }

  async saveParsedSeizure(userId, noteText, parsedData) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    let occurredAt = new Date();
    if (parsedData.timestamp) {
      occurredAt = new Date(parsedData.timestamp);
    }

    return await prisma.seizure.create({
      data: {
        userId,
        occurredAt,
        duration: parsedData.durationSeconds,
        notes: noteText,
        originalNote: noteText,
        aiConfidence: parsedData.confidence,
        seizureType: parsedData.seizureType,
        triggers: parsedData.triggers || [],
        symptoms: parsedData.symptoms || [],
        postIctalSymptoms: parsedData.postIctalSymptoms || [],
      },
    });
  }

  async getTrainingData(userId, days = 90) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const seizures = await prisma.seizure.findMany({
      where: {
        userId,
        occurredAt: {
          gte: startDate,
        },
      },
      orderBy: {
        occurredAt: "asc",
      },
    });

    const trainingData = seizures.map((seizure) => {
      const date = new Date(seizure.occurredAt);
      return {
        id: seizure.id,
        date: seizure.occurredAt,
        features: {
          hour: date.getHours(),
          dayOfWeek: date.getDay(),
          weekOfMonth: Math.floor(date.getDate() / 7),
          month: date.getMonth(),
          duration: seizure.duration,
          triggers: seizure.triggers,
          symptoms: seizure.symptoms,
          aiConfidence: seizure.aiConfidence,
        },
      };
    });

    const stats = {
      totalSeizures: seizures.length,
      dateRange: {
        from: startDate,
        to: new Date(),
      },
      commonTriggers: this._getMostCommon(seizures, "triggers"),
      commonSymptoms: this._getMostCommon(seizures, "symptoms"),
      hourDistribution: this._getHourDistribution(seizures),
      dayDistribution: this._getDayDistribution(seizures),
    };

    return {
      success: true,
      stats,
      data: trainingData,
    };
  }

  _getMostCommon(seizures, field) {
    const counts = {};
    seizures.forEach((seizure) => {
      const items = seizure[field];
      if (items && Array.isArray(items)) {
        items.forEach((item) => {
          counts[item] = (counts[item] || 0) + 1;
        });
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 5).map(([item, count]) => ({ item, count }));
  }

  _getHourDistribution(seizures) {
    const distribution = Array(24).fill(0);
    seizures.forEach((seizure) => {
      const hour = new Date(seizure.occurredAt).getHours();
      distribution[hour]++;
    });
    return distribution.map((count, hour) => ({ hour, count }));
  }

  _getDayDistribution(seizures) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const distribution = Array(7).fill(0);
    seizures.forEach((seizure) => {
      const day = new Date(seizure.occurredAt).getDay();
      distribution[day]++;
    });
    return distribution.map((count, index) => ({ day: days[index], count }));
  }

  _calculateHourRisks(seizures) {
    const hourCounts = Array(24).fill(0);
    seizures.forEach((seizure) => {
      const hour = new Date(seizure.occurredAt).getHours();
      hourCounts[hour]++;
    });
    const maxCount = Math.max(...hourCounts);
    if (maxCount === 0) return hourCounts.map(() => 0);
    return hourCounts.map((count) => count / maxCount);
  }

  _calculateDayRisks(seizures) {
    const dayCounts = Array(7).fill(0);
    seizures.forEach((seizure) => {
      const day = new Date(seizure.occurredAt).getDay();
      dayCounts[day]++;
    });
    const maxCount = Math.max(...dayCounts);
    if (maxCount === 0) return dayCounts.map(() => 0);
    return dayCounts.map((count) => count / maxCount);
  }

  _calculateTriggerRisks(seizures) {
    const triggerCounts = {};
    seizures.forEach((seizure) => {
      const triggers = seizure.triggers;
      if (triggers && Array.isArray(triggers)) {
        triggers.forEach((trigger) => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
    });
    const totalSeizures = seizures.length;
    const triggerRisks = {};
    for (const [trigger, count] of Object.entries(triggerCounts)) {
      triggerRisks[trigger] = count / totalSeizures;
    }
    return triggerRisks;
  }

  _calculateRecentTrend(seizures) {
    const now = new Date();
    const last30Start = new Date();
    last30Start.setDate(now.getDate() - 30);
    const previous30Start = new Date();
    previous30Start.setDate(now.getDate() - 60);

    const last30Count = seizures.filter(
      (s) => new Date(s.occurredAt) >= last30Start,
    ).length;
    const previous30Count = seizures.filter((s) => {
      const date = new Date(s.occurredAt);
      return date >= previous30Start && date < last30Start;
    }).length;

    if (previous30Count === 0) return 0.1;
    const trend = (last30Count - previous30Count) / previous30Count;
    return Math.max(0, Math.min(0.5, trend / 2));
  }

  async predictRisk(userId, days = 7) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const seizures = await prisma.seizure.findMany({
      where: {
        userId,
        occurredAt: {
          gte: startDate,
        },
      },
      orderBy: {
        occurredAt: "asc",
      },
    });

    if (seizures.length === 0) {
      const predictions = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        predictions.push({
          date: date.toISOString().split("T")[0],
          riskScore: 0.1,
          riskLevel: "Low",
          factors: ["No historical data available"],
          recommendation: "Continue logging seizures for better predictions",
        });
      }
      return {
        success: true,
        hasData: false,
        predictions,
      };
    }

    const hourRisks = this._calculateHourRisks(seizures);
    const dayRisks = this._calculateDayRisks(seizures);
    const recentTrend = this._calculateRecentTrend(seizures);

    const predictions = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();

      let riskScore = 0.3;
      if (hourRisks[hour]) {
        riskScore += hourRisks[hour] * 0.3;
      }
      if (dayRisks[dayOfWeek]) {
        riskScore += dayRisks[dayOfWeek] * 0.3;
      }
      if (recentTrend > 0) {
        riskScore += recentTrend * 0.2;
      }
      riskScore = Math.min(riskScore, 0.95);

      let riskLevel = "Low";
      if (riskScore > 0.7) riskLevel = "High";
      else if (riskScore > 0.4) riskLevel = "Medium";

      const factors = [];
      if (hourRisks[hour] > 0.3) {
        factors.push(
          `Historical pattern: ${hour}:00 has higher seizure frequency`,
        );
      }
      if (dayRisks[dayOfWeek] > 0.3) {
        factors.push(
          `${date.toLocaleDateString("en-US", { weekday: "long" })} is a higher risk day`,
        );
      }
      if (recentTrend > 0.3) {
        factors.push("Recent increase in seizure frequency");
      }

      let recommendation = "Continue normal routine";
      if (riskLevel === "High") {
        recommendation =
          "Consider extra rest, ensure medication taken on time, avoid known triggers";
      } else if (riskLevel === "Medium") {
        recommendation =
          "Be mindful of triggers, maintain regular sleep schedule";
      }

      predictions.push({
        date: date.toISOString().split("T")[0],
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
        riskScore: Math.round(riskScore * 100) / 100,
        riskLevel,
        factors: factors.length
          ? factors
          : ["Based on general pattern analysis"],
        recommendation,
      });
    }

    return {
      success: true,
      hasData: true,
      summary: {
        totalSeizures: seizures.length,
        averageRiskScore:
          Math.round(
            (predictions.reduce((sum, p) => sum + p.riskScore, 0) / days) * 100,
          ) / 100,
        highestRiskDay: predictions.reduce(
          (max, p) => (p.riskScore > max.riskScore ? p : max),
          predictions[0],
        ),
        commonTriggers: this._getMostCommon(seizures, "triggers"),
      },
      predictions,
    };
  }

  async getMedicationInsights(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const medications = await prisma.medication.findMany({
      where: { userId },
    });

    if (medications.length === 0) {
      return {
        success: true,
        hasMedications: false,
        message: "No medications added yet. Add medications to get insights.",
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const adherenceRecords = await prisma.medicationAdherence.findMany({
      where: {
        userId,
        scheduledFor: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    const insights = [];

    for (const med of medications) {
      const medRecords = adherenceRecords.filter(
        (a) => a.medicationId === med.id,
      );

      const totalDoses = medRecords.length;
      const takenDoses = medRecords.filter((a) => a.status === "taken").length;
      const missedDoses = medRecords.filter(
        (a) => a.status === "missed",
      ).length;
      const lateDoses = medRecords.filter((a) => a.status === "late").length;

      const adherenceRate =
        totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

      const missedByHour = {};
      medRecords
        .filter((a) => a.status === "missed" || a.status === "late")
        .forEach((record) => {
          const hour = new Date(record.scheduledFor).getHours();
          missedByHour[hour] = (missedByHour[hour] || 0) + 1;
        });

      let worstHour = null;
      let maxMissed = 0;
      for (const [hour, count] of Object.entries(missedByHour)) {
        if (count > maxMissed) {
          maxMissed = count;
          worstHour = parseInt(hour);
        }
      }

      let insight = "";
      let suggestion = "";
      let riskLevel = "Good";

      if (adherenceRate >= 90) {
        insight = `Excellent adherence! You've taken ${med.name} on time ${adherenceRate}% of the time.`;
        suggestion =
          "Keep up the great work! Consistency helps prevent seizures.";
        riskLevel = "Good";
      } else if (adherenceRate >= 70) {
        insight = `Good adherence at ${adherenceRate}%, but there's room for improvement.`;
        if (worstHour !== null) {
          const timeStr =
            worstHour < 12
              ? `${worstHour} AM`
              : worstHour === 12
                ? "12 PM"
                : `${worstHour - 12} PM`;
          suggestion = `You most often miss your ${med.name} dose at ${timeStr}. Consider setting a stronger reminder.`;
        } else {
          suggestion = "Try setting a daily alarm to stay consistent.";
        }
        riskLevel = "Medium";
      } else {
        insight = `Adherence for ${med.name} is ${adherenceRate}%. This is below recommended levels.`;
        suggestion =
          "Missing medication can increase seizure risk. Consider using a pill organizer or setting multiple reminders.";
        riskLevel = "Needs Attention";
      }

      insights.push({
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        adherenceRate,
        totalDoses: totalDoses || 0,
        takenDoses,
        missedDoses,
        lateDoses,
        insight,
        suggestion,
        riskLevel,
        worstTime: worstHour !== null ? `${worstHour}:00` : null,
      });
    }

    const totalRecords = adherenceRecords.length;
    const totalTaken = adherenceRecords.filter(
      (a) => a.status === "taken",
    ).length;
    const overallAdherence =
      totalRecords > 0 ? Math.round((totalTaken / totalRecords) * 100) : 0;

    return {
      success: true,
      hasMedications: true,
      overallAdherence,
      insights,
      recommendations: this._generateMedicationRecommendations(
        insights,
        overallAdherence,
      ),
    };
  }

  async getSmartReminder(userId, medicationId = null) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const whereClause = { userId };
    if (medicationId) {
      whereClause.id = medicationId;
    }

    const medications = await prisma.medication.findMany({
      where: whereClause,
    });

    if (medications.length === 0) {
      return {
        success: true,
        hasMedications: false,
        message: "No medications found. Add medications first.",
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSeizures = await prisma.seizure.findMany({
      where: {
        userId,
        occurredAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const seizureHours = {};
    recentSeizures.forEach((seizure) => {
      const hour = new Date(seizure.occurredAt).getHours();
      seizureHours[hour] = (seizureHours[hour] || 0) + 1;
    });

    let peakHour = 9;
    let maxCount = 0;
    for (const [hour, count] of Object.entries(seizureHours)) {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    }

    const adherenceRecords = await prisma.medicationAdherence.findMany({
      where: {
        userId,
        scheduledFor: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const reminders = [];

    for (const med of medications) {
      const medRecords = adherenceRecords.filter(
        (a) => a.medicationId === med.id,
      );

      const successByHour = {};
      medRecords
        .filter((a) => a.status === "taken")
        .forEach((record) => {
          const hour = new Date(record.scheduledFor).getHours();
          successByHour[hour] = (successByHour[hour] || 0) + 1;
        });

      let bestHour = 9;
      let bestCount = 0;
      for (const [hour, count] of Object.entries(successByHour)) {
        if (count > bestCount) {
          bestCount = count;
          bestHour = parseInt(hour);
        }
      }

      let suggestedHour = peakHour - 1;
      if (suggestedHour < 0) suggestedHour = 0;
      if (suggestedHour > 23) suggestedHour = 23;

      if (bestCount > 0) {
        suggestedHour = bestHour;
      }

      const suggestedTime = `${suggestedHour.toString().padStart(2, "0")}:00`;
      const timeStr =
        suggestedHour < 12
          ? `${suggestedHour} AM`
          : suggestedHour === 12
            ? "12 PM"
            : `${suggestedHour - 12} PM`;

      reminders.push({
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        suggestedTime,
        displayTime: timeStr,
        reason:
          recentSeizures.length > 0 && peakHour !== 9
            ? `Based on your seizure patterns, taking medication at ${timeStr} may be most effective.`
            : "Standard morning reminder suggested.",
        currentAdherence:
          medRecords.length > 0
            ? Math.round(
                (medRecords.filter((a) => a.status === "taken").length /
                  medRecords.length) *
                  100,
              )
            : null,
      });
    }

    return {
      success: true,
      reminders,
      note: "These are AI-suggested times. Consult your doctor before changing medication schedules.",
    };
  }

  _generateMedicationRecommendations(insights, overallAdherence) {
    const recommendations = [];

    if (overallAdherence < 80) {
      recommendations.push({
        type: "priority",
        message:
          "Your overall adherence is below 80%. Consider setting up medication reminders.",
      });
    }

    const needsAttention = insights.filter(
      (i) => i.riskLevel === "Needs Attention",
    );
    if (needsAttention.length > 0) {
      recommendations.push({
        type: "warning",
        message: `Pay special attention to: ${needsAttention.map((i) => i.medicationName).join(", ")}.`,
      });
    }

    const missedPatterns = insights.filter((i) => i.worstTime);
    if (missedPatterns.length > 0) {
      recommendations.push({
        type: "tip",
        message: `You often miss ${missedPatterns[0].medicationName} around ${missedPatterns[0].worstTime}. Set a phone alarm for this time.`,
      });
    }

    if (recommendations.length === 0 && overallAdherence >= 90) {
      recommendations.push({
        type: "positive",
        message:
          "Excellent adherence! Keep up the good work - consistency helps prevent seizures.",
      });
    }

    return recommendations;
  }

  // ==================== PHASE B6: CHAT ASSISTANT ====================

  async chat(userId, message, conversationId = null) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!message || message.trim().length < 2) {
      throw new Error("Message must be at least 2 characters");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentSeizures, medications, adherenceRecords] = await Promise.all([
      prisma.seizure.findMany({
        where: {
          userId,
          occurredAt: { gte: thirtyDaysAgo },
        },
        orderBy: { occurredAt: "desc" },
        take: 20,
      }),
      prisma.medication.findMany({
        where: { userId },
      }),
      prisma.medicationAdherence.findMany({
        where: {
          userId,
          scheduledFor: { gte: thirtyDaysAgo },
        },
        take: 50,
      }),
    ]);

    const totalRecords = adherenceRecords.length;
    const takenDoses = adherenceRecords.filter(
      (a) => a.status === "taken",
    ).length;
    const adherenceRate =
      totalRecords > 0 ? Math.round((takenDoses / totalRecords) * 100) : null;

    const seizureSummary =
      recentSeizures.length > 0
        ? recentSeizures.map((s) => ({
            date: s.occurredAt.toISOString().split("T")[0],
            duration: s.duration,
            triggers: s.triggers,
            type: s.seizureType,
          }))
        : [];

    const medicationSummary = medications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      times: m.times,
    }));

    const prompt = `
    You are NeuraTrack AI, a compassionate and knowledgeable epilepsy assistant. 
    Answer the user's question based on their personal health data provided below.
    
    IMPORTANT GUIDELINES:
    - Be warm, empathetic, and supportive
    - Base answers on their actual data when possible
    - Never give medical advice - always suggest consulting their doctor
    - If they ask about something not in their data, say so honestly
    - Keep responses concise (2-4 sentences) but helpful
    - If you detect emergency language (seizure now, injured, etc.), urge them to call emergency services
    
    USER'S DATA:
    - Recent Seizures (last 30 days): ${seizureSummary.length > 0 ? JSON.stringify(seizureSummary, null, 2) : "No seizures logged yet"}
    - Medications: ${medicationSummary.length > 0 ? JSON.stringify(medicationSummary, null, 2) : "No medications added yet"}
    - Medication Adherence Rate: ${adherenceRate !== null ? adherenceRate + "%" : "No adherence data yet"}
    - Total seizures logged: ${recentSeizures.length} in last 30 days
    
    USER'S QUESTION: "${message}"
    
    Respond conversationally, not as JSON. Be helpful and concise.
  `;

    const response = await gemini.generateContent(prompt);

    let conversation;

    if (conversationId) {
      // Add message to existing conversation
      // You need to update your schema to support multiple messages per conversation
      // For now, we'll update the existing record to append the new messages
      const existing = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId },
      });

      if (existing) {
        // Update existing conversation by appending new messages
        conversation = await prisma.aIConversation.update({
          where: { id: conversationId },
          data: {
            query: existing.query + "\n\n[New Query]: " + message,
            response: existing.response + "\n\n[New Response]: " + response,
            context: {
              ...existing.context,
              messagesAdded: (existing.context?.messagesAdded || 0) + 1,
              lastMessage: message,
              lastResponse: response,
              lastUpdated: new Date().toISOString(),
            },
          },
        });
      } else {
        // Conversation not found, create new one
        conversation = await prisma.aIConversation.create({
          data: {
            userId,
            query: message,
            response,
            context: {
              seizuresUsed: recentSeizures.length,
              medicationsUsed: medications.length,
              adherenceUsed: adherenceRate,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    } else {
      // Create new conversation
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          query: message,
          response,
          context: {
            seizuresUsed: recentSeizures.length,
            medicationsUsed: medications.length,
            adherenceUsed: adherenceRate,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return {
      success: true,
      data: {
        message: {
          id: conversation.id,
          role: "assistant",
          content: response,
          createdAt: new Date().toISOString(),
        },
        conversationId: conversation.id,
      },
    };
  }

  async getConversations(userId, limit = 20) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const formattedConversations = conversations.map((c) => ({
      id: c.id,
      title: c.query.substring(0, 50),
      lastMessagePreview: c.response.substring(0, 100),
      updatedAt: c.createdAt.toISOString(),
      messageCount: 2,
    }));

    return {
      success: true,
      data: formattedConversations,
    };
  }

  async getConversation(userId, conversationId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messages = [
      {
        id: conversation.id,
        role: "user",
        content: conversation.query,
        createdAt: conversation.createdAt.toISOString(),
      },
      {
        id: conversation.id + 1000000,
        role: "assistant",
        content: conversation.response,
        createdAt: conversation.createdAt.toISOString(),
      },
    ];

    return {
      success: true,
      data: {
        id: conversation.id,
        title: conversation.query.substring(0, 50),
        lastMessagePreview: conversation.response.substring(0, 100),
        updatedAt: conversation.createdAt.toISOString(),
        messageCount: 2,
        messages,
      },
    };
  }
}

module.exports = new AIService();
