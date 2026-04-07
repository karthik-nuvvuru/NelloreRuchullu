'use client';

import { useRef, useEffect } from 'react';
import type { Order, OrderStatus, TrackingEvent } from '@/types';

const STATUS_ORDER: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'out-for-delivery',
  'delivered',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  'placed': 'Order Placed',
  'confirmed': 'Confirmed',
  'preparing': 'Preparing',
  'ready': 'Ready for Pickup',
  'out-for-delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
};

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  'placed': 'Your order has been received and is being processed.',
  'confirmed': 'The restaurant has confirmed your order.',
  'preparing': 'Our chefs are preparing your delicious meal.',
  'ready': 'Your order is ready for delivery!',
  'out-for-delivery': 'Your order is on its way to you.',
  'delivered': 'Your order has been delivered. Enjoy your meal!',
  'cancelled': 'This order has been cancelled.',
};

interface OrderTrackerProps {
  order: Order;
  trackingHistory?: TrackingEvent[];
  isConnected?: boolean;
}

export default function OrderTracker({ order, trackingHistory, isConnected }: OrderTrackerProps) {
  const currentStatus = order.status;
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = isCancelled ? -1 : STATUS_ORDER.indexOf(currentStatus);

  const timelineRef = useRef<HTMLDivElement>(null);

  const allEvents: TrackingEvent[] = [
    ...(trackingHistory || []),
    { status: order.status, timestamp: order.updatedAt, message: STATUS_MESSAGES[order.status] },
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
        {isConnected && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            Live
          </span>
        )}
      </div>

      {isCancelled ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <h3 className="font-medium">This order has been cancelled</h3>
          <p className="mt-1 text-sm text-red-600">
            If you were charged, a refund will be processed shortly.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Estimated delivery</p>
            <p className="text-3xl font-bold text-gray-900">
              {order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Calculating...'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="overflow-hidden rounded-full bg-gray-200 h-2">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / STATUS_ORDER.length) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              {STATUS_ORDER.map((status) => {
                const isActive = currentIndex >= STATUS_ORDER.indexOf(status);
                const isCurrent = currentStatus === status;
                return (
                  <span
                    key={status}
                    className={`text-center transition-colors ${
                      isCurrent ? 'font-semibold text-primary-500' : isActive ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">
                {STATUS_LABELS[currentStatus]}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{STATUS_MESSAGES[currentStatus]}</p>
            </div>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} className="space-y-4">
            <h3 className="font-medium text-gray-900">Activity History</h3>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-4">
              {allEvents.map((event, index) => (
                <div key={index} className="relative pl-6">
                  <div className={`absolute -left-1.5 mt-1.5 size-3 rounded-full ${
                    new Date(event.timestamp).getTime() === new Date(order.updatedAt).getTime()
                      ? 'bg-primary-500'
                      : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {STATUS_LABELS[event.status] || event.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
