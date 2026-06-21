import dotenv from "dotenv";

dotenv.config();

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(name: string, fallback: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
}

export const env = {
  nodeEnv: getOptionalEnv("NODE_ENV", "development"),
  port: getOptionalEnv("PORT", "3000"),
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  corsOrigins: getOptionalEnv("CORS_ORIGIN", "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};