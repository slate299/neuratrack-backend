// src/services/twilio.service.js
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const whatsappFrom =
  process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"; // Use env var with fallback

const client = twilio(accountSid, authToken);

class TwilioService {
  /**
   * Send WhatsApp message to a recipient
   * @param {string} to - Phone number (e.g., +254799862291)
   * @param {string} body - Message content
   */
  async sendWhatsApp(to, body) {
    try {
      const message = await client.messages.create({
        to: `whatsapp:${to}`,
        from: whatsappFrom,
        body: body,
      });

      console.log(`✅ WhatsApp sent to ${to}: ${message.sid}`);
      return { success: true, sid: message.sid, channel: "whatsapp" };
    } catch (error) {
      console.error(`❌ Failed to send WhatsApp to ${to}:`, error.message);
      return { success: false, error: error.message, channel: "whatsapp" };
    }
  }

  /**
   * Send SMS as fallback (if WhatsApp fails)
   */
  async sendSMS(to, body) {
    try {
      const message = await client.messages.create({
        to: to,
        body: body,
        messagingServiceSid: messagingServiceSid,
      });

      console.log(`✅ SMS sent to ${to}: ${message.sid}`);
      return { success: true, sid: message.sid, channel: "sms" };
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${to}:`, error.message);
      return { success: false, error: error.message, channel: "sms" };
    }
  }

  /**
   * Send emergency alert via WhatsApp (primary) with SMS fallback
   */
  async sendEmergencyAlert(userName, contacts, options = {}) {
    const { location, message: userMessage, timestamp } = options;

    const timeStr = timestamp
      ? new Date(timestamp).toLocaleString()
      : new Date().toLocaleString();

    // Build the alert message
    let alertBody = `🚨 *EMERGENCY ALERT* from NeuraTrack\n\n`;
    alertBody += `*${userName}* has triggered an emergency alert.\n\n`;
    alertBody += `*Time:* ${timeStr}\n`;

    if (userMessage) {
      alertBody += `*Message:* ${userMessage}\n`;
    }

    if (location) {
      alertBody += `*Location:* ${location}\n`;
      alertBody += `📍 View map: https://maps.google.com/?q=${location}\n`;
    }

    alertBody += `\n_This is an automated alert from NeuraTrack._`;
    alertBody += `\n_Please contact ${userName} immediately._`;

    // Send to all contacts
    const results = [];
    for (const contact of contacts) {
      // Try WhatsApp first
      let result = await this.sendWhatsApp(contact.phone, alertBody);

      // If WhatsApp fails, fallback to SMS
      if (!result.success) {
        console.log(
          `WhatsApp failed for ${contact.phone}, falling back to SMS`,
        );
        result = await this.sendSMS(contact.phone, alertBody);
      }

      results.push({
        name: contact.name,
        phone: contact.phone,
        ...result,
      });
    }

    return {
      sentCount: results.filter((r) => r.success).length,
      totalCount: contacts.length,
      results,
    };
  }
}

module.exports = new TwilioService();
