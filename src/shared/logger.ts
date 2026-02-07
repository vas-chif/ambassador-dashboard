/**
 * @file logger.ts
 * @description Secure logger service with PII redaction and environment-aware logging.
 * @author Vasile Chifeac (AI Agent)
 * @created 2026-02-06
 * @modified 2026-02-06
 *
 * @example
 * import { useSecureLogger } from 'src/shared/logger';
 * const logger = useSecureLogger();
 * logger.info('User logged in', { uid: '123' });
 */

const isDev = import.meta.env.DEV;

// PII Patterns to redact
const PII_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[- ]?)?\d{10}/g, // Simple phone pattern
  CREDIT_CARD: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g,
};

const redact = (message: string): string => {
  if (typeof message !== 'string') return message;
  return message
    .replace(PII_PATTERNS.EMAIL, '[EMAIL]')
    .replace(PII_PATTERNS.PHONE, '[PHONE]')
    .replace(PII_PATTERNS.CREDIT_CARD, '[CC]');
};

const redactData = (data: unknown): unknown => {
  if (!data) return data;
  if (typeof data === 'string') return redact(data);
  if (typeof data === 'object') {
    const stringified = JSON.stringify(data);
    const redacted = redact(stringified);
    return JSON.parse(redacted);
  }
  return data;
};

export const useSecureLogger = () => {
  return {
    info: (message: string, data?: unknown) => {
      if (isDev) {
        console.log(`[INFO] ${message}`, data ? redactData(data) : '');
      }
    },
    warn: (message: string, data?: unknown) => {
      if (isDev) {
        console.warn(`[WARN] ${message}`, data ? redactData(data) : '');
      }
    },
    error: (message: string, error?: unknown) => {
      // Errors are always logged, but redacted
      console.error(`[ERROR] ${message}`, error ? redactData(error) : '');
    },
    debug: (message: string, data?: unknown) => {
      if (isDev) {
        console.debug(`[DEBUG] ${message}`, data ? redactData(data) : '');
      }
    },
  };
};
