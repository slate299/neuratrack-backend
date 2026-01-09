//src/middleware/validators.js
const { body, validationResult } = require("express-validator");

// Validate seizure creation
exports.validateSeizure = [
  body("occurredAt")
    .notEmpty()
    .withMessage("occurredAt is required")
    .isISO8601()
    .withMessage("occurredAt must be a valid date"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("duration must be a positive integer"),
  body("notes").optional().isString().withMessage("notes must be a string"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate medication creation
exports.validateMedication = [
  body("name").notEmpty().withMessage("Medication name is required"),
  body("dosage").notEmpty().withMessage("Dosage is required"),
  body("frequency").notEmpty().withMessage("Frequency is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
