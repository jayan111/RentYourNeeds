'use client';

import { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AnimatePresence mode="wait" initial={false}>
        {children}
      </AnimatePresence>
    </Provider>
  );
}