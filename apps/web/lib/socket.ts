import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Room operations
  createRoom(playerName: string): Promise<{ roomId: string; playerId: string }> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('create-room', { playerName }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  joinRoom(roomId: string, playerName: string): Promise<{ roomId: string; playerId: string }> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('join-room', { roomId, playerName }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Day operations
  submitDayAction(day: number, action: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('day-action', { day, action, data }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  // Event listeners with automatic cleanup tracking
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback as any);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback as any);
    } else {
      this.listeners.get(event)?.forEach(cb => {
        this.socket?.off(event, cb as any);
      });
      this.listeners.delete(event);
    }
  }

  // Cleanup all listeners
  removeAllListeners(): void {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => {
        this.socket?.off(event, cb as any);
      });
    });
    this.listeners.clear();
  }
}

// Singleton instance
export const socketClient = new SocketClient();

// React hook for socket
export function useSocket() {
  return socketClient;
}
