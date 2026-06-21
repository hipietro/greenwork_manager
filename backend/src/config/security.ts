import type { CorsOptions } from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./env";

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origine non consentita da CORS."));
  },
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Troppi tentativi di accesso. Riprova tra qualche minuto.",
  },
});