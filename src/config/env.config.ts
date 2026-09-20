import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 3000),

  REDIS_URL: requiredEnv("REDIS_URL"),

  TEMPORAL_ADDRESS: requiredEnv("TEMPORAL_ADDRESS"),

  TEMPORAL_NAMESPACE:
    process.env.TEMPORAL_NAMESPACE || "default",

  TEMPORAL_TASK_QUEUE:
    process.env.TEMPORAL_TASK_QUEUE || "hotel-offer-task-queue",
} as const;