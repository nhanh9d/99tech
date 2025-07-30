/**
 * Example TypeScript interfaces for the Scoreboard API
 * This file provides type definitions that should be used throughout the implementation
 */

// User related interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  currentScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAuth extends User {
  passwordHash: string;
}

// Score related interfaces
export interface ScoreUpdate {
  actionId: string;
  scoreIncrement: number;
  timestamp: Date;
  actionProof: string;
}

export interface ScoreHistory {
  id: string;
  userId: string;
  actionId: string;
  scoreChange: number;
  newScore: number;
  actionType?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Scoreboard interfaces
export interface ScoreboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  lastUpdated?: Date;
}

export interface Scoreboard {
  scoreboard: ScoreboardEntry[];
  totalPlayers: number;
  lastUpdated: Date;
}

// Action token interfaces
export interface ActionToken {
  token: string;
  userId: string;
  actionType: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface ActionProof {
  actionStartTime: number;
  actionEndTime: number;
  clientChecksum: string;
  actionData: Record<string, any>;
  signature?: string;
}

// WebSocket event interfaces
export interface WebSocketEvent<T = any> {
  event: string;
  data: T;
  timestamp: Date;
}

export interface ScoreboardUpdateEvent {
  scoreboard: ScoreboardEntry[];
  changes: {
    entered: string[];
    exited: string[];
    moved: Array<{
      userId: string;
      oldRank: number;
      newRank: number;
    }>;
  };
  timestamp: Date;
}

export interface PersonalScoreUpdateEvent {
  userId: string;
  oldScore: number;
  newScore: number;
  rank: number;
  timestamp: Date;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: Omit<User, 'passwordHash'>;
}

export interface ScoreUpdateResponse {
  newScore: number;
  rank: number;
  scoreboard: ScoreboardEntry[];
}

// JWT Token payload
export interface JWTPayload {
  userId: string;
  username: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

// Validation rules
export interface ValidationRules {
  maxScoreIncrement: number;
  minTimeBetweenUpdates: number; // in seconds
  maxUpdatesPerMinute: number;
  actionTokenTTL: number; // in seconds
}

// Anomaly detection
export interface AnomalyPattern {
  userId: string;
  pattern: 'rapid_increase' | 'consistent_timing' | 'unusual_amount' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high';
  detectedAt: Date;
  details: Record<string, any>;
}