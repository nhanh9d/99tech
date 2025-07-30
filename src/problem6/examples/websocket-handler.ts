/**
 * Example WebSocket Handler Implementation
 * This handles real-time scoreboard updates using Socket.io
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { JWTPayload, ScoreboardUpdateEvent, PersonalScoreUpdateEvent } from './interfaces';
import jwt from 'jsonwebtoken';

export class WebSocketHandler {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        socket.data.user = decoded;

        // Track user socket
        this.addUserSocket(decoded.userId, socket.id);

        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User ${socket.data.user.userId} connected`);

      // Handle scoreboard subscription
      socket.on('subscribe:scoreboard', async () => {
        socket.join('scoreboard:updates');
        
        // Send current scoreboard
        const scoreboard = await this.getCurrentScoreboard();
        socket.emit('scoreboard:current', scoreboard);
      });

      // Handle unsubscribe
      socket.on('unsubscribe:scoreboard', () => {
        socket.leave('scoreboard:updates');
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.removeUserSocket(socket.data.user.userId, socket.id);
        console.log(`User ${socket.data.user.userId} disconnected`);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.data.user.userId}:`, error);
      });
    });
  }

  /**
   * Broadcast scoreboard update to all subscribed clients
   */
  async broadcastScoreboardUpdate(event: ScoreboardUpdateEvent): Promise<void> {
    this.io.to('scoreboard:updates').emit('scoreboard:update', {
      event: 'scoreboard:update',
      data: event,
      timestamp: new Date(),
    });

    // Log for monitoring
    console.log(`Broadcasted scoreboard update to ${
      this.io.sockets.adapter.rooms.get('scoreboard:updates')?.size || 0
    } clients`);
  }

  /**
   * Send personal score update to specific user
   */
  async sendPersonalScoreUpdate(
    userId: string,
    event: PersonalScoreUpdateEvent
  ): Promise<void> {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || socketIds.size === 0) {
      console.log(`User ${userId} not connected, skipping personal update`);
      return;
    }

    socketIds.forEach(socketId => {
      this.io.to(socketId).emit('score:personal:update', {
        event: 'score:personal:update',
        data: event,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Handle score update from Redis Pub/Sub
   */
  async handleScoreUpdate(message: string): Promise<void> {
    try {
      const update = JSON.parse(message);
      
      // Calculate scoreboard changes
      const scoreboardUpdate = await this.calculateScoreboardChanges(update);
      
      // Broadcast to all subscribers
      if (scoreboardUpdate.changes.entered.length > 0 ||
          scoreboardUpdate.changes.exited.length > 0 ||
          scoreboardUpdate.changes.moved.length > 0) {
        await this.broadcastScoreboardUpdate(scoreboardUpdate);
      }

      // Send personal update to the user
      await this.sendPersonalScoreUpdate(update.userId, {
        userId: update.userId,
        oldScore: update.oldScore,
        newScore: update.newScore,
        rank: update.rank,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error handling score update:', error);
    }
  }

  /**
   * Calculate scoreboard changes
   */
  private async calculateScoreboardChanges(
    update: any
  ): Promise<ScoreboardUpdateEvent> {
    // This would compare old and new scoreboards to find changes
    // Placeholder implementation
    const currentScoreboard = await this.getCurrentScoreboard();
    
    return {
      scoreboard: currentScoreboard,
      changes: {
        entered: [], // Users who entered top 10
        exited: [],  // Users who left top 10
        moved: [],   // Users who changed rank
      },
      timestamp: new Date(),
    };
  }

  /**
   * Get current scoreboard from cache/database
   */
  private async getCurrentScoreboard(): Promise<any[]> {
    // This would fetch from Redis cache or database
    // Placeholder implementation
    return [];
  }

  /**
   * Track user socket connections
   */
  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  /**
   * Remove user socket connection
   */
  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get total connections count
   */
  getTotalConnectionsCount(): number {
    let total = 0;
    this.userSockets.forEach(sockets => {
      total += sockets.size;
    });
    return total;
  }

  /**
   * Disconnect all sockets for a user (e.g., on logout)
   */
  disconnectUser(userId: string): void {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      });
      this.userSockets.delete(userId);
    }
  }
}