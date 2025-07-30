/**
 * Example Validation Service Implementation
 * This service handles all validation logic for score updates
 */

import crypto from 'crypto';
import { ScoreUpdate, ActionToken, ValidationRules, AnomalyPattern } from './interfaces';

export class ValidationService {
  private readonly rules: ValidationRules = {
    maxScoreIncrement: 100,
    minTimeBetweenUpdates: 10, // seconds
    maxUpdatesPerMinute: 10,
    actionTokenTTL: 300, // 5 minutes
  };

  private readonly hmacSecret: string;

  constructor(hmacSecret: string) {
    this.hmacSecret = hmacSecret;
  }

  /**
   * Validates a score update request
   */
  async validateScoreUpdate(
    userId: string,
    scoreUpdate: ScoreUpdate,
    actionToken: ActionToken
  ): Promise<{ valid: boolean; error?: string }> {
    // 1. Validate action token
    const tokenValidation = await this.validateActionToken(actionToken, userId);
    if (!tokenValidation.valid) {
      return tokenValidation;
    }

    // 2. Validate score increment
    if (scoreUpdate.scoreIncrement > this.rules.maxScoreIncrement) {
      return {
        valid: false,
        error: `Score increment exceeds maximum allowed: ${this.rules.maxScoreIncrement}`,
      };
    }

    if (scoreUpdate.scoreIncrement <= 0) {
      return {
        valid: false,
        error: 'Score increment must be positive',
      };
    }

    // 3. Validate HMAC signature
    const signatureValid = this.validateHMAC(scoreUpdate);
    if (!signatureValid) {
      return {
        valid: false,
        error: 'Invalid signature',
      };
    }

    // 4. Check rate limits
    const rateLimitOk = await this.checkRateLimit(userId);
    if (!rateLimitOk) {
      return {
        valid: false,
        error: 'Rate limit exceeded',
      };
    }

    // 5. Check for anomalies
    const anomaly = await this.detectAnomalies(userId, scoreUpdate);
    if (anomaly && anomaly.severity === 'high') {
      return {
        valid: false,
        error: 'Suspicious activity detected',
      };
    }

    return { valid: true };
  }

  /**
   * Validates an action token
   */
  private async validateActionToken(
    token: ActionToken,
    userId: string
  ): Promise<{ valid: boolean; error?: string }> {
    // Check if token belongs to user
    if (token.userId !== userId) {
      return {
        valid: false,
        error: 'Token does not belong to user',
      };
    }

    // Check if token is already used
    if (token.used) {
      return {
        valid: false,
        error: 'Token already used',
      };
    }

    // Check if token is expired
    if (new Date() > new Date(token.expiresAt)) {
      return {
        valid: false,
        error: 'Token expired',
      };
    }

    return { valid: true };
  }

  /**
   * Validates HMAC signature
   */
  private validateHMAC(scoreUpdate: ScoreUpdate): boolean {
    try {
      const actionProof = JSON.parse(scoreUpdate.actionProof);
      const { signature, ...data } = actionProof;

      const expectedSignature = crypto
        .createHmac('sha256', this.hmacSecret)
        .update(JSON.stringify(data))
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks rate limiting for a user
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    // This would typically check Redis for rate limit counters
    // Example implementation:
    const key = `ratelimit:score:${userId}`;
    const window = 60; // 1 minute window
    
    // Pseudo-code for Redis rate limiting
    // const count = await redis.incr(key);
    // if (count === 1) {
    //   await redis.expire(key, window);
    // }
    // return count <= this.rules.maxUpdatesPerMinute;

    return true; // Placeholder
  }

  /**
   * Detects anomalous patterns in score updates
   */
  private async detectAnomalies(
    userId: string,
    scoreUpdate: ScoreUpdate
  ): Promise<AnomalyPattern | null> {
    // This would analyze user's score history for patterns
    // Example checks:
    // 1. Rapid score increases in short time
    // 2. Consistent timing between updates (bot-like behavior)
    // 3. Unusual score amounts compared to user's history
    // 4. Geographical impossibilities

    // Placeholder implementation
    const patterns: AnomalyPattern[] = [];

    // Check for rapid increases
    const recentUpdates = await this.getRecentUpdates(userId, 5);
    if (recentUpdates.length >= 5) {
      const totalIncrease = recentUpdates.reduce((sum, update) => sum + update.scoreChange, 0);
      const timeSpan = Date.now() - recentUpdates[0].timestamp.getTime();
      
      if (totalIncrease > 400 && timeSpan < 300000) { // 400 points in 5 minutes
        patterns.push({
          userId,
          pattern: 'rapid_increase',
          severity: 'high',
          detectedAt: new Date(),
          details: { totalIncrease, timeSpan },
        });
      }
    }

    // Check for consistent timing
    if (recentUpdates.length >= 3) {
      const intervals = [];
      for (let i = 1; i < recentUpdates.length; i++) {
        intervals.push(
          recentUpdates[i].timestamp.getTime() - recentUpdates[i - 1].timestamp.getTime()
        );
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => 
        sum + Math.pow(interval - avgInterval, 2), 0
      ) / intervals.length;
      
      if (variance < 1000) { // Very consistent timing
        patterns.push({
          userId,
          pattern: 'consistent_timing',
          severity: 'medium',
          detectedAt: new Date(),
          details: { avgInterval, variance },
        });
      }
    }

    return patterns.length > 0 ? patterns[0] : null;
  }

  /**
   * Gets recent score updates for a user
   */
  private async getRecentUpdates(userId: string, limit: number): Promise<any[]> {
    // This would query the database for recent updates
    // Placeholder implementation
    return [];
  }

  /**
   * Generates an action token for a user
   */
  async generateActionToken(
    userId: string,
    actionType: string
  ): Promise<ActionToken> {
    const token: ActionToken = {
      token: crypto.randomBytes(32).toString('hex'),
      userId,
      actionType,
      expiresAt: new Date(Date.now() + this.rules.actionTokenTTL * 1000),
      used: false,
      createdAt: new Date(),
    };

    // Store token in database/Redis
    await this.storeActionToken(token);

    return token;
  }

  /**
   * Stores action token
   */
  private async storeActionToken(token: ActionToken): Promise<void> {
    // Store in Redis with TTL
    // await redis.setex(
    //   `action_token:${token.token}`,
    //   this.rules.actionTokenTTL,
    //   JSON.stringify(token)
    // );
  }

  /**
   * Creates action proof with HMAC signature
   */
  createActionProof(
    actionStartTime: number,
    actionEndTime: number,
    actionData: Record<string, any>
  ): string {
    const proof = {
      actionStartTime,
      actionEndTime,
      clientChecksum: crypto.randomBytes(16).toString('hex'),
      actionData,
    };

    const signature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(JSON.stringify(proof))
      .digest('hex');

    return JSON.stringify({ ...proof, signature });
  }
}