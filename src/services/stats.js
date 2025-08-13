/**
 * Module: Services/Stats
 * Responsibility:
 * - Provide pure utility functions to compute ranks of a given metric
 *   relative to stored game sessions.
 * - No side effects; operates over the provided gameStats object.
 * Data Model:
 * - gameStats: {
 *     gameSessionStats: Array<{
 *       averageHitRate: number,
 *       score: number,
 *       accuracy?: number
 *     }>
 *   }
 */

/**
 * Return 1-based rank of a rate among all sessions (higher is better).
 * @param {{gameSessionStats?: Array<{averageHitRate:number}>}} gameStats
 * @param {number} rate
 * @returns {number} 1-based rank, or 0 if not found
 */
export function calculateRateRank(gameStats, rate) {
  const sorted = (gameStats?.gameSessionStats || [])
    .map(g => g.averageHitRate)
    .sort((a, b) => b - a);
  return sorted.indexOf(rate) + 1;
}

/**
 * Return 1-based rank of a score among all sessions (higher is better).
 * @param {{gameSessionStats?: Array<{score:number}>}} gameStats
 * @param {number} score
 * @returns {number} 1-based rank, or 0 if not found
 */
export function calculateScoreRank(gameStats, score) {
  const sorted = (gameStats?.gameSessionStats || [])
    .map(g => g.score)
    .sort((a, b) => b - a);
  return sorted.indexOf(score) + 1;
}

/**
 * Return 1-based rank of an accuracy among all sessions (higher is better).
 * @param {{gameSessionStats?: Array<{accuracy?:number}>}} gameStats
 * @param {number} accuracy
 * @returns {number} 1-based rank, or 0 if not found
 */
export function calculateAccuracyRank(gameStats, accuracy) {
  const sorted = (gameStats?.gameSessionStats || [])
    .map(g => g.accuracy || 0)
    .sort((a, b) => b - a);
  return sorted.indexOf(accuracy) + 1;
}