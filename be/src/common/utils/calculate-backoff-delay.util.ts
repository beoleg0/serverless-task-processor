/**
 * Calculates the exponential backoff delay for retries
 * @param attempt The current retry attempt (0-based)
 * @param baseDelayMs The base delay in milliseconds
 * @returns The calculated delay in milliseconds
 */
export function calculateBackoffDelay(attempt: number, baseDelayMs: number = 1000): number {
  // Base formula: baseDelay * 2^attempt with jitter
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  // Add jitter (random delay between 0-100% of the calculated delay)
  const jitter = Math.random() * exponentialDelay;
  return Math.floor(exponentialDelay + jitter);
}
