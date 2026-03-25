'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: 'white',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '0.9375rem',
        },
      }}
    />
  );
}
