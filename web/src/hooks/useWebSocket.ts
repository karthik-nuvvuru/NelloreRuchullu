'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { OrderStatus, TrackingEvent } from '@/types';

export interface WebSocketState<T> {
  lastMessage: T | null;
  isConnected: boolean;
  error: Error | null;
}

export function useWebSocket<T = any>(
  url: string | null,
  options?: {
    onMessage?: (message: T) => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
  },
): WebSocketState<T> & { sendMessage: (message: unknown) => void; reconnect: () => void } {
  const [state, setState] = useState<WebSocketState<T>>({
    lastMessage: null,
    isConnected: false,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);

  const connect = useCallback(() => {
    if (!url) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectCount.current = 0;
        setState((prev) => ({ ...prev, isConnected: true, error: null }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as T;
          setState((prev) => ({ ...prev, lastMessage: message }));
          options?.onMessage?.(message);
        } catch (e) {
          setState((prev) => ({
            ...prev,
            error: new Error('Failed to parse WebSocket message'),
          }));
        }
      };

      ws.onclose = () => {
        setState((prev) => ({ ...prev, isConnected: false }));

        if (reconnectCount.current < (options?.reconnectAttempts ?? 5)) {
          const delay = Math.min(1000 * Math.pow(2, reconnectCount.current), 30000);
          reconnectCount.current += 1;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        setState((prev) => ({
          ...prev,
          error: new Error('WebSocket connection error'),
        }));
      };
    } catch (e) {
      setState((prev) => ({
        ...prev,
        error: e instanceof Error ? e : new Error('Failed to create WebSocket'),
      }));
    }
  }, [url, options]);

  useEffect(() => {
    if (!url) {
      return;
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    ...state,
    sendMessage,
    reconnect: connect,
  };
}

export function useOrderWebSocket(orderId: string) {
  const [trackingHistory, setTrackingHistory] = useState<TrackingEvent[]>([]);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  // Backend route is at /api/v1/ws/ws/orders/{id} (double ws due to router prefix + path prefix)
  const wsUrl =
    orderId && typeof window !== 'undefined'
      ? `ws://${window.location.hostname}:8000/api/v1/ws/ws/orders/${orderId}`
      : null;

  const handleMessage = useCallback(
    (message: any) => {
      if (message.type === 'order_update') {
        setCurrentStatus(message.status);
        setEta(message.eta ?? null);

        setTrackingHistory((prev) => [
          ...prev,
          {
            status: message.status,
            timestamp: message.timestamp,
            message: message.message || `Order ${message.status}`,
          },
        ]);
      }
    },
    [],
  );

  const { isConnected, error } = useWebSocket(wsUrl, {
    onMessage: handleMessage,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  return {
    trackingHistory,
    currentStatus,
    eta,
    isConnected,
    error,
  };
}
