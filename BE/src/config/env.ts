import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

const optionalNumberWithDefault = (defaultValue: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return value;
  }, z.coerce.number().int().positive().default(defaultValue));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 chars"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1),
  AUTH_ALLOW_PLAINTEXT_FALLBACK: z
    .string()
    .transform((value) => value.toLowerCase() === "true")
    .default("false"),
  SMTP_HOST: optionalTrimmedString,
  SMTP_PORT: optionalNumberWithDefault(587),
  SMTP_SECURE: z
    .string()
    .transform((value) => value.toLowerCase() === "true")
    .default("false"),
  SMTP_USER: optionalTrimmedString,
  SMTP_PASS: optionalTrimmedString,
  SMTP_FROM: optionalTrimmedString,
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables: ${formatted}`);
}

export const env = parsed.data;
