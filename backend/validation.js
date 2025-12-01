/**
 * Server-side validation schemas using Zod
 */

const { z } = require("zod");

// Channel validation schema
const channelSchema = z.object({
  name: z.string()
    .min(1, "Le nom du canal est requis")
    .max(100, "Le nom du canal est trop long (max 100 caractères)")
    .trim(),
  description: z.string()
    .max(500, "La description est trop longue (max 500 caractères)")
    .optional()
    .default(""),
  icon: z.string()
    .max(2, "L'icône doit être un emoji (max 2 caractères)")
    .optional()
    .default("💬"),
  voice_channel: z.boolean()
    .optional()
    .default(false),
});

// Message validation schema
const messageSchema = z.object({
  message: z.string()
    .max(2000, "Le message est trop long (max 2000 caractères)")
    .optional()
    .default(""),
  channel_id: z.number().int().positive().nullable().optional(),
  recipient_id: z.number().int().positive().nullable().optional(),
  reply_to_id: z.number().int().positive().nullable().optional(),
  file_path: z.string().nullable().optional(),
  file_name: z.string().nullable().optional(),
  file_type: z.string().nullable().optional(),
  file_size: z.number().int().nonnegative().nullable().optional(),
});

// User profile validation schema
const userProfileSchema = z.object({
  bio: z.string()
    .max(200, "La bio est trop longue (max 200 caractères)")
    .optional()
    .nullable(),
  avatar: z.string()
    .url("L'avatar doit être une URL valide")
    .optional()
    .nullable(),
  avatar_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "La couleur doit être au format hexadécimal (#RRGGBB)")
    .optional()
    .nullable(),
  status: z.enum(["online", "away", "busy", "offline"])
    .optional(),
});

// Sanitize string to prevent XSS
function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Sanitize object recursively
function sanitizeObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return typeof obj === "string" ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
}

// Validate and sanitize channel data
function validateChannel(data) {
  try {
    const validated = channelSchema.parse(data);
    return {
      success: true,
      data: {
        ...validated,
        name: sanitizeString(validated.name),
        description: validated.description ? sanitizeString(validated.description) : "",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || "Erreur de validation",
    };
  }
}

// Validate and sanitize message data
function validateMessage(data) {
  try {
    const validated = messageSchema.parse(data);
    return {
      success: true,
      data: {
        ...validated,
        message: validated.message ? sanitizeString(validated.message) : "",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || "Erreur de validation",
    };
  }
}

// Validate and sanitize user profile data
function validateUserProfile(data) {
  try {
    const validated = userProfileSchema.parse(data);
    return {
      success: true,
      data: {
        ...validated,
        bio: validated.bio ? sanitizeString(validated.bio) : null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || "Erreur de validation",
    };
  }
}

module.exports = {
  validateChannel,
  validateMessage,
  validateUserProfile,
  sanitizeString,
  sanitizeObject,
};

