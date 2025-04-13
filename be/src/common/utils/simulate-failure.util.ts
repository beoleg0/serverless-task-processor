/**
 * Simulates task processing failures for testing the fault tolerance
 * @returns boolean indicating if processing should fail (true = fail)
 */
export function shouldSimulateFailure(): boolean {
  // Simulate 30% failure rate as per requirements
  return Math.random() < 0.3;
}
