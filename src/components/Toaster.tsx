'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        duration: 2000,
        style: {
          background: '#1E1E4B',
          color: 'white',
          border: '1px solid #818CF8',
          borderRadius: '12px',
          fontSize: '0.9375rem',
          fontWeight: '500',
          boxShadow: '0 4px 20px rgba(67, 56, 202, 0.35)',
        },
      }}
    />
  );
}
