'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ 
  children,
}: { 
  children: React.ReactNode
}) {
  console.log('SessionProvider is rendering')
  
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
} 