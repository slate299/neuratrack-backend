// backend/src/config/sentry.js

const Sentry = require("@sentry/node");

let isInitialized = false;

const initSentry = () => {
  // Only initialize in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Sentry disabled in development mode");
    return false;
  }

  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn("Sentry DSN not configured. Skipping Sentry initialization.");
    return false;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.2,
      sendDefaultPii: true,
    });
    isInitialized = true;
    console.log("✅ Sentry initialized for backend");
    return true;
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
    return false;
  }
};

const captureException = (error, context) => {
  if (isInitialized && process.env.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error("Error captured:", error, context);
  }
};

module.exports = {
  initSentry,
  captureException,
  Sentry,
};
